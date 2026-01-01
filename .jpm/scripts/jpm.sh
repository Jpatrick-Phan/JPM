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

# Detect Node.js command
if command -v node &> /dev/null; then
    NODE_CMD="node"
else
    NODE_CMD=""
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
    echo "  jpm status           Show project status and features"
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
    local status="$2"
    local prd_path="$3"
    local arch_path="$4"
    local task_count="$5"
    local map_file="$PROJECT_CONTEXT/project-map.json"
    
    if [ -z "$NODE_CMD" ]; then return; fi
    
    if [ -f "$map_file" ]; then
        # Use Node to safely update JSON
        "$NODE_CMD" -e "
const fs = require('fs');
const mapFile = '$map_file';
const feature = '$feature';
const status = '$status';
const prdPath = '$prd_path';
const archPath = '$arch_path';
const taskCount = '$task_count';

try {
    const data = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));
    
    // Migrate old array structure to object if needed
    if (Array.isArray(data.features)) {
        const oldFeatures = data.features;
        data.features = {};
        oldFeatures.forEach(f => {
            data.features[f] = { status: 'unknown' };
        });
    }
    
    if (!data.features) data.features = {};
    
    if (!data.features[feature]) {
        data.features[feature] = {};
    }
    
    // Update fields
    if (status) data.features[feature].status = status;
    if (prdPath) data.features[feature].prd_path = prdPath;
    if (archPath) data.features[feature].arch_path = archPath;
    if (taskCount) data.features[feature].tasks_count = parseInt(taskCount);
    
    data.features[feature].last_updated = new Date().toISOString();

    fs.writeFileSync(mapFile, JSON.stringify(data, null, 2));
    console.log('Updated project-map.json for feature: ' + feature);
} catch (e) {
    console.log('Warning: Could not update project-map.json: ' + e.message);
}
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

        # Secure config.env
        echo "config.env" > "$PROJECT_JPM/.gitignore"
        chmod 600 "$PROJECT_JPM/.gitignore" 2>/dev/null # Try to secure it, might fail on Windows/FS but good practice

        # Add .jpm to project root .gitignore
        if [ -f ".gitignore" ]; then
            if ! grep -q ".jpm/" ".gitignore"; then
                echo "" >> ".gitignore"
                echo "# JPM Project Files" >> ".gitignore"
                echo ".jpm/" >> ".gitignore"
                echo "Added .jpm/ to .gitignore"
            fi
        else
            echo "# JPM Project Files" > ".gitignore"
            echo ".jpm/" >> ".gitignore"
            echo "Created .gitignore with .jpm/"
        fi
        
        # Create project-map.json if not exists
        if [ ! -f "$PROJECT_CONTEXT/project-map.json" ]; then
            echo "{ \"project\": \"$(basename "$PWD")\", \"version\": \"0.1.0\", \"features\": {} }" > "$PROJECT_CONTEXT/project-map.json"
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
            
            # Replace Placeholders
            sed -i "s/\[Feature Name\]/$FEATURE/g" "$TARGET"

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
            update_project_map "$FEATURE" "planned" "$TARGET" "" ""
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
            
            # Replace Placeholders
            sed -i "s/\[Feature Name\]/$FEATURE/g" "$TARGET"
            
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
            update_project_map "$FEATURE" "designed" "" "$TARGET" ""
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
        
        # Parse JSON and create files using Node
        if [ -n "$NODE_CMD" ]; then
            # Capture the output of the node script to get the task count
            TASK_COUNT=$(echo "$JSON_OUTPUT" | "$NODE_CMD" -e "
const fs = require('fs');
const path = require('path');
const outputDir = '$PROJECT_STORAGE/tasks';
const feature = '$FEATURE';

try {
    const rawInput = fs.readFileSync(0, 'utf-8');
    const startIdx = rawInput.indexOf('[');
    const endIdx = rawInput.lastIndexOf(']') + 1;

    if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = rawInput.substring(startIdx, endIdx);
        let tasks;
        try {
            tasks = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('Error: Failed to parse extracted JSON string.');
            process.exit(1);
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        tasks.forEach(task => {
            if (task.filename && task.content) {
                const filepath = path.join(outputDir, task.filename);
                // Inject Feature Metadata
                let content = task.content;
                if (!content.includes('<!-- Feature:')) {
                    content = '<!-- Feature: ' + feature + ' -->\n' + content;
                }
                fs.writeFileSync(filepath, content, 'utf-8');
                console.error('Created task: ' + filepath); // Log to stderr to not mess up stdout capture
            }
        });
        console.log(tasks.length); // Output task count to stdout
    } else {
        console.error('Error: No JSON array found in AI response.');
        process.exit(1);
    }
} catch (e) {
    console.error('Error processing tasks: ' + e.message);
    process.exit(1);
}
")
            EXIT_CODE=$?
            if [ $EXIT_CODE -eq 0 ]; then
                echo "Successfully created $TASK_COUNT tasks."
                update_project_map "$FEATURE" "split" "" "" "$TASK_COUNT"
            else
                echo "Task splitting failed."
            fi
        else
            echo "Error: Node.js not found. Cannot parse AI response."
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
        
        # Try to extract Feature Name from metadata
        FEATURE_NAME=$(grep "<!-- Feature:" "$TASK_FILE" | sed 's/<!-- Feature: //; s/ -->//')
        
        if [ -n "$FEATURE_NAME" ]; then
            echo "Feature Detected: $FEATURE_NAME"
            
            # Look up paths in project-map.json using Node
            if [ -n "$NODE_CMD" ]; then
                PATHS=$("$NODE_CMD" -e "
                    try {
                        const data = JSON.parse(require('fs').readFileSync('$PROJECT_CONTEXT/project-map.json', 'utf-8'));
                        const f = data.features['$FEATURE_NAME'];
                        if (f) {
                            console.log(f.prd_path + '|' + f.arch_path);
                        }
                    } catch(e) {}
                ")
                
                IFS='|' read -r PRD_PATH ARCH_PATH <<< "$PATHS"
                
                if [ -f "$PRD_PATH" ]; then
                    echo "--- PRD CONTEXT ($PRD_PATH) ---"
                    cat "$PRD_PATH"
                    echo ""
                fi
                
                if [ -f "$ARCH_PATH" ]; then
                    echo "--- ARCHITECTURE CONTEXT ($ARCH_PATH) ---"
                    cat "$ARCH_PATH"
                    echo ""
                fi
            fi
        else
            echo "Warning: No feature metadata found in task file. Context might be incomplete."
        fi
        
        echo "--- TASK CONTENT ---"
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
        
        # Use Node to cleanly update config file
        if [ -n "$NODE_CMD" ]; then
            "$NODE_CMD" -e "
const fs = require('fs');
const configFile = '$CONFIG_FILE';
const key = '$KEY';
const value = '$VALUE';

try {
    let content = '';
    if (fs.existsSync(configFile)) {
        content = fs.readFileSync(configFile, 'utf-8');
    }
    
    const lines = content.split('\n').filter(line => line.trim() !== '');
    let found = false;
    const newLines = lines.map(line => {
        if (line.startsWith('export ' + key + '=')) {
            found = true;
            return 'export ' + key + '=\"' + value + '\"';
        }
        return line;
    });
    
    if (!found) {
        newLines.push('export ' + key + '=\"' + value + '\"');
    }
    
    fs.writeFileSync(configFile, newLines.join('\n') + '\n');
    console.log('Set ' + key + ' in ' + configFile);
} catch (e) {
    console.error('Error updating config: ' + e.message);
    process.exit(1);
}
"
        else
            # Fallback to append if Node is missing (shouldn't happen given check_init)
            echo "export $KEY=\"$VALUE\"" >> "$CONFIG_FILE"
            echo "Set $KEY=$VALUE in $CONFIG_FILE"
        fi
        ;;
    status)
        check_init
        if [ -n "$NODE_CMD" ]; then
            "$NODE_CMD" -e "
const fs = require('fs');
const mapFile = '$PROJECT_CONTEXT/project-map.json';
try {
    const data = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));
    console.log('Project: ' + data.project);
    console.log('Version: ' + data.version);
    console.log('');
    console.log('Features:');
    console.log(String('Name').padEnd(20) + String('Status').padEnd(15) + String('Tasks').padEnd(10) + 'Last Updated');
    console.log('-'.repeat(65));
    
    const features = data.features || {};
    Object.keys(features).forEach(name => {
        const f = features[name];
        const status = f.status || 'unknown';
        const tasks = f.tasks_count || 0;
        const updated = f.last_updated ? new Date(f.last_updated).toLocaleDateString() : 'N/A';
        console.log(name.padEnd(20) + status.padEnd(15) + String(tasks).padEnd(10) + updated);
    });
} catch (e) {
    console.error('Error reading status: ' + e.message);
}
"
        else
            echo "Error: Node.js required for status command."
        fi
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
