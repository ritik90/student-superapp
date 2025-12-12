// app/auth/callback/page.tsx
import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
          <p className="text-sm text-slate-400">Signing you in…</p>
        </div>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}
