# RefinAI - Agent Instructions

## Build & Test Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Build & Quality
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript check (via tsc --noEmit)

# Testing (when configured)
npm test             # Run tests
npm run test:e2e     # Run E2E tests (Playwright)
```

## CI/CD Pipeline (GitHub Actions)

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

## Supabase Commands

```bash
# Local development
supabase start       # Start local Supabase
supabase db push     # Push schema to remote

# Schema management
supabase db diff     # Compare local vs remote
supabase migration new <name>  # Create new migration
```

## Project Structure

```
refinai/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (dark mode, fonts)
│   │   ├── page.tsx            # Landing page
│   │   └── dashboard/
│   │       ├── layout.tsx      # Dashboard layout (sidebar + header)
│   │       ├── page.tsx        # Dashboard home
│   │       ├── tradutor/       # Modulo 1
│   │       ├── priorizador/    # Modulo 2
│   │       └── ...
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/             # Sidebar, Header
│   └── lib/
│       ├── utils.ts            # cn() helper
│       └── supabase/
│           ├── client.ts       # Browser client
│           ├── server.ts       # Server client
│           └── middleware.ts   # Auth middleware
├── supabase/
│   └── schema.sql              # Database schema
├── .env.example                # Environment variables template
└── CONTEXT.md                  # Domain glossary & decisions
```

## Coding Standards

- **Language**: All UI text in PT-BR. Code comments in English.
- **TypeScript**: Strict mode. No `any`. Use interfaces for database types.
- **Components**: Functional components only. Use shadcn/ui primitives.
- **Styling**: Tailwind only. Dark mode is default. Use `cn()` utility.
- **State**: Prefer server components. Client components only when interactivity needed.
- **API Routes**: App Router style (`route.ts`). Validate inputs with Zod.
- **Database**: Always use RLS policies. Never expose service role to client.

## Git Conventions

- **Branch naming**: `feat/`, `fix/`, `chore/`, `docs/`
- **Commit messages**: Conventional Commits (feat:, fix:, chore:, etc.)
- **PR**: Squash merge to main. Require CI passing.
