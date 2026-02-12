# Git Workflow & CI/CD

> Consistent version control enables collaboration. Follow this workflow exactly.

## Table of Contents
- [Branch Strategy](#branch-strategy)
- [Commit Standards](#commit-standards)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [CI/CD Pipeline](#cicd-pipeline)
- [Release Process](#release-process)
- [Hotfix Process](#hotfix-process)

---

## Branch Strategy

### Branch Types

```
main (production)
  │
  ├── develop (integration)
  │     │
  │     ├── feature/ROSS-123-add-job-export
  │     ├── feature/ROSS-124-invoice-templates
  │     └── feature/ROSS-125-dashboard-charts
  │
  ├── release/v1.2.0
  │
  └── hotfix/ROSS-126-fix-login-bug
```

| Branch | Purpose | Base | Merges To |
|--------|---------|------|-----------|
| `main` | Production code | - | - |
| `develop` | Integration branch | main | main (releases) |
| `feature/*` | New features | develop | develop |
| `bugfix/*` | Non-urgent fixes | develop | develop |
| `release/*` | Release preparation | develop | main + develop |
| `hotfix/*` | Urgent production fixes | main | main + develop |

### Branch Naming

```bash
# Pattern: type/ticket-short-description
feature/ROSS-123-job-export
bugfix/ROSS-124-fix-date-format
hotfix/ROSS-125-critical-auth-fix
release/v1.2.0

# Without ticket (rare)
feature/add-dark-mode
bugfix/fix-typo-in-readme
```

### Branch Rules

**main:**
- Protected - no direct pushes
- Requires PR with 1+ approvals
- Requires passing CI
- Only release and hotfix branches merge here

**develop:**
- Protected - no direct pushes
- Requires PR with 1+ approvals
- Requires passing CI
- Feature and bugfix branches merge here

---

## Commit Standards

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes bug nor adds feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, etc. |

### Scopes (Optional)

```
feat(api): add job export endpoint
fix(ui): correct button alignment
docs(readme): update installation steps
refactor(jobs): simplify status logic
test(invoices): add integration tests
chore(deps): update React to v18.2
```

### Subject Rules

- Use imperative mood: "add" not "added" or "adds"
- No period at the end
- Max 50 characters
- Capitalize first letter

### Examples

```bash
# Good
feat(jobs): add bulk export to CSV
fix(auth): prevent session timeout during form edit
refactor(api): extract pagination helper
test(invoices): add E2E tests for payment flow
chore(deps): upgrade Next.js to 14.1

# Bad
Fixed bug                           # No type, vague
feat: Added new feature for users   # Past tense, vague
FEAT(API): ADD ENDPOINT             # All caps
feat(api): add endpoint.            # Period at end
```

### Body (When Needed)

```bash
git commit -m "$(cat <<'EOF'
fix(draws): prevent duplicate submission

The submit button was not being disabled after click,
allowing users to accidentally submit the same draw
multiple times.

- Add loading state to submit button
- Disable form during submission
- Show success toast before redirect

Fixes ROSS-456
EOF
)"
```

### Breaking Changes

```bash
git commit -m "$(cat <<'EOF'
feat(api)!: change job response format

BREAKING CHANGE: The job list endpoint now returns
data in a nested format.

Before: { jobs: [...] }
After: { data: [...], pagination: {...} }

Migration: Update all clients to use response.data
instead of response.jobs
EOF
)"
```

---

## Pull Request Process

### Before Creating PR

1. **Rebase on latest develop**
   ```bash
   git fetch origin
   git rebase origin/develop
   ```

2. **Run all checks locally**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

3. **Self-review your changes**
   ```bash
   git diff origin/develop
   ```

### PR Title Format

```
[ROSS-123] feat(jobs): add bulk export feature
[ROSS-124] fix(auth): prevent session timeout
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Added bulk export button to jobs list
- Created CSV export utility
- Added unit tests for export function

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Tested on mobile viewport

## Screenshots
(If UI changes)

## Related Issues
Closes #123
```

### PR Size Guidelines

| Size | Files Changed | Guideline |
|------|--------------|-----------|
| Small | 1-5 | Ideal, quick review |
| Medium | 6-15 | Acceptable |
| Large | 16-30 | Split if possible |
| XL | 30+ | Must split |

### PR Checklist

Before requesting review:
- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated if needed
- [ ] No console.logs or debug code
- [ ] No sensitive data exposed
- [ ] Migrations are reversible
- [ ] PR description is complete

---

## Code Review Guidelines

### For Authors

1. **Keep PRs focused** - One feature/fix per PR
2. **Provide context** - Explain why, not just what
3. **Respond promptly** - Address feedback within 24h
4. **Be open to feedback** - Don't take it personally

### For Reviewers

1. **Be timely** - Review within 24h
2. **Be constructive** - Suggest improvements, don't just criticize
3. **Be specific** - Point to exact lines
4. **Prioritize** - Distinguish must-fix from nice-to-have

### Review Checklist

**Functionality:**
- [ ] Does the code do what it claims?
- [ ] Are edge cases handled?
- [ ] Is error handling appropriate?

**Code Quality:**
- [ ] Follows project standards?
- [ ] No code duplication?
- [ ] Functions are small and focused?
- [ ] Names are clear and descriptive?

**Security:**
- [ ] No sensitive data exposed?
- [ ] Input validation present?
- [ ] RLS policies correct?
- [ ] No SQL injection risks?

**Performance:**
- [ ] No N+1 queries?
- [ ] Appropriate indexes used?
- [ ] No unnecessary re-renders?

**Testing:**
- [ ] Tests cover the changes?
- [ ] Tests are meaningful (not just for coverage)?

### Review Comments

```markdown
# Blocking issue
🚫 This will cause a security vulnerability because...

# Suggestion
💡 Consider using useMemo here to prevent re-renders

# Question
❓ Why was this approach chosen over X?

# Nitpick (non-blocking)
🔧 Nit: Could use destructuring here

# Praise
👍 Nice refactor! This is much cleaner.
```

---

## CI/CD Pipeline

### Pipeline Stages

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

### Required Checks

All PRs must pass:
- ESLint (no errors)
- TypeScript (no errors)
- Unit tests (100% pass)
- Build (successful)
- E2E tests (for develop/main)

### Preview Deployments

```yaml
# Vercel automatically creates preview for each PR
# URL format: project-name-git-branch-org.vercel.app
```

---

## Release Process

### Version Numbering

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └── Bug fixes, patches
  │     └──────── New features (backwards compatible)
  └────────────── Breaking changes
```

### Release Steps

1. **Create release branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.2.0
   ```

2. **Update version**
   ```bash
   npm version minor  # or major/patch
   ```

3. **Update changelog**
   ```markdown
   ## [1.2.0] - 2024-01-15

   ### Added
   - Job bulk export feature (#123)
   - Dashboard performance charts (#124)

   ### Changed
   - Improved invoice PDF generation (#125)

   ### Fixed
   - Session timeout during form edit (#126)
   ```

4. **Create PR to main**
   - Title: `Release v1.2.0`
   - Get approval from team lead

5. **Merge and tag**
   ```bash
   # After PR is merged to main
   git checkout main
   git pull origin main
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin v1.2.0
   ```

6. **Merge back to develop**
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

7. **Create GitHub Release**
   - Go to Releases > Draft new release
   - Select tag v1.2.0
   - Copy changelog content
   - Publish release

---

## Hotfix Process

### When to Hotfix

- Critical production bug
- Security vulnerability
- Data corruption risk

### Hotfix Steps

1. **Create hotfix branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/ROSS-999-critical-fix
   ```

2. **Make the fix**
   - Keep changes minimal
   - Add tests for the fix
   - Update version (patch)

3. **Create PR to main**
   - Title: `[HOTFIX] ROSS-999: Fix critical auth bug`
   - Request expedited review

4. **After merge to main**
   ```bash
   # Tag the hotfix
   git checkout main
   git pull origin main
   git tag -a v1.2.1 -m "Hotfix v1.2.1"
   git push origin v1.2.1

   # Merge to develop
   git checkout develop
   git merge main
   git push origin develop
   ```

5. **Deploy immediately**
   - Monitor error rates
   - Be ready to rollback

---

## Git Commands Reference

### Daily Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/ROSS-123-new-feature

# Save work
git add .
git commit -m "feat(scope): description"

# Push and create PR
git push -u origin feature/ROSS-123-new-feature

# Update from develop
git fetch origin
git rebase origin/develop

# After PR merged, cleanup
git checkout develop
git pull origin develop
git branch -d feature/ROSS-123-new-feature
```

### Useful Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Amend last commit
git commit --amend

# Interactive rebase (squash commits)
git rebase -i HEAD~3

# Stash changes
git stash
git stash pop

# View commit history
git log --oneline --graph

# Find who changed a line
git blame file.ts

# Find commit that introduced bug
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
```
