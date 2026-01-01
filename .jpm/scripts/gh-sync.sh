#!/bin/bash

# JPM: GitHub Sync Utility
# Usage: ./gh-sync.sh [command] [args]

function check_gh {
    if ! command -v gh &> /dev/null; then
        echo "Error: GitHub CLI (gh) is not installed."
        exit 1
    fi
}

case "$1" in
    setup-labels)
        check_gh
        echo "Creating JPM labels..."
        gh label create "jpm-task" --color "0E8A16" --description "Task managed by JPM" --force
        gh label create "jpm-epic" --color "1D76DB" --description "Epic/Architecture managed by JPM" --force
        gh label create "jpm-blocked" --color "B60205" --description "Blocked waiting for user/spec" --force
        echo "Labels verified."
        ;;
    create-issue)
        check_gh
        FILE_PATH=$2
        if [ -z "$FILE_PATH" ]; then echo "Usage: ./gh-sync.sh create-issue [file_path]"; exit 1; fi
        
        # Extract Title (First H1)
        TITLE=$(grep -m 1 "^# " "$FILE_PATH" | sed 's/^# //')
        if [ -z "$TITLE" ]; then TITLE="Untitled Task ($(basename "$FILE_PATH"))"; fi
        
        # Create Issue
        # Note: We use the file content as the body. 
        # In a real scenario we might want to strip metadata or add a footer.
        URL=$(gh issue create --title "$TITLE" --body-file "$FILE_PATH" --label "jpm-task")
        GH_EXIT=$?
        
        if [ $GH_EXIT -eq 0 ] && [ -n "$URL" ]; then
            echo "Created Issue: $URL"
            
            # Append Issue URL to file as metadata if not present
            if ! grep -q "GitHub Issue:" "$FILE_PATH"; then
                echo "" >> "$FILE_PATH"
                echo "<!-- GitHub Issue: $URL -->" >> "$FILE_PATH"
            fi
        else
            echo "Error: Failed to create GitHub issue for $FILE_PATH (Exit code: $GH_EXIT)"
            echo "Output: $URL"
        fi
        ;;
    update-issue)
        check_gh
        ISSUE_ID=$2
        COMMENT=$3
        if [ -z "$ISSUE_ID" ] || [ -z "$COMMENT" ]; then echo "Usage: ./gh-sync.sh update-issue [id] [comment]"; exit 1; fi
        gh issue comment "$ISSUE_ID" --body "$COMMENT"
        ;;
    *)
        echo "Usage: ./gh-sync.sh [setup-labels|create-issue|update-issue]"
        ;;
esac
