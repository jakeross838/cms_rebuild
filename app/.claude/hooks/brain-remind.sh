#!/bin/bash
# Brain Reminder Hook — runs when Claude finishes responding (Stop event)
# Checks if source files were edited and reminds to update the brain

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHANGE_LOG="${PROJECT_DIR}/docs/brain/scripts/changed-files.log"

# If the change log exists and has content, source files were edited this session
if [ -f "$CHANGE_LOG" ] && [ -s "$CHANGE_LOG" ]; then
  COUNT=$(wc -l < "$CHANGE_LOG")
  # Output a reminder that gets injected into the conversation
  echo "BRAIN REMINDER: ${COUNT} source file(s) were edited. Update the feature map, intent log, and test matrix before ending this session."
fi

exit 0
