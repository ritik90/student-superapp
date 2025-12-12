// app/marketplace/my/page.tsx
import { redirect } from "next/navigation";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function MyListingsPage() {
  const supabase = await createSupabaseServerClient();

  // get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // not logged in -> send to login
    redirect("/login");
  }

  // load this user's items
  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading my listings:", error);
  }

  const myItems = items ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* ================= BACKGROUND BLUR ================= */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/marketplace-collage.jpg"
          alt="Marketplace background"
          fill
          priority
          className="object-cover scale-110 blur-xl opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_25%,rgba(167,139,250,0.16),transparent_42%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.14),transparent_45%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.75)]" />
      </div>
      {/* =================================================== */}

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <a
            href="/marketplace"
            className="text-xs text-slate-400 hover:text-sky-300"
          >
            ← Back to marketplace
          </a>

          <a
            href="/marketplace/new"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
          >
            + New listing
          </a>
        </div>

        <header className="mb-4">
          <h1 className="text-2xl font-semibold">My listings</h1>
          <p className="mt-1 text-xs text-slate-400">
            All items you&apos;ve posted on the marketplace.
          </p>
        </header>

        {myItems.length === 0 ? (
          <p className="text-sm text-slate-400">
            You haven&apos;t posted anything yet. Click{" "}
            <a
              href="/marketplace/new"
              className="text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
            >
              here
            </a>{" "}
            to create your first listing.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {myItems.map((item: any) => {
              const img =
                Array.isArray(item.image_urls) && item.image_urls.length > 0
                  ? item.image_urls[0]
                  : null;
              const sold = item.is_sold;
              const createdAt = item.created_at
                ? new Date(item.created_at)
                : null;
              const createdLabel = createdAt
                ? createdAt.toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <a
                  key={item.id}
                  href={`/marketplace/${item.id}`}
                  className={`group rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden hover:border-sky-500/60 hover:bg-slate-900 transition-colors ${
                    sold ? "opacity-70" : ""
                  }`}
                >
                  <div className="aspect-[4/3] w-full bg-slate-900 relative overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={item.title ?? "Listing image"}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                        No image
                      </div>
                    )}

                    {sold && (
                      <div className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white shadow">
                        Sold
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-sm font-medium line-clamp-2">
                        {item.title ?? "Listing"}
                      </h2>
                      <span className="text-sm font-semibold text-sky-300 shrink-0">
                        €{item.price_eur?.toFixed(0) ?? "—"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                      {item.category && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800">
                          {item.category}
                        </span>
                      )}
                      {item.condition && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800">
                          {item.condition}
                        </span>
                      )}
                      {item.location && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800">
                          {item.location}
                        </span>
                      )}
                    </div>

                    {createdLabel && (
                      <p className="text-[10px] text-slate-500">
                        Posted on {createdLabel}
                      </p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
