# RossOS DevOps Pipeline

> **Purpose**: Comprehensive DevOps pipeline documentation for RossOS Construction Management SaaS.
>
> **Stack**: Next.js 16, Supabase, TypeScript, Vercel
>
> **Last Updated**: 2026-02-12

---

## Table of Contents

1. [Environment Strategy](#1-environment-strategy)
2. [CI/CD Pipeline](#2-cicd-pipeline-github-actions)
3. [Database Migrations](#3-database-migrations)
4. [Deployment Strategy](#4-deployment-strategy)
5. [Monitoring & Alerting](#5-monitoring--alerting)
6. [Log Aggregation](#6-log-aggregation)
7. [Infrastructure as Code](#7-infrastructure-as-code)
8. [Security Practices](#8-security-practices)
9. [Performance Budgets](#9-performance-budgets)
10. [Incident Response](#10-incident-response)

---

## 1. Environment Strategy

### 1.1 Environment Overview

| Environment | Purpose | URL | Branch | Database |
|-------------|---------|-----|--------|----------|
| **Development** | Local development | `localhost:3000` | `feature/*` | Local Supabase |
| **Staging** | Pre-production testing | `staging.rossos.app` | `main` | Staging Supabase |
| **Production** | Live application | `app.rossos.app` | `release/*` tags | Production Supabase |

### 1.2 Environment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENVIRONMENT ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   DEVELOPMENT                STAGING                  PRODUCTION            │
│   ───────────               ─────────                ────────────           │
│   ┌─────────────┐           ┌─────────────┐          ┌─────────────┐       │
│   │ localhost   │           │ Vercel      │          │ Vercel      │       │
│   │ :3000       │           │ Preview     │          │ Production  │       │
│   └──────┬──────┘           └──────┬──────┘          └──────┬──────┘       │
│          │                         │                        │               │
│          ▼                         ▼                        ▼               │
│   ┌─────────────┐           ┌─────────────┐          ┌─────────────┐       │
│   │ Supabase    │           │ Supabase    │          │ Supabase    │       │
│   │ Local/Dev   │           │ Staging     │          │ Production  │       │
│   └─────────────┘           └─────────────┘          └─────────────┘       │
│                                                                              │
│   Feature flags: ON          Feature flags: TESTING   Feature flags: STABLE │
│   Debug logs: ON             Debug logs: ON           Debug logs: ERRORS    │
│   Rate limits: OFF           Rate limits: RELAXED     Rate limits: STRICT   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Environment Variables

#### Required Variables per Environment

```bash
# =============================================================================
# ENVIRONMENT VARIABLES TEMPLATE
# =============================================================================
# Copy to .env.local for development
# Set in Vercel dashboard for staging/production

# -----------------------------------------------------------------------------
# Application
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=https://app.rossos.app
NEXT_PUBLIC_APP_ENV=production  # development | staging | production
NODE_ENV=production

# -----------------------------------------------------------------------------
# Supabase
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PROJECT_ID=xxxxx

# Database Direct Connection (for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres

# -----------------------------------------------------------------------------
# Authentication
# -----------------------------------------------------------------------------
SUPABASE_JWT_SECRET=your-jwt-secret-min-32-chars

# -----------------------------------------------------------------------------
# Monitoring & Error Tracking
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxx
SENTRY_ORG=rossos
SENTRY_PROJECT=rossos-web

# -----------------------------------------------------------------------------
# Analytics
# -----------------------------------------------------------------------------
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxxxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# -----------------------------------------------------------------------------
# External Services
# -----------------------------------------------------------------------------
# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@rossos.app

# File Storage (if using external CDN)
CLOUDINARY_URL=cloudinary://xxxxx:xxxxx@rossos

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# QuickBooks Integration
QUICKBOOKS_CLIENT_ID=xxxxx
QUICKBOOKS_CLIENT_SECRET=xxxxx

# -----------------------------------------------------------------------------
# Feature Flags
# -----------------------------------------------------------------------------
NEXT_PUBLIC_ENABLE_MOBILE_APP=false
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false

# -----------------------------------------------------------------------------
# Security
# -----------------------------------------------------------------------------
# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-here
```

#### Environment-Specific Overrides

**Development (.env.local)**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
NEXT_PUBLIC_ENABLE_BETA_FEATURES=true
```

**Staging (Vercel Environment)**
```bash
NEXT_PUBLIC_APP_URL=https://staging.rossos.app
NEXT_PUBLIC_APP_ENV=staging
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_ENABLE_BETA_FEATURES=true
```

**Production (Vercel Environment)**
```bash
NEXT_PUBLIC_APP_URL=https://app.rossos.app
NEXT_PUBLIC_APP_ENV=production
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

### 1.4 Secrets Management

#### Secrets Storage Strategy

| Secret Type | Storage Location | Access Method |
|-------------|------------------|---------------|
| API Keys | Vercel Environment Variables | `process.env.KEY` |
| Database Credentials | Vercel + Supabase Vault | `process.env.DATABASE_URL` |
| Encryption Keys | Vercel (Encrypted) | `process.env.ENCRYPTION_KEY` |
| Third-party OAuth | Vercel Environment Variables | `process.env.OAUTH_SECRET` |
| Webhook Secrets | Vercel + DB per tenant | `process.env` / DB lookup |

#### Secret Rotation Procedures

```markdown
## Secret Rotation Runbook

### 1. Database Credentials
1. Generate new password in Supabase dashboard
2. Update Vercel environment variable
3. Redeploy application
4. Verify connections in logs
5. Update local .env.local

### 2. API Keys (Stripe, SendGrid, etc.)
1. Generate new key in provider dashboard
2. Update Vercel environment variable (staging first)
3. Deploy to staging, verify functionality
4. Update production environment variable
5. Revoke old key in provider dashboard

### 3. JWT Secrets
1. Generate new secret: `openssl rand -base64 32`
2. Update Supabase project settings
3. Update Vercel environment variable
4. Note: All existing sessions will be invalidated

### 4. Encryption Keys
⚠️ CRITICAL: Data encrypted with old key must be re-encrypted
1. Add new key as ENCRYPTION_KEY_NEW
2. Deploy migration to re-encrypt data
3. Verify all data accessible
4. Rotate ENCRYPTION_KEY_NEW to ENCRYPTION_KEY
5. Remove old key
```

---

## 2. CI/CD Pipeline (GitHub Actions)

### 2.1 Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CI/CD PIPELINE FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   PULL REQUEST                    MERGE TO MAIN              RELEASE TAG    │
│   ─────────────                  ──────────────              ───────────    │
│                                                                              │
│   ┌─────────────┐               ┌─────────────┐             ┌─────────────┐ │
│   │   Lint      │               │   All PR    │             │   All PR    │ │
│   │   ↓         │               │   Checks    │             │   Checks    │ │
│   │  Typecheck  │               │   ↓         │             │   ↓         │ │
│   │   ↓         │               │  Deploy to  │             │  Deploy to  │ │
│   │  Unit Tests │               │  Staging    │             │  Production │ │
│   │   ↓         │               │   ↓         │             │   ↓         │ │
│   │  Build      │               │  E2E Tests  │             │  Smoke      │ │
│   │   ↓         │               │  (Staging)  │             │  Tests      │ │
│   │  Preview    │               │   ↓         │             │   ↓         │ │
│   │  Deploy     │               │  Notify     │             │  Notify     │ │
│   └─────────────┘               └─────────────┘             └─────────────┘ │
│                                                                              │
│   Triggers:                     Triggers:                   Triggers:       │
│   - PR opened                   - Push to main              - Tag v*.*.*    │
│   - PR synchronized             - PR merged                 - Release       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 GitHub Actions Workflow Files

#### Main CI Workflow (`.github/workflows/ci.yml`)

```yaml
# =============================================================================
# CI Pipeline - Pull Request Checks
# =============================================================================
# Runs on every pull request to ensure code quality

name: CI

on:
  pull_request:
    branches: [main, develop]
    types: [opened, synchronize, reopened]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # ---------------------------------------------------------------------------
  # Lint & Format Check
  # ---------------------------------------------------------------------------
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install dependencies
        working-directory: ./app
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        working-directory: ./app
        run: pnpm lint

      - name: Check formatting
        working-directory: ./app
        run: pnpm format:check

  # ---------------------------------------------------------------------------
  # TypeScript Type Check
  # ---------------------------------------------------------------------------
  typecheck:
    name: TypeScript
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install dependencies
        working-directory: ./app
        run: pnpm install --frozen-lockfile

      - name: Run TypeScript compiler
        working-directory: ./app
        run: pnpm typecheck

  # ---------------------------------------------------------------------------
  # Unit & Integration Tests
  # ---------------------------------------------------------------------------
  test:
    name: Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install dependencies
        working-directory: ./app
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        working-directory: ./app
        run: pnpm test:coverage
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ./app/coverage
          flags: unittests
          fail_ci_if_error: false

  # ---------------------------------------------------------------------------
  # Build Check
  # ---------------------------------------------------------------------------
  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [lint, typecheck]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install dependencies
        working-directory: ./app
        run: pnpm install --frozen-lockfile

      - name: Build application
        working-directory: ./app
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_APP_ENV: staging

      - name: Check bundle size
        working-directory: ./app
        run: |
          # Extract and check bundle sizes
          echo "Checking bundle sizes..."
          BUNDLE_SIZE=$(du -sh .next | cut -f1)
          echo "Total bundle size: $BUNDLE_SIZE"

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: app/.next
          retention-days: 1

  # ---------------------------------------------------------------------------
  # Security Scanning
  # ---------------------------------------------------------------------------
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install dependencies
        working-directory: ./app
        run: pnpm install --frozen-lockfile

      - name: Run npm audit
        working-directory: ./app
        run: pnpm audit --audit-level=high
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        with:
          args: --all-projects --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # ---------------------------------------------------------------------------
  # Database Migration Check
  # ---------------------------------------------------------------------------
  migration-check:
    name: Migration Check
    runs-on: ubuntu-latest
    timeout-minutes: 10
    if: contains(github.event.pull_request.labels.*.name, 'has-migrations') || github.event_name == 'push'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Validate migrations
        run: |
          # Check migration file naming convention
          for file in supabase/migrations/*.sql; do
            if [[ -f "$file" ]]; then
              filename=$(basename "$file")
              if ! [[ $filename =~ ^[0-9]{14}_.+\.sql$ ]]; then
                echo "Invalid migration filename: $filename"
                echo "Expected format: YYYYMMDDHHMMSS_description.sql"
                exit 1
              fi
            fi
          done
          echo "All migration files follow naming convention"

      - name: Check for breaking changes
        run: |
          # Placeholder for migration safety checks
          echo "Checking for potentially breaking migration changes..."
          # Could integrate with sqlfluff or custom checks

  # ---------------------------------------------------------------------------
  # PR Status Summary
  # ---------------------------------------------------------------------------
  pr-status:
    name: PR Status
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test, build, security]
    if: always()

    steps:
      - name: Check job results
        run: |
          if [ "${{ needs.lint.result }}" == "failure" ] || \
             [ "${{ needs.typecheck.result }}" == "failure" ] || \
             [ "${{ needs.test.result }}" == "failure" ] || \
             [ "${{ needs.build.result }}" == "failure" ]; then
            echo "One or more required checks failed"
            exit 1
          fi
          echo "All required checks passed!"
```

#### Deploy to Staging Workflow (`.github/workflows/deploy-staging.yml`)

```yaml
# =============================================================================
# Deploy to Staging
# =============================================================================
# Deploys to staging environment on merge to main

name: Deploy Staging

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: staging-deployment
  cancel-in-progress: false

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # ---------------------------------------------------------------------------
  # Run Database Migrations
  # ---------------------------------------------------------------------------
  migrate:
    name: Database Migrations
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: staging

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link to Supabase project
        run: |
          supabase link --project-ref ${{ secrets.STAGING_SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run migrations
        run: |
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.STAGING_SUPABASE_DB_PASSWORD }}

      - name: Generate TypeScript types
        run: |
          supabase gen types typescript --project-id ${{ secrets.STAGING_SUPABASE_PROJECT_ID }} > src/types/database.ts
        working-directory: ./app

  # ---------------------------------------------------------------------------
  # Deploy to Vercel Staging
  # ---------------------------------------------------------------------------
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: [migrate]
    environment: staging

    outputs:
      deployment-url: ${{ steps.deploy.outputs.url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: '8'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./app

      - name: Build project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./app

      - name: Deploy to Vercel
        id: deploy
        run: |
          URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$URL" >> $GITHUB_OUTPUT
        working-directory: ./app

      - name: Alias to staging domain
        run: |
          vercel alias ${{ steps.deploy.outputs.url }} staging.rossos.app --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./app

  # ---------------------------------------------------------------------------
  # E2E Tests on Staging
  # ---------------------------------------------------------------------------
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    needs: [deploy]
    environment: staging

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: '8'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install dependencies
        working-directory: ./app
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        working-directory: ./app
        run: pnpm exec playwright install --with-deps chromium

      - name: Run E2E tests
        working-directory: ./app
        run: pnpm test:e2e
        env:
          PLAYWRIGHT_TEST_BASE_URL: ${{ needs.deploy.outputs.deployment-url }}
          TEST_USER_EMAIL: ${{ secrets.E2E_TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.E2E_TEST_USER_PASSWORD }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: app/playwright-report/
          retention-days: 7

  # ---------------------------------------------------------------------------
  # Lighthouse Performance Audit
  # ---------------------------------------------------------------------------
  lighthouse:
    name: Lighthouse Audit
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [deploy]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            ${{ needs.deploy.outputs.deployment-url }}
            ${{ needs.deploy.outputs.deployment-url }}/login
            ${{ needs.deploy.outputs.deployment-url }}/dashboard
          configPath: ./app/lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true

  # ---------------------------------------------------------------------------
  # Notify on Deployment
  # ---------------------------------------------------------------------------
  notify:
    name: Notify
    runs-on: ubuntu-latest
    needs: [deploy, e2e-tests]
    if: always()

    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "Staging Deployment: ${{ needs.deploy.result == 'success' && 'SUCCESS' || 'FAILED' }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment*\n• Status: ${{ needs.deploy.result }}\n• E2E Tests: ${{ needs.e2e-tests.result }}\n• URL: ${{ needs.deploy.outputs.deployment-url }}\n• Commit: `${{ github.sha }}`"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

#### Deploy to Production Workflow (`.github/workflows/deploy-production.yml`)

```yaml
# =============================================================================
# Deploy to Production
# =============================================================================
# Deploys to production on release tag

name: Deploy Production

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag to deploy (e.g., v1.2.3)'
        required: true
        type: string

concurrency:
  group: production-deployment
  cancel-in-progress: false

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # ---------------------------------------------------------------------------
  # Pre-deployment Validation
  # ---------------------------------------------------------------------------
  validate:
    name: Pre-deployment Validation
    runs-on: ubuntu-latest
    timeout-minutes: 10

    outputs:
      version: ${{ steps.version.outputs.version }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.tag || github.ref }}

      - name: Extract version
        id: version
        run: |
          if [ -n "${{ github.event.inputs.tag }}" ]; then
            VERSION="${{ github.event.inputs.tag }}"
          else
            VERSION="${GITHUB_REF#refs/tags/}"
          fi
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "Deploying version: $VERSION"

      - name: Validate tag format
        run: |
          VERSION="${{ steps.version.outputs.version }}"
          if ! [[ $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
            echo "Invalid version format: $VERSION"
            echo "Expected format: vX.Y.Z or vX.Y.Z-suffix"
            exit 1
          fi

      - name: Check staging deployment
        run: |
          # Verify this version was tested on staging
          echo "Verifying staging deployment for version ${{ steps.version.outputs.version }}"
          # Could add actual verification here

  # ---------------------------------------------------------------------------
  # Database Migrations
  # ---------------------------------------------------------------------------
  migrate:
    name: Database Migrations
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [validate]
    environment: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.tag || github.ref }}

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Create migration backup point
        run: |
          echo "Creating backup point before migration..."
          # Supabase automatically creates backup points
          # This step is for logging/audit purposes
          echo "Backup created at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

      - name: Link to production Supabase
        run: |
          supabase link --project-ref ${{ secrets.PRODUCTION_SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run migrations
        run: |
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.PRODUCTION_SUPABASE_DB_PASSWORD }}

      - name: Verify migration success
        run: |
          echo "Verifying migration completed successfully..."
          # Could add custom verification queries here

  # ---------------------------------------------------------------------------
  # Deploy to Production
  # ---------------------------------------------------------------------------
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: [validate, migrate]
    environment: production

    outputs:
      deployment-url: ${{ steps.deploy.outputs.url }}
      deployment-id: ${{ steps.deploy.outputs.id }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.tag || github.ref }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: '8'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./app

      - name: Build project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./app

      - name: Deploy to Vercel Production
        id: deploy
        run: |
          OUTPUT=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }} 2>&1)
          URL=$(echo "$OUTPUT" | grep -oP 'https://[^\s]+\.vercel\.app' | head -1)
          echo "url=$URL" >> $GITHUB_OUTPUT
          echo "Deployment URL: $URL"
        working-directory: ./app

  # ---------------------------------------------------------------------------
  # Smoke Tests
  # ---------------------------------------------------------------------------
  smoke-tests:
    name: Production Smoke Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [deploy]
    environment: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Health check
        run: |
          echo "Running health checks..."

          # Check main endpoint
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.rossos.app)
          if [ "$HTTP_STATUS" != "200" ]; then
            echo "Health check failed: HTTP $HTTP_STATUS"
            exit 1
          fi
          echo "Main endpoint: OK (HTTP $HTTP_STATUS)"

          # Check API health endpoint
          API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.rossos.app/api/health)
          if [ "$API_STATUS" != "200" ]; then
            echo "API health check failed: HTTP $API_STATUS"
            exit 1
          fi
          echo "API endpoint: OK (HTTP $API_STATUS)"

          # Check login page
          LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.rossos.app/login)
          if [ "$LOGIN_STATUS" != "200" ]; then
            echo "Login page check failed: HTTP $LOGIN_STATUS"
            exit 1
          fi
          echo "Login page: OK (HTTP $LOGIN_STATUS)"

          echo "All smoke tests passed!"

  # ---------------------------------------------------------------------------
  # Notify & Document
  # ---------------------------------------------------------------------------
  notify:
    name: Notify & Document
    runs-on: ubuntu-latest
    needs: [validate, deploy, smoke-tests]
    if: always()

    steps:
      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: rossos
          SENTRY_PROJECT: rossos-web
        with:
          environment: production
          version: ${{ needs.validate.outputs.version }}

      - name: Send deployment notification
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "Production Deployment: ${{ needs.deploy.result == 'success' && 'SUCCESS' || 'FAILED' }}",
              "blocks": [
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "Production Deployment ${{ needs.deploy.result == 'success' && '✅' || '❌' }}"
                  }
                },
                {
                  "type": "section",
                  "fields": [
                    {
                      "type": "mrkdwn",
                      "text": "*Version:*\n${{ needs.validate.outputs.version }}"
                    },
                    {
                      "type": "mrkdwn",
                      "text": "*Status:*\n${{ needs.deploy.result }}"
                    },
                    {
                      "type": "mrkdwn",
                      "text": "*Smoke Tests:*\n${{ needs.smoke-tests.result }}"
                    },
                    {
                      "type": "mrkdwn",
                      "text": "*URL:*\nhttps://app.rossos.app"
                    }
                  ]
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": "Deployed by: ${{ github.actor }} | Commit: `${{ github.sha }}`"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK

  # ---------------------------------------------------------------------------
  # Rollback on Failure
  # ---------------------------------------------------------------------------
  rollback:
    name: Rollback on Failure
    runs-on: ubuntu-latest
    needs: [deploy, smoke-tests]
    if: failure()
    environment: production

    steps:
      - name: Trigger rollback
        run: |
          echo "⚠️ Deployment failed - initiating rollback"
          echo "Manual intervention may be required"
          echo "Check deployment logs and smoke test results"

          # Alert on-call team
          curl -X POST ${{ secrets.PAGERDUTY_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{
              "event_action": "trigger",
              "routing_key": "${{ secrets.PAGERDUTY_ROUTING_KEY }}",
              "payload": {
                "summary": "Production deployment failed - rollback required",
                "severity": "critical",
                "source": "GitHub Actions",
                "custom_details": {
                  "version": "${{ needs.validate.outputs.version }}",
                  "commit": "${{ github.sha }}",
                  "workflow_url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                }
              }
            }'
```

#### Nightly Maintenance Workflow (`.github/workflows/nightly.yml`)

```yaml
# =============================================================================
# Nightly Maintenance
# =============================================================================
# Runs nightly checks and maintenance tasks

name: Nightly Maintenance

on:
  schedule:
    - cron: '0 4 * * *'  # 4 AM UTC daily
  workflow_dispatch:

jobs:
  # ---------------------------------------------------------------------------
  # Dependency Updates Check
  # ---------------------------------------------------------------------------
  dependency-check:
    name: Check Dependencies
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: '8'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: 'app/pnpm-lock.yaml'

      - name: Install dependencies
        working-directory: ./app
        run: pnpm install --frozen-lockfile

      - name: Check for outdated packages
        working-directory: ./app
        run: |
          echo "## Outdated Packages Report" >> $GITHUB_STEP_SUMMARY
          echo '```' >> $GITHUB_STEP_SUMMARY
          pnpm outdated || true >> $GITHUB_STEP_SUMMARY
          echo '```' >> $GITHUB_STEP_SUMMARY

      - name: Security audit
        working-directory: ./app
        run: |
          echo "## Security Audit Report" >> $GITHUB_STEP_SUMMARY
          echo '```' >> $GITHUB_STEP_SUMMARY
          pnpm audit || true >> $GITHUB_STEP_SUMMARY
          echo '```' >> $GITHUB_STEP_SUMMARY

  # ---------------------------------------------------------------------------
  # Database Health Check
  # ---------------------------------------------------------------------------
  database-health:
    name: Database Health Check
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Check database connectivity
        run: |
          # Staging check
          echo "Checking staging database..."
          # Production check
          echo "Checking production database..."

      - name: Check for long-running queries
        run: |
          echo "Checking for long-running queries..."
          # Could use Supabase API to check query performance

      - name: Check table sizes
        run: |
          echo "Checking table sizes..."
          # Monitor for tables that might need partitioning

  # ---------------------------------------------------------------------------
  # Performance Baseline
  # ---------------------------------------------------------------------------
  performance-baseline:
    name: Performance Baseline
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Lighthouse on production
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://app.rossos.app
            https://app.rossos.app/login
          configPath: ./app/lighthouserc.json
          uploadArtifacts: true

      - name: Store baseline metrics
        run: |
          echo "Storing performance baseline metrics..."
          # Could store in a metrics database or file

  # ---------------------------------------------------------------------------
  # Cleanup
  # ---------------------------------------------------------------------------
  cleanup:
    name: Cleanup
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Clean old artifacts
        uses: c-hive/gha-remove-artifacts@v1
        with:
          age: '7 days'
          skip-tags: true
          skip-recent: 5
```

### 2.3 Required GitHub Secrets

```yaml
# =============================================================================
# REQUIRED GITHUB SECRETS
# =============================================================================
# Configure these in Settings > Secrets and variables > Actions

# Vercel
VERCEL_TOKEN: "Your Vercel API token"
VERCEL_ORG_ID: "Your Vercel organization ID"
VERCEL_PROJECT_ID: "Your Vercel project ID"

# Supabase
SUPABASE_ACCESS_TOKEN: "Supabase CLI access token"
STAGING_SUPABASE_PROJECT_ID: "Staging project reference ID"
STAGING_SUPABASE_URL: "https://xxxxx.supabase.co"
STAGING_SUPABASE_ANON_KEY: "Staging anon key"
STAGING_SUPABASE_DB_PASSWORD: "Staging database password"
PRODUCTION_SUPABASE_PROJECT_ID: "Production project reference ID"
PRODUCTION_SUPABASE_URL: "https://xxxxx.supabase.co"
PRODUCTION_SUPABASE_ANON_KEY: "Production anon key"
PRODUCTION_SUPABASE_DB_PASSWORD: "Production database password"

# Testing
TEST_SUPABASE_ANON_KEY: "Test environment anon key"
E2E_TEST_USER_EMAIL: "test@rossos.app"
E2E_TEST_USER_PASSWORD: "secure-test-password"

# Monitoring
SENTRY_AUTH_TOKEN: "Sentry authentication token"
SNYK_TOKEN: "Snyk API token"

# Notifications
SLACK_WEBHOOK_URL: "Slack incoming webhook URL"
PAGERDUTY_WEBHOOK_URL: "PagerDuty events API URL"
PAGERDUTY_ROUTING_KEY: "PagerDuty routing key"

# Code Coverage
CODECOV_TOKEN: "Codecov upload token"
```

---

## 3. Database Migrations

### 3.1 Migration Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE MIGRATION WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. CREATE          2. TEST LOCAL        3. REVIEW         4. DEPLOY       │
│   ─────────          ────────────         ──────────        ──────────      │
│   ┌─────────┐        ┌─────────┐         ┌─────────┐       ┌─────────┐     │
│   │ Generate │        │ Apply to │         │ PR      │       │ Auto-   │     │
│   │ migration│───────▶│ local DB │────────▶│ Review  │──────▶│ deploy  │     │
│   │ file     │        │          │         │         │       │ staging │     │
│   └─────────┘        └─────────┘         └─────────┘       └────┬────┘     │
│                                                                  │          │
│                                                                  ▼          │
│                                                            ┌─────────┐     │
│                                                            │ Deploy  │     │
│                                                            │ prod    │     │
│                                                            └─────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Migration Naming Convention

```
Format: YYYYMMDDHHMMSS_descriptive_name.sql

Examples:
  20260212143000_create_users_table.sql
  20260212143100_add_email_index_to_users.sql
  20260212143200_create_projects_table.sql
  20260212143300_add_rls_policies_to_projects.sql
```

**Naming Rules:**
- Timestamp prefix for ordering (use `supabase migration new` to generate)
- Lowercase with underscores
- Descriptive action: `create_`, `add_`, `remove_`, `alter_`, `fix_`, `update_`
- Target entity name
- Be specific: `add_email_index_to_users` not just `update_users`

### 3.3 Migration File Structure

```sql
-- =============================================================================
-- Migration: 20260212143000_create_projects_table
-- Description: Create projects table with RLS policies
-- Author: developer@rossos.app
-- =============================================================================

-- -----------------------------------------------------------------------------
-- UP Migration
-- -----------------------------------------------------------------------------

-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view projects in their company"
    ON projects FOR SELECT
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create projects in their company"
    ON projects FOR INSERT
    WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update projects in their company"
    ON projects FOR UPDATE
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- ROLLBACK Instructions (manual)
-- -----------------------------------------------------------------------------
-- To rollback this migration, run:
--
-- DROP POLICY IF EXISTS "Users can update projects in their company" ON projects;
-- DROP POLICY IF EXISTS "Users can create projects in their company" ON projects;
-- DROP POLICY IF EXISTS "Users can view projects in their company" ON projects;
-- DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
-- DROP TABLE IF EXISTS projects;
-- -----------------------------------------------------------------------------
```

### 3.4 Migration Types

#### Schema Migrations
Changes to database structure (tables, columns, indexes, constraints).

```sql
-- Example: Adding a new column
ALTER TABLE projects ADD COLUMN budget DECIMAL(12, 2);

-- Example: Creating an index
CREATE INDEX CONCURRENTLY idx_projects_budget ON projects(budget);

-- Example: Adding a foreign key
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
```

#### Data Migrations
Changes to existing data (backfills, transformations, corrections).

```sql
-- Example: Backfill a new column
UPDATE projects
SET budget = 0
WHERE budget IS NULL;

-- Example: Data transformation
UPDATE users
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL;

-- Example: Data correction
UPDATE invoices
SET status = 'paid'
WHERE payment_date IS NOT NULL AND status = 'pending';
```

### 3.5 Zero-Downtime Migration Strategies

#### Adding a Column

```sql
-- Step 1: Add column as nullable (no lock)
ALTER TABLE projects ADD COLUMN budget DECIMAL(12, 2);

-- Step 2: Backfill data in batches (application code)
-- Do this in small batches to avoid long transactions

-- Step 3: Add NOT NULL constraint after backfill (if needed)
ALTER TABLE projects ALTER COLUMN budget SET DEFAULT 0;
ALTER TABLE projects ALTER COLUMN budget SET NOT NULL;
```

#### Removing a Column

```sql
-- Step 1: Stop writing to the column (application code change)
-- Deploy application that no longer uses the column

-- Step 2: Wait for all old instances to drain

-- Step 3: Remove the column
ALTER TABLE projects DROP COLUMN old_column;
```

#### Renaming a Column

```sql
-- Step 1: Add new column
ALTER TABLE projects ADD COLUMN project_name TEXT;

-- Step 2: Copy data
UPDATE projects SET project_name = name;

-- Step 3: Update application to use new column
-- Deploy changes

-- Step 4: Remove old column
ALTER TABLE projects DROP COLUMN name;
```

#### Adding an Index

```sql
-- Use CONCURRENTLY to avoid locking the table
CREATE INDEX CONCURRENTLY idx_projects_name ON projects(name);

-- Note: CONCURRENTLY cannot be used in a transaction
-- Must be run as a separate statement
```

### 3.6 Rollback Procedures

#### Automatic Rollback (Supabase)

Supabase maintains migration history in `supabase_migrations.schema_migrations` table.

```bash
# View migration history
supabase migration list

# Rollback last migration (creates a new down migration)
supabase migration repair --status reverted <migration_version>
```

#### Manual Rollback Runbook

```markdown
## Migration Rollback Runbook

### Pre-Rollback Checklist
- [ ] Identify the migration to rollback
- [ ] Review rollback SQL (in migration file comments)
- [ ] Notify team on Slack #engineering
- [ ] Create incident ticket
- [ ] Backup current state

### Rollback Steps

1. **Stop deployments**
   ```bash
   # Cancel any in-progress deployments
   vercel rollback --scope rossos
   ```

2. **Connect to database**
   ```bash
   supabase db remote connect
   ```

3. **Execute rollback SQL**
   ```sql
   -- Run the rollback statements from migration comments
   BEGIN;

   -- Your rollback SQL here

   COMMIT;
   ```

4. **Update migration table**
   ```sql
   DELETE FROM supabase_migrations.schema_migrations
   WHERE version = 'YYYYMMDDHHMMSS';
   ```

5. **Deploy previous application version**
   ```bash
   vercel rollback --target <previous-deployment-id>
   ```

6. **Verify application health**
   - Check /api/health endpoint
   - Run smoke tests
   - Monitor error rates

### Post-Rollback
- [ ] Update incident ticket
- [ ] Post to Slack with status
- [ ] Schedule post-mortem if needed
```

### 3.7 Migration Safety Checklist

```markdown
## Pre-Migration Checklist

### Schema Changes
- [ ] Migration has rollback instructions
- [ ] No DROP TABLE without data backup
- [ ] No DROP COLUMN with active application use
- [ ] Indexes use CONCURRENTLY where possible
- [ ] Foreign keys have appropriate ON DELETE action
- [ ] RLS policies are included for new tables
- [ ] Triggers and functions are idempotent

### Data Changes
- [ ] Backfills run in batches (not single UPDATE)
- [ ] Data types are compatible
- [ ] NULL handling is explicit
- [ ] No duplicate key violations possible

### Testing
- [ ] Tested on local Supabase
- [ ] Tested on staging environment
- [ ] Performance impact assessed
- [ ] Rollback tested

### Deployment
- [ ] Low-traffic time selected for risky migrations
- [ ] Team notified
- [ ] Monitoring dashboards open
- [ ] Rollback plan ready
```

---

## 4. Deployment Strategy

### 4.1 Vercel Configuration

#### `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/docs",
      "destination": "https://docs.rossos.app",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "/api/:path*"
    }
  ],
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### 4.2 Preview Deployments

Every pull request automatically gets a preview deployment.

**Preview URL Pattern:** `rossos-<branch>-<hash>.vercel.app`

**Preview Environment Configuration:**
- Uses staging Supabase instance
- Feature flags enabled for testing
- Relaxed rate limits
- Debug logging enabled

### 4.3 Production Deployment Checklist

```markdown
## Production Deployment Checklist

### Pre-Deployment (T-1 day)
- [ ] All PR checks passing
- [ ] Code review approved
- [ ] QA sign-off obtained
- [ ] Release notes drafted
- [ ] Database migrations tested on staging
- [ ] Performance baseline captured

### Pre-Deployment (T-1 hour)
- [ ] Check Sentry for elevated error rates
- [ ] Check Supabase dashboard for anomalies
- [ ] Notify #engineering channel
- [ ] Ensure on-call engineer available
- [ ] Open monitoring dashboards

### Deployment
- [ ] Create release tag: `git tag v1.2.3 && git push --tags`
- [ ] Monitor GitHub Actions workflow
- [ ] Watch database migration logs
- [ ] Monitor Vercel deployment progress

### Post-Deployment (T+5 minutes)
- [ ] Smoke tests passing
- [ ] Check /api/health endpoint
- [ ] Check Sentry for new errors
- [ ] Verify key user flows manually
- [ ] Check performance metrics

### Post-Deployment (T+30 minutes)
- [ ] Monitor error rates
- [ ] Check database query performance
- [ ] Review Vercel Analytics
- [ ] Update release notes
- [ ] Close deployment ticket

### Rollback Triggers
Initiate rollback if:
- [ ] Error rate increases >5x baseline
- [ ] P50 latency increases >2x
- [ ] Critical user flow broken
- [ ] Database errors detected
- [ ] Security vulnerability discovered
```

### 4.4 Rollback Procedures

#### Quick Rollback (Vercel Instant Rollback)

```bash
# List recent deployments
vercel ls --scope rossos

# Instant rollback to previous deployment
vercel rollback --scope rossos

# Rollback to specific deployment
vercel rollback <deployment-url> --scope rossos
```

#### Full Rollback (Including Database)

```markdown
## Full Rollback Runbook

### Step 1: Stop the Bleeding
1. Rollback Vercel deployment immediately
   ```bash
   vercel rollback --scope rossos
   ```

2. Notify team on Slack #incidents
   ```
   @channel Production rollback in progress
   - Issue: [Brief description]
   - Affected: [Components]
   - Status: Rolling back
   ```

### Step 2: Assess Database State
1. Check if migration ran successfully
2. Determine if data was modified
3. Decide if DB rollback needed

### Step 3: Database Rollback (If Needed)
1. Connect to production database
2. Run rollback SQL
3. Update migration table
4. Verify data integrity

### Step 4: Verify Rollback
1. Check /api/health
2. Run smoke tests
3. Monitor error rates
4. Check key user flows

### Step 5: Communication
1. Update Slack with status
2. Update status page if public-facing
3. Create incident report
4. Schedule post-mortem
```

### 4.5 Blue-Green Deployment Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BLUE-GREEN DEPLOYMENT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Current State: BLUE is LIVE                                               │
│                                                                              │
│   ┌─────────────────┐              ┌─────────────────┐                      │
│   │    BLUE ENV     │◀── Traffic   │   GREEN ENV     │                      │
│   │   v1.2.2        │              │   (idle)        │                      │
│   │   LIVE          │              │                 │                      │
│   └─────────────────┘              └─────────────────┘                      │
│                                                                              │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│   Deployment Phase: Deploy to GREEN                                          │
│                                                                              │
│   ┌─────────────────┐              ┌─────────────────┐                      │
│   │    BLUE ENV     │◀── Traffic   │   GREEN ENV     │                      │
│   │   v1.2.2        │              │   v1.2.3        │ ◀── Deploy here     │
│   │   LIVE          │              │   (testing)     │                      │
│   └─────────────────┘              └─────────────────┘                      │
│                                                                              │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│   Switch Phase: Route traffic to GREEN                                       │
│                                                                              │
│   ┌─────────────────┐              ┌─────────────────┐                      │
│   │    BLUE ENV     │              │   GREEN ENV     │◀── Traffic           │
│   │   v1.2.2        │              │   v1.2.3        │                      │
│   │   (standby)     │              │   LIVE          │                      │
│   └─────────────────┘              └─────────────────┘                      │
│                                                                              │
│   Rollback: Switch traffic back to BLUE (instant)                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation with Vercel:**

Vercel's instant rollback feature provides blue-green-like capabilities:
- Each deployment is immutable
- Traffic can be switched instantly
- Previous deployments remain available
- No downtime during switches

---

## 5. Monitoring & Alerting

### 5.1 Monitoring Stack Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MONITORING ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   APPLICATION                ERROR TRACKING            INFRASTRUCTURE        │
│   ───────────               ──────────────            ──────────────        │
│   ┌─────────────┐           ┌─────────────┐           ┌─────────────┐       │
│   │   Vercel    │           │   Sentry    │           │  Supabase   │       │
│   │  Analytics  │           │             │           │  Dashboard  │       │
│   └─────────────┘           └─────────────┘           └─────────────┘       │
│         │                         │                         │               │
│         ▼                         ▼                         ▼               │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                        ALERTING LAYER                            │      │
│   │   PagerDuty (Critical) │ Slack (Warning) │ Email (Info)         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Vercel Analytics Configuration

```typescript
// app/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 5.3 Sentry Configuration

#### Installation and Setup

```bash
# Install Sentry SDK
pnpm add @sentry/nextjs
```

#### `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',

  // Performance Monitoring
  tracesSampleRate: process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out non-actionable errors
  beforeSend(event, hint) {
    // Ignore browser extension errors
    if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
      frame => frame.filename?.includes('extension')
    )) {
      return null;
    }

    // Ignore network errors from ad blockers
    if (event.message?.includes('blocked:')) {
      return null;
    }

    return event;
  },

  // Additional context
  initialScope: {
    tags: {
      app_version: process.env.npm_package_version,
    },
  },
});
```

#### `sentry.server.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',

  // Performance monitoring
  tracesSampleRate: process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 0.1 : 1.0,

  // Profiling
  profilesSampleRate: 0.1,

  // Enable source maps
  includeLocalVariables: true,

  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    return event;
  },
});
```

#### `sentry.edge.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  tracesSampleRate: 0.1,
});
```

### 5.4 Supabase Dashboard Monitoring

Key metrics to monitor in Supabase Dashboard:

| Metric | Warning Threshold | Critical Threshold |
|--------|------------------|-------------------|
| Database connections | >80% of limit | >95% of limit |
| Query execution time (P95) | >500ms | >2000ms |
| Database CPU | >70% | >90% |
| Database memory | >80% | >95% |
| Storage usage | >70% of plan | >90% of plan |
| API request latency (P95) | >200ms | >1000ms |
| Auth error rate | >1% | >5% |

### 5.5 Custom Alerting Rules

#### PagerDuty Alert Configuration

```yaml
# Alerting rules configuration
alerts:
  # Critical - Page on-call immediately
  critical:
    - name: "API Down"
      condition: "health_check_status != 200 for 2 minutes"
      action: "pagerduty_critical"

    - name: "Error Rate Spike"
      condition: "error_rate > 5% for 5 minutes"
      action: "pagerduty_critical"

    - name: "Database Connection Failure"
      condition: "db_connection_errors > 0 for 1 minute"
      action: "pagerduty_critical"

  # High - Page during business hours, Slack otherwise
  high:
    - name: "High Error Rate"
      condition: "error_rate > 2% for 10 minutes"
      action: "pagerduty_high"

    - name: "Slow API Response"
      condition: "api_p95_latency > 2000ms for 5 minutes"
      action: "pagerduty_high"

    - name: "Database CPU High"
      condition: "db_cpu > 85% for 10 minutes"
      action: "pagerduty_high"

  # Warning - Slack notification
  warning:
    - name: "Elevated Error Rate"
      condition: "error_rate > 1% for 15 minutes"
      action: "slack_warning"

    - name: "Storage Usage High"
      condition: "storage_usage > 80%"
      action: "slack_warning"

    - name: "Slow Queries"
      condition: "slow_query_count > 10 per minute"
      action: "slack_warning"

  # Info - Daily digest
  info:
    - name: "Daily Error Summary"
      schedule: "0 9 * * *"
      action: "email_digest"
```

### 5.6 On-Call Rotation

```markdown
## On-Call Policy

### Rotation Schedule
- Weekly rotation, handoff on Mondays at 9 AM local time
- Primary and secondary on-call for each week
- Minimum 2 weeks between on-call shifts

### Responsibilities
1. **Primary On-Call**
   - Respond to all alerts within 15 minutes
   - Initial triage and incident response
   - Coordinate with team if escalation needed

2. **Secondary On-Call**
   - Backup for primary unavailability
   - Assist with major incidents
   - Respond if primary doesn't acknowledge in 30 minutes

### Escalation Path
1. Primary On-Call (0-15 min)
2. Secondary On-Call (15-30 min)
3. Engineering Manager (30-45 min)
4. CTO (45+ min)

### Tools
- PagerDuty for alerting and scheduling
- Slack #incidents for communication
- Zoom for incident calls
- Notion for incident documentation

### Compensation
- On-call stipend: $500/week
- Incident response bonus: $100/incident (outside business hours)
```

---

## 6. Log Aggregation

### 6.1 Logging Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LOGGING ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   APPLICATION LOGS                  INFRASTRUCTURE LOGS                      │
│   ─────────────────                ──────────────────                       │
│   ┌─────────────┐                  ┌─────────────┐                          │
│   │ Next.js App │                  │   Vercel    │                          │
│   │   Logs      │                  │  Function   │                          │
│   └──────┬──────┘                  │   Logs      │                          │
│          │                         └──────┬──────┘                          │
│          │                                │                                  │
│          ▼                                ▼                                  │
│   ┌─────────────────────────────────────────────────────┐                  │
│   │                VERCEL LOG DRAIN                      │                  │
│   │         (Forward to external service)                │                  │
│   └─────────────────────────────────────────────────────┘                  │
│                              │                                               │
│                              ▼                                               │
│   ┌─────────────────────────────────────────────────────┐                  │
│   │              DATADOG / LOGTAIL / AXIOM               │                  │
│   │   • Search and filter    • Alerting                 │                  │
│   │   • Dashboards           • Long-term retention      │                  │
│   └─────────────────────────────────────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Structured Logging Format

```typescript
// app/src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  companyId?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  environment: string;
  service: string;
  version: string;
}

class Logger {
  private service: string;
  private version: string;
  private environment: string;

  constructor() {
    this.service = 'rossos-web';
    this.version = process.env.npm_package_version || 'unknown';
    this.environment = process.env.NEXT_PUBLIC_APP_ENV || 'development';
  }

  private formatLog(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      environment: this.environment,
      service: this.service,
      version: this.version,
    };
  }

  private output(entry: LogEntry): void {
    const json = JSON.stringify(entry);

    switch (entry.level) {
      case 'error':
        console.error(json);
        break;
      case 'warn':
        console.warn(json);
        break;
      case 'debug':
        if (this.environment === 'development') {
          console.debug(json);
        }
        break;
      default:
        console.log(json);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.output(this.formatLog('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    this.output(this.formatLog('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.output(this.formatLog('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    this.output(this.formatLog('error', message, context));
  }

  // Create a child logger with preset context
  child(context: LogContext): Logger {
    const child = new Logger();
    const parentOutput = this.output.bind(this);

    child.output = (entry: LogEntry) => {
      entry.context = { ...context, ...entry.context };
      parentOutput(entry);
    };

    return child;
  }
}

export const logger = new Logger();

// Usage example
export function withRequestLogging(requestId: string, userId?: string) {
  return logger.child({ requestId, userId });
}
```

### 6.3 Log Examples

```json
// API Request Log
{
  "timestamp": "2026-02-12T14:30:00.000Z",
  "level": "info",
  "message": "API request completed",
  "context": {
    "requestId": "req_abc123",
    "userId": "user_xyz789",
    "companyId": "company_def456",
    "action": "GET /api/projects",
    "duration": 145,
    "statusCode": 200
  },
  "environment": "production",
  "service": "rossos-web",
  "version": "1.2.3"
}

// Error Log
{
  "timestamp": "2026-02-12T14:30:05.000Z",
  "level": "error",
  "message": "Database query failed",
  "context": {
    "requestId": "req_abc124",
    "userId": "user_xyz789",
    "action": "createProject",
    "error": "unique_violation",
    "errorCode": "23505",
    "table": "projects"
  },
  "environment": "production",
  "service": "rossos-web",
  "version": "1.2.3"
}

// Authentication Log
{
  "timestamp": "2026-02-12T14:30:10.000Z",
  "level": "info",
  "message": "User authentication successful",
  "context": {
    "requestId": "req_abc125",
    "userId": "user_xyz789",
    "companyId": "company_def456",
    "action": "login",
    "method": "password",
    "ipAddress": "192.168.1.1"
  },
  "environment": "production",
  "service": "rossos-web",
  "version": "1.2.3"
}
```

### 6.4 Log Retention Policy

| Environment | Retention Period | Storage |
|-------------|-----------------|---------|
| Development | 7 days | Vercel Logs |
| Staging | 14 days | Vercel Logs |
| Production | 90 days | Vercel + External (Datadog/Axiom) |
| Audit Logs | 7 years | Cold Storage (S3/GCS) |

### 6.5 Debug Logging in Production

```typescript
// Enable debug logging for specific users/companies
// Controlled via feature flags or database configuration

interface DebugConfig {
  enabledUsers: string[];
  enabledCompanies: string[];
  enabledRoutes: string[];
  samplingRate: number; // 0-1, percentage of requests to log
}

async function shouldDebugLog(
  userId?: string,
  companyId?: string,
  route?: string
): Promise<boolean> {
  const config = await getDebugConfig(); // From feature flags or cache

  // Always log if user is explicitly enabled
  if (userId && config.enabledUsers.includes(userId)) {
    return true;
  }

  // Log if company is enabled
  if (companyId && config.enabledCompanies.includes(companyId)) {
    return true;
  }

  // Log if route is enabled
  if (route && config.enabledRoutes.some(r => route.startsWith(r))) {
    return true;
  }

  // Random sampling for general debug logs
  return Math.random() < config.samplingRate;
}
```

---

## 7. Infrastructure as Code

### 7.1 Project Structure

```
infrastructure/
├── vercel/
│   ├── vercel.json
│   └── domains.json
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── *.sql
│   └── seed.sql
├── github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   ├── deploy-production.yml
│   │   └── nightly.yml
│   ├── CODEOWNERS
│   └── dependabot.yml
└── scripts/
    ├── setup-local.sh
    ├── setup-staging.sh
    └── setup-production.sh
```

### 7.2 Supabase Configuration

#### `supabase/config.toml`

```toml
# =============================================================================
# Supabase Local Development Configuration
# =============================================================================

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323
api_url = "http://localhost"

[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/auth/callback"]
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.sms]
enable_signup = false
enable_confirmations = false

[auth.external.google]
enabled = false

[auth.external.github]
enabled = false

[functions]
verify_jwt = false

[analytics]
enabled = false

[experimental]
webhooks = true
```

### 7.3 Environment Replication Script

#### `scripts/setup-environment.sh`

```bash
#!/bin/bash
# =============================================================================
# Environment Setup Script
# =============================================================================
# Usage: ./scripts/setup-environment.sh [development|staging|production]

set -e

ENVIRONMENT=${1:-development}

echo "Setting up $ENVIRONMENT environment..."

# -----------------------------------------------------------------------------
# Validate environment
# -----------------------------------------------------------------------------
case $ENVIRONMENT in
  development|staging|production)
    echo "Valid environment: $ENVIRONMENT"
    ;;
  *)
    echo "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [development|staging|production]"
    exit 1
    ;;
esac

# -----------------------------------------------------------------------------
# Development Environment
# -----------------------------------------------------------------------------
if [ "$ENVIRONMENT" = "development" ]; then
  echo "Setting up local development environment..."

  # Check prerequisites
  command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
  command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required but not installed."; exit 1; }
  command -v supabase >/dev/null 2>&1 || { echo "Supabase CLI is required but not installed."; exit 1; }

  # Start Supabase locally
  echo "Starting Supabase local instance..."
  supabase start

  # Copy environment file
  if [ ! -f .env.local ]; then
    echo "Creating .env.local from template..."
    cp .env.example .env.local
    echo "Please update .env.local with your local Supabase credentials"
  fi

  # Install dependencies
  echo "Installing dependencies..."
  cd app && pnpm install

  # Run migrations
  echo "Running database migrations..."
  supabase db push

  # Seed database (optional)
  read -p "Seed database with test data? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    psql $(supabase status | grep "DB URL" | awk '{print $3}') -f supabase/seed.sql
  fi

  echo "Development environment ready!"
  echo "Run 'pnpm dev' to start the development server"

fi

# -----------------------------------------------------------------------------
# Staging Environment
# -----------------------------------------------------------------------------
if [ "$ENVIRONMENT" = "staging" ]; then
  echo "Setting up staging environment..."

  # Check for required environment variables
  : "${STAGING_SUPABASE_PROJECT_ID:?STAGING_SUPABASE_PROJECT_ID is required}"
  : "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
  : "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"

  # Link to staging Supabase project
  echo "Linking to staging Supabase project..."
  supabase link --project-ref $STAGING_SUPABASE_PROJECT_ID

  # Apply migrations
  echo "Applying migrations to staging..."
  supabase db push

  # Set up Vercel
  echo "Setting up Vercel staging environment..."
  vercel link --yes
  vercel env pull .env.staging

  echo "Staging environment configured!"
fi

# -----------------------------------------------------------------------------
# Production Environment
# -----------------------------------------------------------------------------
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Setting up production environment..."
  echo "⚠️  Production setup requires manual verification"

  # Check for required environment variables
  : "${PRODUCTION_SUPABASE_PROJECT_ID:?PRODUCTION_SUPABASE_PROJECT_ID is required}"
  : "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
  : "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"

  read -p "Are you sure you want to set up the production environment? (yes/no) " -r
  if [[ ! $REPLY = "yes" ]]; then
    echo "Aborting production setup"
    exit 0
  fi

  # Link to production Supabase project
  echo "Linking to production Supabase project..."
  supabase link --project-ref $PRODUCTION_SUPABASE_PROJECT_ID

  echo "Production environment linked!"
  echo "Migrations should be applied via CI/CD pipeline"
fi
```

### 7.4 Vercel Project Configuration Script

```bash
#!/bin/bash
# =============================================================================
# Vercel Project Setup Script
# =============================================================================

set -e

PROJECT_NAME="rossos"
TEAM_NAME="rossos"

# Create Vercel project
vercel link --yes \
  --project=$PROJECT_NAME \
  --scope=$TEAM_NAME

# Configure domains
echo "Configuring domains..."
vercel domains add app.rossos.app --scope=$TEAM_NAME
vercel domains add staging.rossos.app --scope=$TEAM_NAME
vercel domains add www.rossos.app --scope=$TEAM_NAME

# Set environment variables (staging)
echo "Setting staging environment variables..."
vercel env add NEXT_PUBLIC_APP_ENV staging preview < <(echo "staging")

# Set environment variables (production)
echo "Setting production environment variables..."
vercel env add NEXT_PUBLIC_APP_ENV production production < <(echo "production")

echo "Vercel project configured!"
echo "Add remaining secrets via Vercel dashboard or 'vercel env add' command"
```

---

## 8. Security Practices

### 8.1 Dependabot Configuration

#### `.github/dependabot.yml`

```yaml
# =============================================================================
# Dependabot Configuration
# =============================================================================

version: 2

updates:
  # NPM dependencies
  - package-ecosystem: "npm"
    directory: "/app"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "America/New_York"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "deps"
    groups:
      # Group all minor and patch updates together
      production-dependencies:
        patterns:
          - "*"
        exclude-patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
          - "*test*"
          - "*jest*"
          - "vitest*"
        update-types:
          - "minor"
          - "patch"
      dev-dependencies:
        patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
          - "*test*"
          - "*jest*"
          - "vitest*"
        update-types:
          - "minor"
          - "patch"
    ignore:
      # Ignore major version updates for critical packages (review manually)
      - dependency-name: "next"
        update-types: ["version-update:semver-major"]
      - dependency-name: "react"
        update-types: ["version-update:semver-major"]
      - dependency-name: "@supabase/*"
        update-types: ["version-update:semver-major"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    labels:
      - "dependencies"
      - "automated"
      - "github-actions"
    commit-message:
      prefix: "ci"
```

### 8.2 Security Scanning in CI

```yaml
# Additional security job for CI workflow
security-scan:
  name: Security Scan
  runs-on: ubuntu-latest
  timeout-minutes: 15

  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: './app'
        ignore-unfixed: true
        severity: 'CRITICAL,HIGH'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

    - name: Run CodeQL analysis
      uses: github/codeql-action/analyze@v2
      with:
        languages: javascript,typescript

    - name: Check for secrets
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: ${{ github.event.repository.default_branch }}
        extra_args: --only-verified
```

### 8.3 Branch Protection Rules

Configure in GitHub Repository Settings > Branches > Branch protection rules:

#### `main` Branch Rules

```yaml
# Branch protection for main
branch: main

required_status_checks:
  strict: true
  contexts:
    - "Lint & Format"
    - "TypeScript"
    - "Tests"
    - "Build"
    - "Security Scan"

required_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
  require_last_push_approval: true

restrictions:
  users: []
  teams: []
  apps: []

enforce_admins: true
require_linear_history: true
allow_force_pushes: false
allow_deletions: false
block_creations: false
required_conversation_resolution: true
require_signed_commits: false

lock_branch: false
allow_fork_syncing: true
```

### 8.4 CODEOWNERS

#### `.github/CODEOWNERS`

```
# =============================================================================
# CODEOWNERS - Defines code ownership for review requirements
# =============================================================================

# Default owners for everything
* @rossos/engineering

# Infrastructure and DevOps
/.github/ @rossos/platform
/infrastructure/ @rossos/platform
vercel.json @rossos/platform
supabase/ @rossos/platform

# Frontend
/app/src/components/ @rossos/frontend
/app/src/styles/ @rossos/frontend
/app/src/app/(dashboard)/ @rossos/frontend

# Backend/API
/app/src/app/api/ @rossos/backend
/app/src/lib/supabase/ @rossos/backend

# Security-sensitive files
/app/src/lib/auth/ @rossos/security
/app/src/middleware.ts @rossos/security
**/security*.ts @rossos/security

# Database
/supabase/migrations/ @rossos/backend @rossos/platform

# Documentation
/app/docs/ @rossos/engineering
*.md @rossos/engineering

# Package management
package.json @rossos/platform
pnpm-lock.yaml @rossos/platform
```

### 8.5 Code Review Requirements

```markdown
## Code Review Checklist

### Security
- [ ] No hardcoded secrets or credentials
- [ ] User input is validated and sanitized
- [ ] SQL queries use parameterized queries
- [ ] Authentication/authorization checks in place
- [ ] Sensitive data is not logged
- [ ] RLS policies updated for new tables

### Code Quality
- [ ] TypeScript types are explicit (no `any`)
- [ ] Error handling is appropriate
- [ ] Code follows existing patterns
- [ ] Tests cover new functionality
- [ ] No console.log statements (use logger)

### Performance
- [ ] Database queries are indexed
- [ ] No N+1 queries
- [ ] Large lists are paginated
- [ ] Heavy components are lazy loaded

### Documentation
- [ ] Complex logic is commented
- [ ] API changes are documented
- [ ] Breaking changes noted
- [ ] Migration instructions if needed
```

---

## 9. Performance Budgets

### 9.1 Bundle Size Limits

#### `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 3000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "interactive": ["error", { "maxNumericValue": 4000 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 500000 }],
        "resource-summary:total:size": ["error", { "maxNumericValue": 2000000 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 9.2 Performance Thresholds

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Lighthouse Performance** | >90 | 80-90 | <80 |
| **First Contentful Paint (FCP)** | <1.5s | 1.5-2.5s | >2.5s |
| **Largest Contentful Paint (LCP)** | <2.5s | 2.5-4.0s | >4.0s |
| **Cumulative Layout Shift (CLS)** | <0.1 | 0.1-0.25 | >0.25 |
| **Time to Interactive (TTI)** | <3.5s | 3.5-5.0s | >5.0s |
| **Total Blocking Time (TBT)** | <200ms | 200-600ms | >600ms |
| **JavaScript Bundle Size** | <300KB | 300-500KB | >500KB |
| **Total Page Size** | <1.5MB | 1.5-2.5MB | >2.5MB |

### 9.3 API Response Time Limits

| Endpoint Type | Target | Warning | Critical |
|---------------|--------|---------|----------|
| **Health Check** | <50ms | 50-100ms | >100ms |
| **Authentication** | <200ms | 200-500ms | >500ms |
| **List (paginated)** | <300ms | 300-800ms | >800ms |
| **Single Resource** | <150ms | 150-400ms | >400ms |
| **Create/Update** | <500ms | 500-1000ms | >1000ms |
| **Complex Query** | <800ms | 800-2000ms | >2000ms |
| **File Upload** | <3s | 3-10s | >10s |

### 9.4 Bundle Analysis Script

```bash
#!/bin/bash
# =============================================================================
# Bundle Analysis Script
# =============================================================================

set -e

echo "Building with bundle analyzer..."

# Build with analysis
ANALYZE=true pnpm build

# Check bundle sizes
echo "Checking bundle sizes..."

# First Load JS
FIRST_LOAD=$(cat .next/build-manifest.json | jq -r '.pages["/"].length')
echo "First Load JS chunks: $FIRST_LOAD"

# Total size check
TOTAL_SIZE=$(du -sh .next/static | cut -f1)
echo "Total static assets: $TOTAL_SIZE"

# Check for large chunks
echo "Large chunks (>100KB):"
find .next/static -name "*.js" -size +100k -exec ls -lh {} \;

# Generate report
echo "Bundle analysis complete. Check .next/analyze/ for detailed report."
```

### 9.5 Performance Monitoring Dashboard Queries

```sql
-- API Response Time Percentiles
SELECT
  endpoint,
  percentile_cont(0.50) WITHIN GROUP (ORDER BY duration_ms) AS p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY duration_ms) AS p99,
  COUNT(*) AS total_requests
FROM api_request_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY endpoint
ORDER BY p95 DESC;

-- Slow Queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY total_exec_time DESC
LIMIT 20;
```

---

## 10. Incident Response

### 10.1 Incident Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| **SEV-1 (Critical)** | Complete service outage | 15 minutes | Site down, data loss, security breach |
| **SEV-2 (High)** | Major feature unavailable | 30 minutes | Auth broken, payments failing |
| **SEV-3 (Medium)** | Degraded performance | 2 hours | Slow response times, partial feature issues |
| **SEV-4 (Low)** | Minor issues | Next business day | UI bugs, non-critical feature issues |

### 10.2 Response Procedures

```markdown
## Incident Response Playbook

### SEV-1: Critical Incident

#### Immediate Actions (0-15 minutes)
1. **Acknowledge alert** in PagerDuty
2. **Start incident channel** in Slack (#incident-YYYYMMDD-description)
3. **Assess impact** - What's broken? How many users affected?
4. **Communicate externally** - Update status page

#### Investigation (15-30 minutes)
1. **Check recent changes**
   - Recent deployments: `vercel ls --scope rossos`
   - Recent migrations: Check Supabase dashboard
   - Recent config changes: Git history

2. **Check monitoring**
   - Sentry for errors
   - Vercel logs for request failures
   - Supabase dashboard for DB issues

3. **Identify root cause** or implement workaround

#### Resolution (30+ minutes)
1. **Implement fix or rollback**
2. **Verify fix** with smoke tests
3. **Update status page** with resolution
4. **Communicate** to stakeholders

#### Post-Incident
1. Schedule post-mortem (within 48 hours)
2. Create action items
3. Update runbooks if needed

---

### SEV-2: High Severity Incident

#### Immediate Actions (0-30 minutes)
1. Acknowledge alert
2. Create incident channel if needed
3. Assess scope of impact
4. Determine if SEV-1 escalation needed

#### Investigation (30-60 minutes)
1. Review error logs and metrics
2. Identify affected users/features
3. Determine root cause

#### Resolution (60+ minutes)
1. Implement fix
2. Deploy to staging, verify
3. Deploy to production
4. Monitor for recurrence

---

### SEV-3: Medium Severity Incident

1. Acknowledge within 2 hours
2. Investigate during business hours
3. Fix in next deployment if possible
4. Document for tracking

---

### SEV-4: Low Severity Incident

1. Create ticket in issue tracker
2. Prioritize in next sprint planning
3. Fix when capacity allows
```

### 10.3 Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date**: YYYY-MM-DD
**Severity**: SEV-X
**Duration**: X hours Y minutes
**Author**: [Name]
**Status**: Draft / In Review / Final

---

## Executive Summary

[2-3 sentence summary of what happened, impact, and resolution]

---

## Timeline (All times UTC)

| Time | Event |
|------|-------|
| HH:MM | First alert triggered |
| HH:MM | On-call acknowledged |
| HH:MM | Incident channel created |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Service restored |
| HH:MM | Incident resolved |

---

## Impact

### User Impact
- **Users affected**: X
- **Duration**: X hours
- **Features affected**: [List]

### Business Impact
- **Revenue impact**: $X (if applicable)
- **SLA violations**: Yes/No
- **Customer complaints**: X

---

## Root Cause Analysis

### What happened?
[Detailed technical explanation]

### Why did it happen?
[Contributing factors, 5 whys analysis]

### Detection
- **How was it detected?**: [Alert/Customer report/Manual]
- **Time to detection**: X minutes
- **Detection gaps**: [What could have caught this sooner?]

---

## Resolution

### Immediate fix
[What was done to resolve the incident]

### Why this approach?
[Rationale for the resolution method chosen]

---

## Lessons Learned

### What went well
- [List positives]

### What could be improved
- [List areas for improvement]

---

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Specific action] | [Name] | YYYY-MM-DD | Open |
| [Specific action] | [Name] | YYYY-MM-DD | Open |

---

## Appendix

### Relevant logs/screenshots
[Include relevant evidence]

### Related incidents
- [Link to similar past incidents]

---

**Sign-off**:
- [ ] Engineering Manager
- [ ] CTO (for SEV-1/2)
```

### 10.4 Communication Plan

```markdown
## Incident Communication Plan

### Internal Communication

| Audience | Channel | Timing | Content |
|----------|---------|--------|---------|
| On-call | PagerDuty | Immediate | Alert details |
| Engineering | Slack #incidents | Immediate | Incident channel |
| Leadership | Slack #leadership | 15 min (SEV-1) | Impact summary |
| All staff | Slack #general | Resolution | Summary update |

### External Communication

| Audience | Channel | Timing | Content |
|----------|---------|--------|---------|
| All users | Status page | 5 min (SEV-1) | Service disruption |
| Affected users | Email | 30 min | Personalized update |
| Enterprise | Phone | 15 min | Direct contact |
| Public | Twitter/X | If major | Brief update |

### Status Page Updates

**Initial Update Template**:
```
We are investigating reports of [issue description].

Some users may experience [impact]. We are working to resolve this as quickly as possible.

Posted at: HH:MM UTC
```

**Update Template**:
```
Update: We have identified the cause of [issue].

Our team is [action being taken]. We expect service to be restored within [ETA].

Posted at: HH:MM UTC
```

**Resolution Template**:
```
Resolved: The issue affecting [feature] has been resolved.

All services are now operating normally. We apologize for any inconvenience caused.

Duration: X hours Y minutes
Posted at: HH:MM UTC
```
```

### 10.5 Emergency Contacts

```yaml
# Emergency Contact List
# Store securely, not in public repository

on_call:
  primary:
    method: "PagerDuty"
    schedule: "https://rossos.pagerduty.com/schedules/XXXXX"

  secondary:
    method: "PagerDuty escalation"

escalation:
  engineering_manager:
    name: "[Name]"
    phone: "+1-XXX-XXX-XXXX"
    slack: "@manager"

  cto:
    name: "[Name]"
    phone: "+1-XXX-XXX-XXXX"
    slack: "@cto"

external:
  supabase_support:
    email: "support@supabase.io"
    dashboard: "https://app.supabase.com/support"

  vercel_support:
    email: "support@vercel.com"
    dashboard: "https://vercel.com/support"

  stripe_support:
    phone: "+1-888-926-2289"
    dashboard: "https://dashboard.stripe.com/support"
```

---

## Appendix

### A. GitHub Actions Workflow Summary

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR, Push to main | Lint, test, build, security scan |
| `deploy-staging.yml` | Push to main | Deploy to staging, E2E tests |
| `deploy-production.yml` | Release tag | Deploy to production, smoke tests |
| `nightly.yml` | Cron (4 AM UTC) | Dependency checks, performance baseline |

### B. Required Repository Secrets

See section 2.3 for complete list of required GitHub secrets.

### C. Useful Commands Reference

```bash
# Local Development
pnpm dev                    # Start dev server
supabase start              # Start local Supabase
supabase db push            # Apply migrations locally

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e              # Run E2E tests
pnpm lint                   # Run ESLint

# Deployment
vercel                      # Deploy preview
vercel --prod              # Deploy production
vercel rollback            # Rollback last deployment

# Database
supabase migration new <name>   # Create migration
supabase db push               # Apply migrations
supabase gen types typescript  # Generate types

# Debugging
vercel logs                 # View deployment logs
vercel logs --follow       # Tail logs
supabase db remote connect  # Connect to remote DB
```

---

*Last Updated: 2026-02-12*
*Version: 1.0*
