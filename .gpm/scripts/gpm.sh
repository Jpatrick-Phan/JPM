#!/bin/bash

# G-PM: Gemini Project Manager CLI
# Usage: ./gpm.sh [command] [args]

GPM_ROOT=".gpm"
TEMPLATE_DIR="$GPM_ROOT/templates"
STORAGE_DIR="$GPM_ROOT/storage"
SCRIPTS_DIR="$GPM_ROOT/scripts"

function show_help {
    echo "G-PM: Gemini Project Manager (Gemini/Antigravity Edition)"
    echo "Usage:"
    echo "  ./gpm.sh init             Initialize G-PM environment"
    echo "  ./gpm.sh plan [feature]   Create a PRD draft"
    echo "  ./gpm.sh design [feature] Create an Architecture draft"
    echo "  ./gpm.sh split [feature]  Create Task drafts"
    echo "  ./gpm.sh sync             Sync local tasks to GitHub"
    echo "  ./gpm.sh run [task_id]    Prepare execution context"
    echo "  ./gpm.sh issue [cmd]      Manage issues (list, close)"
}

function check_init {
    if [ ! -d "$GPM_ROOT" ]; then
        echo "Error: G-PM is not initialized. Run './gpm.sh init' first."
        exit 1
    fi
}

case "$1" in
    init)
        echo "Initializing G-PM..."
        mkdir -p "$GPM_ROOT"/{core,templates,scripts,context,storage/{prds,epics,tasks}}
        if [ ! -f "$TEMPLATE_DIR/PRD_TEMPLATE.md" ]; then
             echo "Warning: Templates not found. Please ensure full G-PM package is installed."
        fi
        # Initialize GitHub labels
        if [ -f "$SCRIPTS_DIR/gh-sync.sh" ]; then
            bash "$SCRIPTS_DIR/gh-sync.sh" setup-labels
        fi
        echo "Initialization complete."
        ;;
    plan)
        check_init
        FEATURE=$2
        if [ -z "$FEATURE" ]; then echo "Usage: ./gpm.sh plan [feature_name]"; exit 1; fi
        TARGET="$STORAGE_DIR/prds/prd-$FEATURE.md"
        if [ -f "$TARGET" ]; then echo "PRD already exists: $TARGET"; exit 1; fi
        cp "$TEMPLATE_DIR/PRD_TEMPLATE.md" "$TARGET"
        echo "Created PRD draft: $TARGET"
        echo "Tip: Ask Gemini/Antigravity to 'Fill $TARGET based on requirements'."
        ;;
    design)
        check_init
        FEATURE=$2
        if [ -z "$FEATURE" ]; then echo "Usage: ./gpm.sh design [feature_name]"; exit 1; fi
        TARGET="$STORAGE_DIR/epics/arch-$FEATURE.md"
        if [ -f "$TARGET" ]; then echo "Architecture doc already exists: $TARGET"; exit 1; fi
        cp "$TEMPLATE_DIR/ARCHITECT_TEMPLATE.md" "$TARGET"
        echo "Created Architecture draft: $TARGET"
        echo "Tip: Ask Gemini/Antigravity to 'Create architecture in $TARGET'."
        ;;
    split)
        check_init
        FEATURE=$2
        if [ -z "$FEATURE" ]; then echo "Usage: ./gpm.sh split [feature_name]"; exit 1; fi
        echo "Ready to split tasks for $FEATURE."
        echo "Action: Ask Gemini/Antigravity to 'Decompose arch-$FEATURE.md into tasks in $STORAGE_DIR/tasks/ using format task-[id]-[name].md'"
        ;;
    sync)
        check_init
        echo "Syncing tasks to GitHub..."
        # Iterate over all task files in storage/tasks
        for TASK_FILE in "$STORAGE_DIR/tasks"/*.md; do
            [ -e "$TASK_FILE" ] || continue
            # Check if file already has an Issue Link
            if grep -q "GitHub Issue:" "$TASK_FILE"; then
                continue # Already synced
            fi
            echo "Syncing $TASK_FILE..."
            bash "$SCRIPTS_DIR/gh-sync.sh" create-issue "$TASK_FILE"
        done
        echo "Sync complete."
        ;;
    run)
        check_init
        TASK_ID=$2
        if [ -z "$TASK_ID" ]; then echo "Usage: ./gpm.sh run [task_id]"; exit 1; fi
        TASK_FILE=$(find "$STORAGE_DIR/tasks" -name "*$TASK_ID*.md" | head -n 1)
        if [ -z "$TASK_FILE" ]; then echo "Task not found with ID: $TASK_ID"; exit 1; fi
        echo "---------------------------------------------------"
        echo "EXECUTING TASK: $TASK_FILE"
        echo "---------------------------------------------------"
        cat "$TASK_FILE"
        echo "---------------------------------------------------"
        echo "Copy the content above and paste it to Antigravity."
        ;;
    issue)
        check_init
        CMD=$2
        ARGS="${@:3}"
        if [ -z "$CMD" ]; then echo "Usage: ./gpm.sh issue [list|close|view] [args]"; exit 1; fi
        gh issue $CMD $ARGS
        ;;
    *)
        show_help
        ;;
esac
