import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Admin client — bypasses Row Level Security.
 * Use ONLY in server-side code for admin operations (migrations, seeding, etc.).
 * NEVER use in API routes that serve user requests.
 */
export function createAdminClient(): ReturnType<typeof createClient<Database>> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
