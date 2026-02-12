# Developer Onboarding Guide

> Welcome to RossOS! This guide will get you up and running.

## Prerequisites

Before you begin, ensure you have:

- [ ] Node.js 20+ installed
- [ ] Git configured with your name and email
- [ ] Access to the GitHub repository
- [ ] Access to Supabase project (ask team lead)
- [ ] VS Code (recommended) with extensions

### Required VS Code Extensions

```
dbaeumer.vscode-eslint
esbenp.prettier-vscode
bradlc.vscode-tailwindcss
Prisma.prisma (for SQL files)
```

---

## Step 1: Clone and Install

```bash
# Clone repository
git clone https://github.com/jakeross838/cms_rebuild.git
cd cms_rebuild/app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

## Step 2: Configure Environment

Edit `.env.local` with your credentials:

```bash
# Supabase (get from team lead or Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Vercel KV (for caching)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Optional: For cron job security
CRON_SECRET=generate-a-random-string
```

## Step 3: Database Setup

```bash
# Generate TypeScript types from Supabase schema
npm run db:generate

# Verify connection
npm run dev
# Visit http://localhost:3000/api/health
```

## Step 4: Start Development

```bash
# Start dev server
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch
```

Visit http://localhost:3000

---

## Project Structure

```
app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Public auth pages
│   │   ├── (dashboard)/       # Protected app pages
│   │   └── api/               # API routes
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Base UI (shadcn)
│   │   └── [feature]/        # Feature components
│   │
│   ├── lib/                   # Core libraries
│   │   ├── supabase/         # Database client
│   │   ├── cache/            # Caching
│   │   ├── queue/            # Background jobs
│   │   └── utils/            # Utilities
│   │
│   ├── hooks/                 # React hooks
│   └── types/                 # TypeScript types
│
├── supabase/
│   └── migrations/            # SQL migrations
│
├── tests/                     # Test files
│
└── docs/                      # Documentation (YOU ARE HERE)
```

---

## Key Concepts

### Multi-Tenancy

Every user belongs to a company. All data is isolated by `company_id`.

```typescript
// Every query must filter by company
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('company_id', companyId);  // ALWAYS include this
```

### Row Level Security (RLS)

The database enforces tenant isolation automatically:

```sql
-- Users can only see their company's data
CREATE POLICY tenant_isolation ON jobs
  USING (company_id = get_current_company_id());
```

### API Middleware

All API routes use the middleware for auth, rate limiting, and logging:

```typescript
import { createApiHandler } from '@/lib/api/middleware';

export const GET = createApiHandler(
  async (req, ctx) => {
    // ctx.user and ctx.companyId are guaranteed
    const { user, companyId } = ctx;
    // ... implementation
  },
  { rateLimit: 'api' }
);
```

---

## Common Tasks

### Creating a New Page

1. Create the page file:
   ```
   src/app/(dashboard)/my-feature/page.tsx
   ```

2. Follow the component patterns in `COMPONENT_STANDARDS.md`

### Creating a New API Endpoint

1. Create the route file:
   ```
   src/app/api/my-resource/route.ts
   ```

2. Use `createApiHandler` wrapper
3. Follow patterns in `API_STANDARDS.md`

### Adding a Database Table

1. Create migration:
   ```
   supabase/migrations/YYYYMMDDHHMMSS_description.sql
   ```

2. Include RLS policies
3. Apply migration via Supabase dashboard
4. Generate types: `npm run db:generate`

### Running Tests

```bash
# All tests
npm run test

# Specific file
npm run test -- JobCard.test.tsx

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Development Workflow

1. **Get assigned a ticket** (ROSS-XXX)

2. **Create branch**
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/ROSS-XXX-description
   ```

3. **Follow the feature guide** (`docs/guides/NEW_FEATURE.md`)

4. **Commit regularly**
   ```bash
   git commit -m "feat(scope): description"
   ```

5. **Create PR when ready**
   - Push branch
   - Create PR to `develop`
   - Fill out template
   - Request review

6. **Address feedback and merge**

---

## Getting Help

### Documentation
- Start with `docs/README.md`
- Check specific standards in `docs/standards/`
- Follow guides in `docs/guides/`

### People
- **Team Lead**: Architecture questions, access requests
- **Senior Devs**: Code review, pattern questions
- **Product**: Feature requirements, priorities

### Tools
- **GitHub Issues**: Bug reports, feature requests
- **Slack #dev**: Quick questions
- **Supabase Dashboard**: Database access

---

## Troubleshooting

### "Cannot connect to database"
- Check `.env.local` has correct Supabase credentials
- Verify Supabase project is running
- Check if your IP needs to be allowlisted

### "Type errors after pulling"
```bash
npm run db:generate  # Regenerate types
npm run typecheck    # Verify fix
```

### "Tests failing"
```bash
npm run test -- --updateSnapshot  # If snapshots changed
```

### "Port 3000 already in use"
```bash
# Find and kill process (Windows)
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Or use different port
npm run dev -- -p 3001
```

---

## First Week Checklist

### Day 1
- [ ] Complete this onboarding guide
- [ ] Get access to all tools
- [ ] Run project locally
- [ ] Read `docs/README.md`

### Day 2-3
- [ ] Read all standards docs
- [ ] Explore codebase structure
- [ ] Review recent PRs to see patterns

### Day 4-5
- [ ] Pick up a small ticket
- [ ] Follow the feature development guide
- [ ] Submit your first PR

### Week 1 Complete
- [ ] PR merged to develop
- [ ] Comfortable with workflow
- [ ] Know who to ask for help
