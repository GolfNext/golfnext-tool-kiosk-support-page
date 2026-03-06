# CLAUDE.md — GolfNext Internal Tool

This file provides guardrails for AI-assisted development in this repository.
Regardless of who is building, the output follows our standards.

## Stack

- **Language:** TypeScript (strict mode, no `any`)
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT from GolfNext Portal (intern.golfnext.com)
- **Deployment:** Vercel
- **Testing:** Vitest + React Testing Library

## Code Standards

- TypeScript only — no `any` types. All functions have explicit return types.
- English code — all variable names, function names, and code comments in English.
  Inline documentation may be in Danish where helpful.
- Tailwind + shadcn/ui — no other CSS frameworks or component libraries.
- All database access goes through the shared Supabase client in `src/lib/supabase/`.
  Never create a Supabase client inline in a component or API route.
- All calls to GolfNext backend services go through a shared API client in `src/lib/`.
- Environment variables: all secrets and configuration in env vars.
  Only prefix with `NEXT_PUBLIC_` when the value must be client-accessible.
  Never commit `.env` files.

## File Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable UI components
│   └── ui/           # shadcn/ui components
├── lib/              # Shared utilities, API clients, auth middleware
│   └── supabase/     # Supabase client instances (client, server, admin)
└── types/            # TypeScript type definitions
tests/                # Test files mirroring src/ structure
```

## Error Handling & Logging

- All API routes use a consistent error response format: `{ error: string, code: string }`.
- Unexpected errors are caught and logged with context (function name, input parameters, timestamp).
- User-facing error messages are helpful and non-technical.
- Every Supabase query checks the `error` return value. Never ignore it.

## Authentication

- This tool does NOT implement its own authentication.
- All auth relies on the JWT token from the GolfNext Portal at intern.golfnext.com.
- The shared middleware in `src/lib/auth.ts` validates the token on every request.
- Use `requireAuth(request)` in API routes to verify the caller.

## Database (Supabase)

- Use the browser client (`src/lib/supabase/client.ts`) in client components.
- Use the server client (`src/lib/supabase/server.ts`) in Server Components and API routes.
- Use the admin client (`src/lib/supabase/admin.ts`) only for server-side admin operations.
- Never use the service role key client-side.
- Enable Row Level Security on every table.
- Regenerate types after schema changes: `npm run types:generate`.

## Testing

- All calculations, data transformations, and decision logic must have unit tests.
- All API endpoints must have tests covering the happy path and key error cases.
- Critical UI flows that involve data submission or state changes must have component tests.
- Pure layout components, static pages, and styling do not need tests.
- Run `npm run test` before committing. Tests must pass.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (must succeed with zero errors)
npm run test         # Run all tests
npm run test:watch   # Watch mode during development
npm run lint         # Lint check (must pass clean)
npm run types:generate  # Regenerate Supabase types after schema changes
```

## Definition of Done

Before merging to `main`, every task must pass:

1. `npm run build` — zero TypeScript errors
2. `npm run test` — all tests pass
3. `npm run lint` — no linting errors
4. Business logic has unit tests
5. New environment variables documented in `.env.example`
6. README updated if functionality changed
7. Vercel preview deployment verified
8. Code reviewed (PR review or feature-dev quality review phase)
