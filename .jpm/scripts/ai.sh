#!/bin/bash

# JPM: AI Driver
# Handles interactions with various AI providers (Gemini, OpenAI, Claude)

# Load Configs (Local overrides Global)
if [ -f "$HOME/.jpm-core/config.env" ]; then source "$HOME/.jpm-core/config.env"; fi
if [ -f "./.jpm/config.env" ]; then source "./.jpm/config.env"; fi

PROVIDER="${JPM_AI_PROVIDER:-gemini}"

# Detect Node.js command
if command -v node &> /dev/null; then
    NODE_CMD="node"
else
    echo "Error: Node.js is required but not found."
    exit 1
fi

function call_gemini {
    local prompt="$1"
    local api_key="$2"
    
    if [ -z "$api_key" ]; then echo "Error: JPM_GEMINI_API_KEY not set."; exit 1; fi

    # Gemini API Endpoint
    URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$api_key"
    
    # Escape JSON content (Basic escaping)
    ESCAPED_PROMPT=$(echo "$prompt" | "$NODE_CMD" -e 'console.log(JSON.stringify(require("fs").readFileSync(0, "utf-8")))')
    
    # Construct Payload
    PAYLOAD="{ \"contents\": [{ \"parts\": [{ \"text\": $ESCAPED_PROMPT }] }] }"
    
    # Call API
    RESPONSE=$(curl -s -f -H "Content-Type: application/json" -d "$PAYLOAD" "$URL")
    CURL_EXIT=$?

    if [ $CURL_EXIT -ne 0 ]; then
        echo "Error: Gemini API call failed (curl exit code: $CURL_EXIT)." >&2
        echo "Response: $RESPONSE" >&2
        exit 1
    fi
    
    # Extract Text (Requires jq or node)
    if command -v jq &> /dev/null; then
        EXTRACTED=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].text')
        if [ "$EXTRACTED" == "null" ]; then
             echo "Error: Failed to parse Gemini response." >&2
             echo "Raw Response: $RESPONSE" >&2
             exit 1
        fi
        echo "$EXTRACTED"
    else
        # Fallback to node for parsing
        echo "$RESPONSE" | "$NODE_CMD" -e "
        try { 
            const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); 
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                console.log(data.candidates[0].content.parts[0].text); 
            } else {
                console.error('Error: Unexpected JSON structure from Gemini.');
                console.error(JSON.stringify(data, null, 2));
                process.exit(1);
            }
        } catch (e) { 
            console.error('Error: Failed to parse JSON: ' + e.message);
            process.exit(1); 
        }"
    fi
}

function call_openai {
    local prompt="$1"
    local api_key="$2"
    
    if [ -z "$api_key" ]; then echo "Error: JPM_OPENAI_API_KEY not set."; exit 1; fi

    URL="https://api.openai.com/v1/chat/completions"
    ESCAPED_PROMPT=$(echo "$prompt" | "$NODE_CMD" -e 'console.log(JSON.stringify(require("fs").readFileSync(0, "utf-8")))')
    PAYLOAD="{ \"model\": \"gpt-4\", \"messages\": [{\"role\": \"user\", \"content\": $ESCAPED_PROMPT}] }"
    
    RESPONSE=$(curl -s -f -H "Content-Type: application/json" -H "Authorization: Bearer $api_key" -d "$PAYLOAD" "$URL")
    CURL_EXIT=$?

    if [ $CURL_EXIT -ne 0 ]; then
        echo "Error: OpenAI API call failed (curl exit code: $CURL_EXIT)." >&2
        echo "Response: $RESPONSE" >&2
        exit 1
    fi
    
    if command -v jq &> /dev/null; then
        EXTRACTED=$(echo "$RESPONSE" | jq -r '.choices[0].message.content')
        if [ "$EXTRACTED" == "null" ]; then
             echo "Error: Failed to parse OpenAI response." >&2
             echo "Raw Response: $RESPONSE" >&2
             exit 1
        fi
        echo "$EXTRACTED"
    else
        echo "$RESPONSE" | "$NODE_CMD" -e "
        try { 
            const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); 
            if (data.choices && data.choices[0] && data.choices[0].message) {
                console.log(data.choices[0].message.content); 
            } else {
                console.error('Error: Unexpected JSON structure from OpenAI.');
                console.error(JSON.stringify(data, null, 2));
                process.exit(1);
            }
        } catch (e) { 
            console.error('Error: Failed to parse JSON: ' + e.message);
            process.exit(1); 
        }"
    fi
}

function call_claude {
    local prompt="$1"
    local api_key="$2"
    
    if [ -z "$api_key" ]; then echo "Error: JPM_CLAUDE_API_KEY not set."; exit 1; fi

    URL="https://api.anthropic.com/v1/messages"
    ESCAPED_PROMPT=$(echo "$prompt" | "$NODE_CMD" -e 'console.log(JSON.stringify(require("fs").readFileSync(0, "utf-8")))')
    PAYLOAD="{ \"model\": \"claude-3-opus-20240229\", \"max_tokens\": 4096, \"messages\": [{\"role\": \"user\", \"content\": $ESCAPED_PROMPT}] }"
    
    RESPONSE=$(curl -s -f -H "x-api-key: $api_key" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d "$PAYLOAD" "$URL")
    CURL_EXIT=$?

    if [ $CURL_EXIT -ne 0 ]; then
        echo "Error: Claude API call failed (curl exit code: $CURL_EXIT)." >&2
        echo "Response: $RESPONSE" >&2
        exit 1
    fi
    
    if command -v jq &> /dev/null; then
        EXTRACTED=$(echo "$RESPONSE" | jq -r '.content[0].text')
        if [ "$EXTRACTED" == "null" ]; then
             echo "Error: Failed to parse Claude response." >&2
             echo "Raw Response: $RESPONSE" >&2
             exit 1
        fi
        echo "$EXTRACTED"
    else
        echo "$RESPONSE" | "$NODE_CMD" -e "
        try { 
            const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); 
            if (data.content && data.content[0]) {
                console.log(data.content[0].text); 
            } else {
                console.error('Error: Unexpected JSON structure from Claude.');
                console.error(JSON.stringify(data, null, 2));
                process.exit(1);
            }
        } catch (e) { 
            console.error('Error: Failed to parse JSON: ' + e.message);
            process.exit(1); 
        }"
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
