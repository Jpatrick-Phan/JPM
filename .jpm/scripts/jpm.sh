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

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    PYTHON_CMD=""
fi

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

function update_project_map {
    local feature="$1"
    local map_file="$PROJECT_CONTEXT/project-map.json"
    
    if [ -z "$PYTHON_CMD" ]; then return; fi
    
    if [ -f "$map_file" ]; then
        # Use Python to safely update JSON
        "$PYTHON_CMD" -c "
import sys, json, os
try:
    with open('$map_file', 'r') as f:
        data = json.load(f)
    
    if 'features' not in data:
        data['features'] = []
        
    if '$feature' not in data['features']:
        data['features'].append('$feature')
        with open('$map_file', 'w') as f:
            json.dump(data, f, indent=2)
        print('Updated project-map.json with feature: $feature')
except Exception as e:
    print(f'Warning: Could not update project-map.json: {e}')
"
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
            
            # Update Project Map
            update_project_map "$FEATURE"
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
            
            # Update Project Map
            update_project_map "$FEATURE"
        else
             echo "Error: Template not found at $TEMPLATE_DIR/ARCHITECT_TEMPLATE.md"
             exit 1
        fi
        ;;
    split)
        check_init
        FEATURE=$2
        if [ -z "$FEATURE" ]; then echo "Usage: jpm split [feature_name]"; exit 1; fi
        
        ARCH_SOURCE="$PROJECT_STORAGE/epics/arch-$FEATURE.md"
        TASK_TEMPLATE="$TEMPLATE_DIR/TASK_TEMPLATE.md"
        
        if [ ! -f "$ARCH_SOURCE" ]; then
            echo "Error: Architecture file not found: $ARCH_SOURCE"
            exit 1
        fi
        
        echo "Analyzing Architecture for Task Decomposition..."
        
        TEMP_PROMPT=$(mktemp)
        echo "You are a Technical Lead. Decompose the following Architecture into atomic development tasks." > "$TEMP_PROMPT"
        echo "Output MUST be a JSON array of objects with 'filename' and 'content' keys." >> "$TEMP_PROMPT"
        echo "Example: [{\"filename\": \"task-001-setup.md\", \"content\": \"...\"}]" >> "$TEMP_PROMPT"
        echo "Use the following Task Template for content:" >> "$TEMP_PROMPT"
        cat "$TASK_TEMPLATE" >> "$TEMP_PROMPT"
        echo "--- ARCHITECTURE ---" >> "$TEMP_PROMPT"
        cat "$ARCH_SOURCE" >> "$TEMP_PROMPT"
        
        # Call AI to generate JSON
        JSON_OUTPUT=$(bash "$SCRIPTS_DIR/ai.sh" generate "$TEMP_PROMPT")
        rm "$TEMP_PROMPT"
        
        # Parse JSON and create files using Python
        if [ -n "$PYTHON_CMD" ]; then
            echo "$JSON_OUTPUT" | "$PYTHON_CMD" -c "
import sys, json, os

try:
    raw_input = sys.stdin.read()
    # Try to find JSON array in the output (in case of extra text)
    start_idx = raw_input.find('[')
    end_idx = raw_input.rfind(']') + 1
    
    if start_idx != -1 and end_idx != -1:
        json_str = raw_input[start_idx:end_idx]
        tasks = json.loads(json_str)
        
        output_dir = '$PROJECT_STORAGE/tasks'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        for task in tasks:
            filename = task.get('filename')
            content = task.get('content')
            if filename and content:
                filepath = os.path.join(output_dir, filename)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Created task: {filepath}')
    else:
        print('Error: No JSON array found in AI response.')
        print('Raw Output:', raw_input[:200] + '...')
except Exception as e:
    print(f'Error parsing tasks: {e}')
"
        else
            echo "Error: Python not found. Cannot parse AI response."
        fi
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
