// lib/supabaseServer.ts
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  // In Next.js 16, cookies() is async
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // These are required by the type but no-ops in route handlers
        set(name: string, value: string, options: any) {
          return;
        },
        remove(name: string, options: any) {
          return;
        },
      },
    }
  );
}
