#!/bin/bash

# JPM: AI Driver
# Handles interactions with various AI providers (Gemini, OpenAI, Claude)

# Load Configs (Local overrides Global)
if [ -f "$HOME/.jpm-core/config.env" ]; then source "$HOME/.jpm-core/config.env"; fi
if [ -f "./.jpm/config.env" ]; then source "./.jpm/config.env"; fi

PROVIDER="${JPM_AI_PROVIDER:-gemini}"

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "Error: Python is required but not found (checked 'python3' and 'python')."
    exit 1
fi

function call_gemini {
    local prompt="$1"
    local api_key="$2"
    
    if [ -z "$api_key" ]; then echo "Error: JPM_GEMINI_API_KEY not set."; exit 1; fi

    # Gemini API Endpoint
    URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$api_key"
    
    # Escape JSON content (Basic escaping)
    ESCAPED_PROMPT=$(echo "$prompt" | "$PYTHON_CMD" -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
    
    # Construct Payload
    PAYLOAD="{ \"contents\": [{ \"parts\": [{ \"text\": $ESCAPED_PROMPT }] }] }"
    
    # Call API
    RESPONSE=$(curl -s -H "Content-Type: application/json" -d "$PAYLOAD" "$URL")
    
    # Extract Text (Requires jq or python)
    if command -v jq &> /dev/null; then
        echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].text'
    else
        # Fallback to python for parsing
        echo "$RESPONSE" | "$PYTHON_CMD" -c "import sys, json; print(json.load(sys.stdin)['candidates'][0]['content']['parts'][0]['text'])"
    fi
}

function call_openai {
    local prompt="$1"
    local api_key="$2"
    
    if [ -z "$api_key" ]; then echo "Error: JPM_OPENAI_API_KEY not set."; exit 1; fi

    URL="https://api.openai.com/v1/chat/completions"
    ESCAPED_PROMPT=$(echo "$prompt" | "$PYTHON_CMD" -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
    PAYLOAD="{ \"model\": \"gpt-4\", \"messages\": [{\"role\": \"user\", \"content\": $ESCAPED_PROMPT}] }"
    
    RESPONSE=$(curl -s -H "Content-Type: application/json" -H "Authorization: Bearer $api_key" -d "$PAYLOAD" "$URL")
    
    if command -v jq &> /dev/null; then
        echo "$RESPONSE" | jq -r '.choices[0].message.content'
    else
        echo "$RESPONSE" | "$PYTHON_CMD" -c "import sys, json; print(json.load(sys.stdin)['choices'][0]['message']['content'])"
    fi
}

function call_claude {
    local prompt="$1"
    local api_key="$2"
    
    if [ -z "$api_key" ]; then echo "Error: JPM_CLAUDE_API_KEY not set."; exit 1; fi

    URL="https://api.anthropic.com/v1/messages"
    ESCAPED_PROMPT=$(echo "$prompt" | "$PYTHON_CMD" -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
    PAYLOAD="{ \"model\": \"claude-3-opus-20240229\", \"max_tokens\": 4096, \"messages\": [{\"role\": \"user\", \"content\": $ESCAPED_PROMPT}] }"
    
    RESPONSE=$(curl -s -H "x-api-key: $api_key" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d "$PAYLOAD" "$URL")
    
    if command -v jq &> /dev/null; then
        echo "$RESPONSE" | jq -r '.content[0].text'
    else
        echo "$RESPONSE" | "$PYTHON_CMD" -c "import sys, json; print(json.load(sys.stdin)['content'][0]['text'])"
    fi
}

case "$1" in
    generate)
        PROMPT_FILE="$2"
        OUTPUT_FILE="$3"
        
        if [ ! -f "$PROMPT_FILE" ]; then echo "Error: Input file not found: $PROMPT_FILE"; exit 1; fi
        
        CONTENT=$(cat "$PROMPT_FILE")
        
        echo "Generating content using Provider: $PROVIDER..."
        
        case "$PROVIDER" in
            gemini)
                RESULT=$(call_gemini "$CONTENT" "$JPM_GEMINI_API_KEY")
                ;;
            openai)
                RESULT=$(call_openai "$CONTENT" "$JPM_OPENAI_API_KEY")
                ;;
            claude)
                RESULT=$(call_claude "$CONTENT" "$JPM_CLAUDE_API_KEY")
                ;;
            *)
                echo "Error: Unsupported provider '$PROVIDER'"
                exit 1
                ;;
        esac
        
        # Save result
        if [ -n "$OUTPUT_FILE" ]; then
            echo "$RESULT" > "$OUTPUT_FILE"
            echo "Output saved to $OUTPUT_FILE"
        else
            echo "$RESULT"
        fi
        ;;
    *)
        echo "Usage: ./ai.sh generate [input_file] [output_file]"
        ;;
esac
