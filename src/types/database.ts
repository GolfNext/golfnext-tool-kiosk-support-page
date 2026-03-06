/**
 * Auto-generated Supabase types.
 *
 * Regenerate after any schema change:
 *   npm run types:generate
 *
 * This is a placeholder — replace with your actual generated types
 * by running the command above with your Supabase project ID.
 */
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
