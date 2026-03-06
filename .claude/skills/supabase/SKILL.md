---
name: supabase
description: >
  Supabase database patterns for GolfNext internal tools built on Next.js App Router + TypeScript.
  Covers client setup, queries, Row Level Security, type generation, migrations, and environment variables.
  Use this skill whenever working with Supabase, PostgreSQL, database queries, database schema,
  tables, rows, RLS policies, Supabase client, or any data persistence in a GolfNext internal tool.
  Also use when setting up a new project that needs a database, when writing API routes that read
  or write data, or when the user mentions "database", "DB", "store data", "save to database",
  "query", or "migration".
---

# Supabase for GolfNext Internal Tools

Supabase is our standard database for all internal tools. Under the hood it's PostgreSQL — the most
widely used relational database. This skill covers how we use it in our Next.js + TypeScript stack.

## Why Supabase

Supabase gives us three things at once: a real PostgreSQL database, an easy JavaScript client for
vibe coders, and a visual dashboard for managing data without writing SQL. When developers step in,
it's just Postgres — they can use SQL, pgAdmin, or any tool they already know.

## Environment Setup

Every project needs two environment variables. Add them to `.env.local` (never commit this file)
and document them in `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

These are safe to expose client-side — the anon key only grants access that Row Level Security
allows. For server-side operations that bypass RLS (admin tasks, migrations), use the service role
key and never expose it to the browser:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Client Setup

Create two Supabase clients in `src/lib/supabase/`. One for browser use, one for server use in
Next.js App Router.

### Browser client — `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server client — `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components where cookies can't be set.
          }
        },
      },
    }
  );
}
```

### Admin client — `src/lib/supabase/admin.ts`

Only use this for server-side admin operations (data migrations, seeding, bypassing RLS):

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

## Required Package

Install the SSR-compatible Supabase client:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Type Generation

Supabase can generate TypeScript types directly from your database schema. This gives you
autocomplete and type safety on every query — which is especially valuable for AI-generated
code because the compiler catches mistakes immediately.

Generate types after any schema change:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

The generated `Database` type is what the client uses (notice the `<Database>` generic in the
client setup above). Keep this file in version control — it serves as documentation of your schema.

## Query Patterns

All database access goes through the shared clients. Never create a Supabase client inline in
a component or API route — always import from `src/lib/supabase/`.

### Reading data

```typescript
// In a Server Component or API route
const supabase = await createClient();

const { data: tools, error } = await supabase
  .from("tools")
  .select("id, name, category, description")
  .eq("category", "sales")
  .order("name");

if (error) {
  // Handle error — see Error Handling section
  throw new Error(`Failed to fetch tools: ${error.message}`);
}
```

### Inserting data

```typescript
const { data, error } = await supabase
  .from("tools")
  .insert({
    name: "Lead Tracker",
    category: "sales",
    description: "Track incoming leads from golf clubs",
  })
  .select()
  .single();
```

### Updating data

```typescript
const { error } = await supabase
  .from("tools")
  .update({ description: "Updated description" })
  .eq("id", toolId);
```

### Deleting data

```typescript
const { error } = await supabase
  .from("tools")
  .delete()
  .eq("id", toolId);
```

### Joins and relations

Supabase supports querying related tables through foreign keys:

```typescript
const { data } = await supabase
  .from("tools")
  .select(`
    id,
    name,
    category:categories(name),
    created_by:users(email, full_name)
  `)
  .eq("active", true);
```

## Row Level Security (RLS)

RLS is PostgreSQL's built-in access control — it lets you define rules about who can see and modify
which rows. Every table that stores user-accessible data should have RLS enabled.

For GolfNext internal tools, the typical pattern is: any authenticated user (someone with a valid
JWT from the portal) can read data, but only specific roles can write.

### Enable RLS on a table

```sql
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
```

### Common policies

Allow all authenticated users to read:
```sql
CREATE POLICY "Authenticated users can read tools"
  ON tools FOR SELECT
  TO authenticated
  USING (true);
```

Allow only the creator to update:
```sql
CREATE POLICY "Creators can update their own tools"
  ON tools FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);
```

The key concept: `USING` defines which rows the policy applies to. `WITH CHECK` defines what
values are allowed on insert/update. If you only set `USING`, it applies to both.

## Authentication with the GolfNext Portal

Our internal tools don't implement their own auth — they receive a signed JWT from the GolfNext
Portal. However, Supabase needs to know about the authenticated user to enforce RLS policies.

The portal's JWT should be passed to Supabase so that `auth.uid()` works in RLS policies. The
exact integration depends on how the portal issues tokens — see `src/lib/auth.ts` in the template
repo for the current implementation.

## Migrations

For simple tools, you can manage schema through the Supabase Dashboard (the visual editor). For
tools that need version-controlled schema changes, use Supabase migrations:

```bash
# Create a new migration
npx supabase migration new add_tools_table

# This creates a file in supabase/migrations/ — write your SQL there
# Then apply it:
npx supabase db push
```

Keep migrations in version control. They serve as a history of how the database evolved.

## Error Handling

Every Supabase query returns `{ data, error }`. Never ignore the error:

```typescript
const { data, error } = await supabase.from("tools").select("*");

if (error) {
  console.error("Supabase query failed:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
  // Return a user-friendly error, not the raw Supabase error
  throw new Error("Could not load tools. Please try again.");
}
```

In API routes, return consistent error responses:

```typescript
if (error) {
  return NextResponse.json(
    { error: "Could not load tools", code: "QUERY_FAILED" },
    { status: 500 }
  );
}
```

## Common Mistakes to Avoid

**Don't create clients inside components.** Import from `src/lib/supabase/`. Creating a new client
on every render wastes connections and breaks caching.

**Don't use the service role key client-side.** The service role key bypasses all RLS — it should
only exist in server-side code and environment variables that are NOT prefixed with `NEXT_PUBLIC_`.

**Don't skip RLS.** Even for internal tools, RLS prevents accidental data leaks and makes the app
more robust. Enable it on every table.

**Don't forget to regenerate types after schema changes.** Stale types lead to runtime errors
that TypeScript could have caught at compile time.

**Don't write raw SQL in components.** Use the Supabase JavaScript client. It's type-safe (with
generated types), handles connection pooling, and works consistently across browser and server.
