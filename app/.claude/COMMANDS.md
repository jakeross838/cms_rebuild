# Quick Commands Reference

> Copy-paste ready commands for common operations.

## Git Operations

### Standard Commit (After Task)
```bash
cd /c/Users/Jake/cms_rebuild/app && \
npm run lint && \
npm run typecheck && \
git add . && \
git commit -m "feat(scope): description

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" && \
git push
```

### Quick Status Check
```bash
cd /c/Users/Jake/cms_rebuild/app && git status && git log --oneline -3
```

### Phase Complete Commit
```bash
cd /c/Users/Jake/cms_rebuild/app && \
npm run validate && \
git add . && \
git commit -m "feat: complete phase - [PHASE_NAME]

Summary of completed work:
- Item 1
- Item 2
- Item 3

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" && \
git push
```

## Development

### Start Dev Server
```bash
cd /c/Users/Jake/cms_rebuild/app && npm run dev
```

### Full Validation
```bash
cd /c/Users/Jake/cms_rebuild/app && npm run validate
```

### Fix Lint Errors
```bash
cd /c/Users/Jake/cms_rebuild/app && npm run lint:fix
```

### Format Code
```bash
cd /c/Users/Jake/cms_rebuild/app && npm run format
```

## Database

### Generate Types from Supabase
```bash
cd /c/Users/Jake/cms_rebuild/app && npm run db:generate
```

### Apply Migration (via Supabase MCP)
```
Use: mcp__supabase__apply_migration
Project ID: yprbbomuhugtgyqmrnhr
```

### List Tables
```
Use: mcp__supabase__list_tables
Project ID: yprbbomuhugtgyqmrnhr
Schemas: ["public"]
```

### Execute SQL Query
```
Use: mcp__supabase__execute_sql
Project ID: yprbbomuhugtgyqmrnhr
```

## Context Management

### Read Context at Session Start
```bash
# Read these files in order:
cat /c/Users/Jake/cms_rebuild/app/.claude/CONTEXT.md
cat /c/Users/Jake/cms_rebuild/app/.claude/CURRENT_PHASE.md
cat /c/Users/Jake/cms_rebuild/app/.claude/RULES.md
```

### Update Context
```bash
# Edit .claude/CONTEXT.md with current state
# Then commit:
cd /c/Users/Jake/cms_rebuild/app && \
git add .claude/ && \
git commit -m "chore: update project context" && \
git push
```

### Archive Completed Phase
```bash
cd /c/Users/Jake/cms_rebuild/app && \
mv .claude/CURRENT_PHASE.md ".claude/phases/$(date +%Y-%m-%d)-phase-name.md"
```

## Testing

### Run All Tests
```bash
cd /c/Users/Jake/cms_rebuild/app && npm run test
```

### Run Tests in Watch Mode
```bash
cd /c/Users/Jake/cms_rebuild/app && npm run test:watch
```

### Run E2E Tests
```bash
cd /c/Users/Jake/cms_rebuild/app && npm run test:e2e
```

## Project Paths

```
Root:        /c/Users/Jake/cms_rebuild/app
Pages:       /c/Users/Jake/cms_rebuild/app/src/app
Components:  /c/Users/Jake/cms_rebuild/app/src/components
Lib:         /c/Users/Jake/cms_rebuild/app/src/lib
API:         /c/Users/Jake/cms_rebuild/app/src/app/api
Migrations:  /c/Users/Jake/cms_rebuild/app/supabase/migrations
Docs:        /c/Users/Jake/cms_rebuild/app/docs
Context:     /c/Users/Jake/cms_rebuild/app/.claude
```

## Supabase Project Info

```
Project ID:  yprbbomuhugtgyqmrnhr
Name:        RossOS
Region:      us-east-1
```
