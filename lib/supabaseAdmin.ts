// lib/supabaseAdmin.ts
// Server-side Supabase client using the service role key.
// IMPORTANT: never import this in client components.

import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only env var
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
