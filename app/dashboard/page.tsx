// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Item = {
  id: string;
  title: string;
  price_eur: number;
  image_urls: string[] | null;
  is_sold: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(user.email ?? null);

      // optional: fetch items that belong to this user from your API
      try {
        const res = await fetch("/api/items?mine=1");
        if (res.ok) {
          const data = await res.json();
          setMyItems(data.items ?? []);
        }
      } catch (e) {
        console.error("Failed to load my listings:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-50">
        {/* ================= BACKGROUND BLUR ================= */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/marketplace-collage.jpg"
            alt="Dashboard background"
            fill
            priority
            className="object-cover scale-110 blur-xl opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_25%,rgba(167,139,250,0.16),transparent_42%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.14),transparent_45%)]" />
          <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.75)]" />
        </div>
        {/* =================================================== */}

        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-50">
      {/* ================= BACKGROUND BLUR ================= */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/marketplace-collage.jpg"
          alt="Dashboard background"
          fill
          priority
          className="object-cover scale-110 blur-xl opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_25%,rgba(167,139,250,0.16),transparent_42%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.14),transparent_45%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.75)]" />
      </div>
      {/* =================================================== */}

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My dashboard</h1>
            <p className="text-sm text-slate-400">
              Logged in as <span className="font-medium">{userEmail}</span>
            </p>
          </div>
          <button
            onClick={() => router.push("/marketplace/new")}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-900/40 hover:bg-sky-500"
          >
            + New listing
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold text-slate-200">
            Your listings
          </h2>
          {myItems.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              You haven't posted anything yet. Create your first listing from
              the button above.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {myItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {item.image_urls && item.image_urls.length > 0 && (
                      <img
                        src={item.image_urls[0]}
                        alt={item.title}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-slate-400">
                        €{item.price_eur.toFixed(0)} ·{" "}
                        {item.is_sold ? "Sold" : "Active"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/marketplace/${item.id}`)}
                    className="text-xs font-medium text-sky-400 hover:underline"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
