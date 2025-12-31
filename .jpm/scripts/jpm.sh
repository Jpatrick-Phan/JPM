#!/bin/bash

# JPM: Jatrick Project Manager CLI
# Usage: jpm [command] [args]

JPM_VERSION="1.0.0"

# 1. Auto-detect JPM_HOME (Global Tool Location)
# Get the directory where this script resides
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# JPM_HOME is the parent directory of scripts/
JPM_HOME="$(dirname "$SCRIPT_DIR")"

# 2. Define Project Local Paths
PROJECT_JPM="./.jpm"
PROJECT_STORAGE="$PROJECT_JPM/storage"
PROJECT_CONTEXT="$PROJECT_JPM/context"

# 3. Define Core Paths (from JPM_HOME)
TEMPLATE_DIR="$JPM_HOME/templates"
CORE_DIR="$JPM_HOME/core"
SCRIPTS_DIR="$JPM_HOME/scripts"

function show_help {
    echo "JPM: Jatrick Project Manager (Global CLI Edition) v$JPM_VERSION"
    echo "JPM_HOME: $JPM_HOME"
    echo "Usage:"
    echo "  jpm init             Initialize JPM in current project"
    echo "  jpm plan [feature]   Create a PRD draft"
    echo "  jpm design [feature] Create an Architecture draft"
    echo "  jpm split [feature]  Create Task drafts"
    echo "  jpm sync             Sync local tasks to GitHub"
    echo "  jpm run [task_id]    Prepare execution context"
    echo "  jpm issue [cmd]      Manage issues (list, close)"
    echo "  jpm config [k] [v]   Set configuration (provider, api_key)"
    echo "  jpm gen [in] [out]   Generate content using AI"
    echo "  jpm -v, --version    Show version information"
}

function check_init {
    if [ ! -d "$PROJECT_JPM" ]; then
        echo "Error: JPM is not initialized in this project."
        echo "Run 'jpm init' to create .jpm structure."
        exit 1
    fi
}

case "$1" in
    -v|--version)
        echo "JPM version $JPM_VERSION"
        ;;
    init)
        echo "Initializing JPM Project Structure..."
        
        # Create local project structure
        mkdir -p "$PROJECT_JPM"/{context,storage/{prds,epics,tasks}}
        
        # Create project-map.json if not exists
        if [ ! -f "$PROJECT_CONTEXT/project-map.json" ]; then
            echo "{ \"project\": \"$(basename "$PWD")\", \"version\": \"0.1.0\", \"features\": [] }" > "$PROJECT_CONTEXT/project-map.json"
            echo "Created $PROJECT_CONTEXT/project-map.json"
        fi

        # Initialize GitHub labels (Optional, requires gh cli)
        if [ -f "$SCRIPTS_DIR/gh-sync.sh" ]; then
            if command -v gh &> /dev/null; then
                 bash "$SCRIPTS_DIR/gh-sync.sh" setup-labels
            else
                 echo "Skipping GitHub labels setup (gh cli not found)."
            fi
        fi
        
        echo "Initialization complete. JPM is ready in $PROJECT_JPM"
        ;;
    plan)
        check_init
        FEATURE=$2
        REQUIREMENTS="${@:3}" # Capture all remaining args as requirements
        
        if [ -z "$FEATURE" ]; then echo "Usage: jpm plan [feature_name] [optional: requirements]"; exit 1; fi
        
        TARGET="$PROJECT_STORAGE/prds/prd-$FEATURE.md"
        if [ -f "$TARGET" ]; then echo "PRD already exists: $TARGET"; exit 1; fi
        
        # Copy from Global Template
        if [ -f "$TEMPLATE_DIR/PRD_TEMPLATE.md" ]; then
            cp "$TEMPLATE_DIR/PRD_TEMPLATE.md" "$TARGET"
            
            if [ -n "$REQUIREMENTS" ]; then
                echo "Generating PRD content with AI based on requirements..."
                TEMP_PROMPT=$(mktemp)
                echo "You are a Product Manager. Fill the following PRD template based on this requirement: '$REQUIREMENTS'" > "$TEMP_PROMPT"
                echo "--- TEMPLATE ---" >> "$TEMP_PROMPT"
                cat "$TARGET" >> "$TEMP_PROMPT"
                
                bash "$SCRIPTS_DIR/ai.sh" generate "$TEMP_PROMPT" "$TARGET"
                rm "$TEMP_PROMPT"
                echo "PRD generated at $TARGET"
            else
                echo "Created PRD draft: $TARGET"
                echo "Tip: You can now edit this file or use 'jpm gen' to fill it."
            fi
        else
            echo "Error: Template not found at $TEMPLATE_DIR/PRD_TEMPLATE.md"
            exit 1
        fi
        ;;
    design)
        check_init
        FEATURE=$2
        if [ -z "$FEATURE" ]; then echo "Usage: jpm design [feature_name]"; exit 1; fi
        
        TARGET="$PROJECT_STORAGE/epics/arch-$FEATURE.md"
        PRD_SOURCE="$PROJECT_STORAGE/prds/prd-$FEATURE.md"
        
        if [ -f "$TARGET" ]; then echo "Architecture doc already exists: $TARGET"; exit 1; fi
        
        # Copy from Global Template
        if [ -f "$TEMPLATE_DIR/ARCHITECT_TEMPLATE.md" ]; then
            cp "$TEMPLATE_DIR/ARCHITECT_TEMPLATE.md" "$TARGET"
            
            if [ -f "$PRD_SOURCE" ]; then
                 echo "Found PRD: $PRD_SOURCE"
                 echo "Generating Architecture from PRD..."
                 
                 TEMP_PROMPT=$(mktemp)
                 echo "You are a System Architect. Design the system architecture based on the following PRD." > "$TEMP_PROMPT"
                 echo "Output must follow this template structure:" >> "$TEMP_PROMPT"
                 cat "$TARGET" >> "$TEMP_PROMPT"
                 echo "--- PRD CONTENT ---" >> "$TEMP_PROMPT"
                 cat "$PRD_SOURCE" >> "$TEMP_PROMPT"
                 
                 bash "$SCRIPTS_DIR/ai.sh" generate "$TEMP_PROMPT" "$TARGET"
                 rm "$TEMP_PROMPT"
                 echo "Architecture generated at $TARGET"
            else
                echo "Created Architecture draft: $TARGET"
                echo "Tip: No PRD found. You can manually edit this file."
            fi
        else
             echo "Error: Template not found at $TEMPLATE_DIR/ARCHITECT_TEMPLATE.md"
             exit 1
        fi
        ;;
    split)
        check_init
        FEATURE=$2
        if [ -z "$FEATURE" ]; then echo "Usage: jpm split [feature_name]"; exit 1; fi
        echo "Ready to split tasks for $FEATURE."
        echo "Action: Ask AI to 'Decompose arch-$FEATURE.md into tasks in $PROJECT_STORAGE/tasks/ using format task-[id]-[name].md'"
        ;;
    sync)
        check_init
        echo "Syncing tasks to GitHub..."
        # Iterate over all task files in storage/tasks
        # Use nullglob to handle empty directory
        shopt -s nullglob
        for TASK_FILE in "$PROJECT_STORAGE/tasks"/*.md; do
            # Check if file already has an Issue Link
            if grep -q "GitHub Issue:" "$TASK_FILE"; then
                continue # Already synced
            fi
            echo "Syncing $TASK_FILE..."
            bash "$SCRIPTS_DIR/gh-sync.sh" create-issue "$TASK_FILE"
        done
        shopt -u nullglob
        echo "Sync complete."
        ;;
    run)
        check_init
        TASK_ID=$2
        if [ -z "$TASK_ID" ]; then echo "Usage: jpm run [task_id]"; exit 1; fi
        
        # Find task in local storage
        TASK_FILE=$(find "$PROJECT_STORAGE/tasks" -name "*$TASK_ID*.md" | head -n 1)
        
        if [ -z "$TASK_FILE" ]; then echo "Task not found with ID: $TASK_ID"; exit 1; fi
        echo "---------------------------------------------------"
        echo "EXECUTING TASK: $TASK_FILE"
        echo "---------------------------------------------------"
        cat "$TASK_FILE"
        echo "---------------------------------------------------"
        echo "Copy the content above and paste it to AI."
        ;;
    issue)
        check_init
        CMD=$2
        # Pass through to gh-sync or handle here
        echo "Issue management not fully implemented in this version."
        ;;
    config)
        KEY=$2
        VALUE=$3
        CONFIG_FILE="$PROJECT_JPM/config.env"
        
        if [ -z "$KEY" ]; then
            echo "Current Configuration:"
            if [ -f "$CONFIG_FILE" ]; then cat "$CONFIG_FILE"; else echo "No local config found."; fi
            exit 0
        fi
        
        if [ -z "$VALUE" ]; then
            echo "Usage: jpm config [key] [value]"
            exit 1
        fi
        
        # Simple append/update logic (for now just append)
        # In real world, use sed to replace if exists
        echo "export $KEY=\"$VALUE\"" >> "$CONFIG_FILE"
        echo "Set $KEY=$VALUE in $CONFIG_FILE"
        ;;
    gen)
        check_init
        INPUT=$2
        OUTPUT=$3
        if [ -z "$INPUT" ]; then echo "Usage: jpm gen [input_file] [output_file]"; exit 1; fi
        
        bash "$SCRIPTS_DIR/ai.sh" generate "$INPUT" "$OUTPUT"
        ;;
    *)
        show_help
        ;;
esac
