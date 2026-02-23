#!/bin/bash
# Brain Tracker Hook — runs after Claude finishes responding
# Logs which files were edited so the brain-tracker agent knows what to scan next session

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)

# Only track Edit/Write operations on source files
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]] && [[ -n "$FILE_PATH" ]]; then
  # Skip non-source files (docs, configs, brain files themselves)
  if [[ "$FILE_PATH" == *"/src/"* || "$FILE_PATH" == *"/app/"* ]]; then
    BRAIN_LOG="${PROJECT_DIR}/docs/brain/scripts/changed-files.log"
    mkdir -p "$(dirname "$BRAIN_LOG")"
    echo "$(date -Iseconds) | $TOOL_NAME | $FILE_PATH" >> "$BRAIN_LOG"
  fi
fi

exit 0
