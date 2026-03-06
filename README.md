# GolfNext Internal Tool Template

Starting point for all GolfNext internal tools. Clone this repo, rename it, and start building.

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | JWT from GolfNext Portal |
| Deployment | Vercel |
| Testing | Vitest + React Testing Library |

## Getting Started

### 1. Create your repository

Use this template to create a new repo on GitHub. Name it `golfnext-tool-[your-tool-name]`.

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

You'll need:
- **Supabase URL and anon key** from your Supabase project dashboard.
- **Supabase service role key** (for admin operations only).
- **Portal JWT public key** from the GolfNext Portal team.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Generate Supabase types

After creating or changing your database schema, regenerate TypeScript types:

```bash
npm run types:generate
```

This updates `src/types/database.ts` to match your schema.

## Required Skills & Plugins

Before building, install these in your AI coding assistant:

### Mandatory Skills (mvp-dev-stack plugin)

- **react-best-practices** — React/Next.js patterns
- **tailwind-css** — Tailwind v4 patterns
- **nodejs-backend** — API routes, middleware
- **testing-basics** — Vitest + Testing Library
- **project-structure** — File organization

### GolfNext-specific Skills

- **supabase** — Supabase client setup, queries, RLS, migrations
- **definition-of-done** — Automated DoD checker

### Mandatory Plugin

- **feature-dev** — 7-phase structured development workflow. Run `/feature-dev` followed by what you want to build.

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/health/       # Health check endpoint
│   ├── globals.css       # Tailwind base styles
│   ├── layout.tsx        # Root layout (fonts, metadata)
│   └── page.tsx          # Home page (replace this)
├── components/
│   └── ui/               # shadcn/ui components (add with npx shadcn@latest add)
├── lib/
│   ├── auth.ts           # Portal JWT verification middleware
│   ├── api-client.ts     # Shared API client for GolfNext services
│   └── supabase/
│       ├── client.ts     # Browser Supabase client
│       ├── server.ts     # Server Supabase client (App Router)
│       └── admin.ts      # Admin client (bypasses RLS)
└── types/
    └── database.ts       # Generated Supabase types
tests/                    # Test files mirroring src/ structure
.github/workflows/ci.yml  # CI: build, test, lint on every PR
CLAUDE.md                 # AI coding guardrails
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Tests with coverage report |
| `npm run types:generate` | Regenerate Supabase types |

## Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

Components are added to `src/components/ui/` with full source control.

## Deployment

Push to `main` on GitHub. Vercel deploys automatically.

Preview deployments are created on every pull request — verify your feature works before merging.

## Definition of Done

Before merging, verify:

1. `npm run build` passes
2. `npm run test` passes
3. `npm run lint` passes
4. Business logic has unit tests
5. New env vars documented in `.env.example`
6. README updated if functionality changed
7. Vercel preview verified
8. Code reviewed

See the **definition-of-done** skill for an automated checker.

## More Information

- [GolfNext Internal Tools Standard](./golfnext-internal-tools-standard.md) — the full standard this template implements.
- [Supabase Docs](https://supabase.com/docs) — database, auth, and storage documentation.
- [Next.js Docs](https://nextjs.org/docs) — framework documentation.
- [shadcn/ui](https://ui.shadcn.com) — component library documentation.
