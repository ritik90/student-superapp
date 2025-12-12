// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    // If there is an error in the URL (e.g. otp_expired), don't try to hydrate session
    if (error) return;

    const supabase = supabaseBrowser();

    supabase.auth.getSession().finally(() => {
      setTimeout(() => {
        router.replace("/marketplace");
      }, 1200);
    });
  }, [error, router]);

  // If Supabase says the link is invalid / expired
  if (error) {
    return (
      <div className="min-h-screen bg-black text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-700/70 bg-rose-950/90 px-6 py-8 text-center shadow-xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-rose-300 uppercase mb-2">
            Verification link error
          </p>
          <h1 className="text-xl font-semibold mb-2">Link expired or invalid</h1>
          <p className="text-sm text-slate-200 mb-3">
            The email verification link is no longer valid. This usually
            happens if it was already used or if it has expired.
          </p>
          {errorDescription && (
            <p className="text-[11px] text-slate-400 mb-4">
              Details: {decodeURIComponent(errorDescription)}
            </p>
          )}
          <p className="text-xs text-slate-400">
            Please go back to the login page and request a{" "}
            <span className="font-semibold text-rose-100">
              new confirmation email
            </span>
            .
          </p>
        </div>
      </div>
    );
  }

  // Normal success case
  return (
    <div className="min-h-screen bg-black text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-6 py-8 text-center shadow-xl">
        <p className="text-xs font-semibold tracking-[0.25em] text-sky-400 uppercase mb-2">
          Email verified
        </p>
        <h1 className="text-xl font-semibold mb-2">
          Your college email is confirmed 🎓
        </h1>
        <p className="text-sm text-slate-400">
          You&apos;re being redirected to the marketplace. You can now log in
          normally with your college email and password.
        </p>
      </div>
    </div>
  );
}
