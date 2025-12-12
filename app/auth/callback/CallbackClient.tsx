// app/auth/callback/CallbackClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function run() {
      // ✅ keep your existing logic here
      // Example: if you're exchanging code manually or just redirecting
      // (depends on how you implemented auth callback)

      // If you don't need the params, you can still read them safely now:
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/marketplace";

      // If your Supabase auth flow already sets session automatically,
      // you may only need to redirect:
      // router.replace(next);

      // If you do any supabase call here, keep it exactly as you had it.
      // (I’m not changing your logic.)
      const supabase = supabaseBrowser();
      await supabase.auth.getSession(); // harmless; ensures client is ready

      router.replace(next);
    }

    run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <p className="text-sm text-slate-400">Completing sign-in…</p>
    </div>
  );
}
