// app/users/[id]/page.tsx
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type SellerPageProps = {
  // Next 16: params is Promise
  params: Promise<{ id: string }>;
};

export default async function SellerPage({ params }: SellerPageProps) {
  const { id } = await params; // can be user_id OR seller_email

  const supabase = await createSupabaseServerClient();

  // load items for this seller using user_id OR seller_email
  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .or(`user_id.eq.${id},seller_email.eq.${id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading seller items:", error);
    notFound();
  }

  const sellerItems = items ?? [];

  if (sellerItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <main className="mx-auto max-w-5xl px-4 py-8">
          <a
            href="/marketplace"
            className="text-xs text-slate-400 hover:text-sky-300"
          >
            ← Back to marketplace
          </a>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-slate-100">
                S
              </div>
              <div>
                <h1 className="text-lg font-semibold">Student seller</h1>
                <p className="text-xs text-slate-400">
                  This seller has no active listings.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const first: any = sellerItems[0];

  const sellerEmail: string | null = first.seller_email ?? null;
  const localPart =
    sellerEmail?.split("@")[0] ??
    (first.college_domain ? first.college_domain.replace(".ie", "") : "student");
  const displayName =
    localPart.length > 0
      ? localPart.charAt(0).toUpperCase() + localPart.slice(1)
      : "Student seller";

  const collegeLabel =
    first.college_domain && typeof first.college_domain === "string"
      ? first.college_domain.replace(".ie", "").toUpperCase() + " student"
      : "Student seller";

  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <a
          href="/marketplace"
          className="text-xs text-slate-400 hover:text-sky-300"
        >
          ← Back to marketplace
        </a>

        {/* Seller header */}
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-xl font-semibold text-slate-100">
              {avatarInitial}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{displayName}</h1>
              <p className="text-xs text-slate-400">{collegeLabel}</p>
              {sellerEmail && (
                <p className="mt-1 text-xs text-slate-400">
                  Contact:{" "}
                  <span className="font-mono text-sky-200">
                    {sellerEmail}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-400">
            <p>
              Total listings:{" "}
              <span className="font-semibold text-slate-200">
                {sellerItems.length}
              </span>
            </p>
          </div>
        </div>

        {/* Listings */}
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-200">
            Listings from this seller
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {sellerItems.map((item: any) => {
              const img =
                Array.isArray(item.image_urls) && item.image_urls.length > 0
                  ? item.image_urls[0]
                  : null;
              const sold = item.is_sold;
              const createdAt = item.created_at ? new Date(item.created_at) : null;
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
                      <h3 className="text-sm font-medium line-clamp-2">
                        {item.title ?? "Listing"}
                      </h3>
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
        </section>
      </main>
    </div>
  );
}
