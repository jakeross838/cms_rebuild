---
name: ross-built-brain
description: "Self-learning project intelligence system that autonomously tracks every UI element, database operation, two-way sync, credential, and conversation intent as you build the Ross Built CMS. Generates a living feature map in plain English and auto-builds a test matrix. Use this skill whenever: building any feature in the CMS, updating the feature map, preparing to test, tracking what was built, managing credentials, understanding button logic, documenting multi-layered workflows, or when anyone says 'update the brain', 'what have we built', 'test the CMS', 'scan the project', or 'show the test matrix'."
---

# Ross Built Brain — Skill Entry Point

This skill is the entry point for the Ross Built Intelligence Platform's autonomous tracking system.

## If Running in Claude Code

The full system is already installed in your project. The brain-tracker subagent handles everything.
Just say "update the brain" and it runs automatically.

## If Running in Claude.ai

Read the following files in order:
1. `docs/brain/feature-map.md` — Current state of all features
2. `docs/brain/intent-log.md` — Why each feature was built
3. `docs/brain/test-matrix.md` — Auto-generated test cases
4. `docs/brain/secrets.local.md` — Current credentials

Then follow the brain-tracker agent instructions at `.claude/agents/brain-tracker.md`.

## Quick Reference

### To scan the codebase:
```bash
node docs/brain/scripts/scan.js . --credentials
```

### To scan only changed files:
```bash
node docs/brain/scripts/scan.js . --changed-only
```

### After scanning, Claude should:
1. Read the scan output JSON
2. For each new/changed element, write a plain-English description
3. Update `docs/brain/feature-map.md`
4. Update `docs/brain/intent-log.md` with conversation context
5. Update `docs/brain/test-matrix.md` with new test cases
6. Update `docs/brain/secrets.local.md` if credentials changed
7. Report what changed to the user
