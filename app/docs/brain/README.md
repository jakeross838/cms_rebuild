# 🧠 Ross Built Brain

A self-learning, autonomous project intelligence system for Claude Code. It watches you build, remembers everything, and knows exactly how to test your software — without you ever explaining it.

## What It Does

**As you code**, the Brain automatically:
- 🔍 Scans every file you change
- 📝 Documents every button, form, toggle, and link in plain English
- 🔗 Maps how elements affect each other (cascade effects, syncs, status changes)
- 🗄️ Tracks which Supabase tables each element reads/writes
- 🔄 Understands two-way syncs and multi-layered conditional logic
- 💬 Logs WHY you built each feature (from your conversations)
- 🔑 Remembers credentials, API keys, and URLs (auto-detects from .env)
- 🧪 Auto-generates a complete test matrix from the feature map
- 📈 Gets smarter every session through persistent memory

**When it's time to test**, it already knows:
- What every button should do
- What the expected database state is after each action
- What syncs should fire
- What edge cases to try
- What's not yet implemented

## Install

```bash
# In your project root:
bash install.sh
```

That's it. One command.

## How It Works

```
You code → Brain scans → Feature map updates → Test matrix rebuilds
                ↓
        Intent log captures WHY
                ↓
        Credentials auto-detected
                ↓
        Memory improves for next time
```

### The Files

| File | Purpose | Auto-Updated? |
|------|---------|---------------|
| `docs/brain/feature-map.md` | Every element, what it does, what it affects | ✅ Yes |
| `docs/brain/intent-log.md` | WHY each feature was built | ✅ Yes |
| `docs/brain/test-matrix.md` | Auto-generated test cases | ✅ Yes |
| `docs/brain/secrets.local.md` | Credentials vault (gitignored) | ✅ Yes |
| `docs/brain/scripts/scan.js` | Codebase scanner | Manual updates only |
| `.claude/agents/brain-tracker.md` | The AI agent with persistent memory | Learns over time |
| `CLAUDE.md` | Master instructions for Claude Code | You + Brain edit |

### The Agent

The `brain-tracker` subagent has **persistent project-level memory**. It:
- Remembers your file structure after the first scan
- Learns your naming conventions
- Knows where Supabase calls live
- Remembers credential locations
- Gets faster and more accurate over time
- Corrects itself when you point out mistakes

## Usage

### Automatic (Default)
Just code normally. After every task, Claude Code automatically runs the brain.

### Manual Commands
Say any of these in Claude Code:

| Command | What It Does |
|---------|-------------|
| "update the brain" | Full scan + update all docs |
| "what have we built" | Shows current feature map |
| "show the test matrix" | Shows all auto-generated test cases |
| "test the CMS" | Runs Playwright tests using the test matrix |
| "what changed today" | Shows only today's changes |
| "what's not implemented yet" | Shows TODOs and missing handlers |
| "show the intent log" | Shows WHY each feature was built |
| "update credentials" | Re-scans .env files for new keys |

## Architecture

```
CLAUDE.md (loaded every session)
  ├── @docs/brain/feature-map.md (what exists)
  ├── @docs/brain/intent-log.md (why it exists)
  ├── @docs/brain/secrets.local.md (credentials)
  └── @docs/brain/test-matrix.md (how to test it)

.claude/agents/brain-tracker.md (persistent memory subagent)
  └── Uses: Read, Write, Edit, Bash, Glob, Grep
  └── Memory scope: project (persists across sessions)

docs/brain/scripts/scan.js (raw codebase scanner)
  └── Finds: elements, DB calls, syncs, conditions, TODOs, credentials
```

## What Makes This Different

| Traditional Docs | Brain |
|-----------------|-------|
| You write them | Auto-generated from code |
| Gets outdated | Updates every session |
| Developer language | Construction PM language |
| Separate from tests | IS the test plan |
| Static | Learns and improves |
| Manual credential management | Auto-detects from .env |
| No conversation context | Tracks WHY you built things |
