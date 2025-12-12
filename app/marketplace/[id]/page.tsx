// app/marketplace/[id]/page.tsx
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import MessageSellerButton from "./MessageSellerButton";
import OwnerActions from "./OwnerActions";
import ItemImagesClient from "./ItemImagesClient";
import RecentlyViewedClient, {
  ItemSummary,
} from "./RecentlyViewedClient";

type ItemPageProps = {
  // In Next 16 params is a Promise
  params: Promise<{ id: string }>;
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;

  // user (for owner actions / links)
  const supabase = await createSupabaseServerClient();

  let user: any = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      user = data.user;
    }
  } catch (e) {
    console.error("Error getting user in item page:", e);
  }

  // load item with admin client to avoid RLS issues
  const { data: item, error } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    console.error("Item fetch error:", error);
    notFound();
  }

  const imageUrls: string[] = Array.isArray(item.image_urls)
    ? item.image_urls
    : [];

  const sellerEmail: string | null = item.seller_email ?? null;
  const phone: string | null = item.phone ?? null;
  const collegeLabel =
    item.college_domain && typeof item.college_domain === "string"
      ? item.college_domain.replace(".ie", "").toUpperCase() + " student"
      : "Student seller";

  const isOwner = user && item.user_id === user.id;

  const createdAt: Date | null = item.created_at
    ? new Date(item.created_at)
    : null;
  const createdLabel = createdAt
    ? createdAt.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const currentSummary: ItemSummary = {
    id: item.id,
    title: item.title ?? "Listing",
    price_eur: item.price_eur ?? 0,
    image_url: imageUrls.length > 0 ? imageUrls[0] : null,
    category: item.category ?? null,
    location: item.location ?? null,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <a
            href="/marketplace"
            className="text-xs text-slate-400 hover:text-sky-300"
          >
            ← Back to marketplace
          </a>

          <div className="flex items-center gap-2">
            {item.is_sold && (
              <span className="rounded-full bg-red-900/40 px-3 py-1 text-[11px] font-medium text-red-200 border border-red-800/70">
                Sold
              </span>
            )}
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300">
              {collegeLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
              {imageUrls.length > 0 ? (
                <ItemImagesClient
                  images={imageUrls}
                  title={item.title ?? "Listing image"}
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-900 text-xs text-slate-500">
                  No image uploaded
                </div>
              )}
            </div>

            {item.description && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </h2>
                <p className="whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold">
                    {item.title || "Listing"}
                  </h1>
                  {createdLabel && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Posted on {createdLabel}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-sky-300">
                    €{item.price_eur?.toFixed(0) ?? "—"}
                  </p>
                  {item.location && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                {item.category && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5">
                    {item.category}
                  </span>
                )}
                {item.condition && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5">
                    {item.condition}
                  </span>
                )}
                {item.location && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5">
                    {item.location}
                  </span>
                )}
              </div>

              <div className="mt-4 border-t border-slate-800 pt-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  Seller details
                </h2>

                <div className="space-y-1 text-[13px]">
                  {sellerEmail && (
                    <p className="text-slate-200">
                      <span className="text-slate-400">Email: </span>
                      <span className="font-mono text-sky-200">
                        {sellerEmail}
                      </span>
                    </p>
                  )}

                  {phone && (
                    <p className="text-slate-200">
                      <span className="text-slate-400">Phone: </span>
                      <span className="font-mono text-emerald-200">
                        {phone}
                      </span>
                    </p>
                  )}

                  <p className="text-slate-300">
                    <span className="text-slate-400">College: </span>
                    {collegeLabel}
                  </p>

                  {item.user_id && (
                    <p className="mt-1 text-[11px]">
                      <a
                        href={`/users/${item.user_id}`}
                        className="text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
                      >
                        View more listings from this seller →
                      </a>
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {isOwner ? (
                    <OwnerActions
                      itemId={item.id}
                      initialIsSold={item.is_sold}
                    />
                  ) : (
                    <MessageSellerButton itemId={item.id} />
                  )}
                </div>

                <div className="mt-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/80 px-3 py-2 text-[10px] text-slate-400">
                  ✅ Meet in public places · ✅ Verify student ID if unsure · ✅
                  Use cash or trusted payment only · 🚫 Never share passwords or
                  one-time codes.
                </div>
              </div>
            </div>
          </div>
        </div>

        <RecentlyViewedClient current={currentSummary} />
      </main>
    </div>
  );
}
