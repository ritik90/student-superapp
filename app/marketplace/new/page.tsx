// app/marketplace/new/page.tsx
import { redirect } from "next/navigation";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import NewListingClient from "./NewListingClient";

export default async function NewListingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const collegeDomain = email.includes("@")
    ? email.split("@")[1]?.toLowerCase() ?? null
    : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* ================= BACKGROUND BLUR ================= */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Background image */}
        <Image
          src="/marketplace-collage.jpg"
          alt="Marketplace background"
          fill
          priority
          className="object-cover scale-110 blur-xl opacity-80"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />

        {/* Color glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_25%,rgba(167,139,250,0.16),transparent_42%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.14),transparent_45%)]" />

        {/* Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.75)]" />
      </div>
      {/* =================================================== */}

      {/* ================= CONTENT ================= */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-6">
        <a
          href="/marketplace"
          className="text-xs text-slate-400 hover:text-sky-300"
        >
          ← Back to marketplace
        </a>

        <h1 className="mt-4 text-2xl font-semibold">Create a listing</h1>
        <p className="mt-1 text-xs text-slate-400">
          Sell to other students across colleges. Add clear photos and honest
          details.
        </p>

        <div className="mt-5">
          <NewListingClient
            userEmail={email}
            collegeDomain={collegeDomain}
          />
        </div>
      </main>
      {/* ============================================ */}
    </div>
  );
}
