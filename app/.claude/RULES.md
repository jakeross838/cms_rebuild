# Claude Autonomous Rules

> **These rules are MANDATORY for all autonomous development sessions.**
> Read and follow these rules exactly.

## Rule 1: Always Read Context First

At the START of every session:
```
1. Read .claude/CONTEXT.md
2. Read .claude/CURRENT_PHASE.md (if exists)
3. Read .claude/DECISIONS.md for any pending decisions
4. Check git status for uncommitted work
```

## Rule 2: Auto-Commit Protocol

### When to Commit

Commit IMMEDIATELY after:
- [ ] Completing a database migration
- [ ] Finishing an API endpoint (all CRUD operations)
- [ ] Completing a component or page
- [ ] Fixing a bug
- [ ] Completing any defined task/phase

### Commit Message Format

```
<type>(<scope>): <description>

[Body explaining what was done]

Phase: <phase-name>
Status: <complete|partial>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Auto-Commit Checklist

Before EVERY commit:
```
□ Run: npm run lint (fix any errors)
□ Run: npm run typecheck (fix any errors)
□ Run: npm run build (must succeed)
□ Verify no secrets/credentials in staged files
□ Update .claude/CONTEXT.md if phase completed
```

## Rule 3: Phase Management

### Starting a Phase

1. Create/update `.claude/CURRENT_PHASE.md`:
```markdown
# Current Phase: [Name]

Started: [timestamp]
Objective: [clear goal]

## Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Progress
[Updated as work progresses]
```

2. Commit phase start:
```bash
git add .claude/CURRENT_PHASE.md
git commit -m "chore: start phase - [phase name]"
```

### Completing a Phase

1. Verify all tasks complete
2. Run full validation: `npm run validate`
3. Update `.claude/CONTEXT.md` with completion summary
4. Archive phase file:
```bash
mv .claude/CURRENT_PHASE.md .claude/phases/[date]-[phase-name].md
```
5. Final commit:
```bash
git add .
git commit -m "feat: complete phase - [phase name]"
git push
```

## Rule 4: Context Preservation

### Every 30 Minutes (or major milestone)

Update `.claude/CONTEXT.md`:
- Current work status
- Any blockers encountered
- Decisions made
- Next steps

### Before Session End

ALWAYS:
1. Commit all work (even partial)
2. Update `.claude/CONTEXT.md` with session summary
3. Create `.claude/HANDOFF.md` if work is incomplete:
```markdown
# Session Handoff

## What Was Done
- [completed items]

## What's In Progress
- [partial work]

## Next Steps
1. [immediate next action]
2. [following action]

## Important Notes
- [any context the next session needs]
```
4. Push to remote

## Rule 5: Error Recovery

### If Build Fails

1. DO NOT commit broken code
2. Fix the error immediately
3. Run validation again
4. Then commit with fix

### If Stuck

1. Document the blocker in `.claude/BLOCKERS.md`
2. Commit current progress (mark as WIP)
3. Ask user for guidance
4. Do not proceed past blocker without resolution

## Rule 6: Testing Requirements

### Before Marking Phase Complete

- [ ] All new code has types
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build succeeds
- [ ] Core functionality manually verified

### For Database Changes

- [ ] Migration applied successfully
- [ ] RLS policies tested
- [ ] Indexes verified

## Rule 7: Documentation Updates

### When Adding New Features

Update these files:
- `.claude/CONTEXT.md` - Add to "Database Tables" or relevant section
- `docs/` - If user-facing documentation needed
- Code comments for complex logic

### When Making Architecture Decisions

Add to `.claude/DECISIONS.md`:
```markdown
## [Date] - [Decision Title]

**Context**: Why was this decision needed?
**Options Considered**: What alternatives existed?
**Decision**: What was chosen?
**Rationale**: Why this choice?
**Consequences**: What does this affect?
```

---

## Quick Reference Checklist

### Session Start
```
□ Read .claude/CONTEXT.md
□ Read .claude/CURRENT_PHASE.md
□ Check git status
□ Understand current state before writing code
```

### During Work
```
□ Commit after each logical unit of work
□ Update context every 30 min or major milestone
□ Run lint/typecheck before commits
□ Don't let uncommitted work pile up
```

### Session End
```
□ Commit ALL work
□ Update CONTEXT.md
□ Create HANDOFF.md if incomplete
□ Push to remote
□ Confirm push succeeded
```
