// app/marketplace/MarketplaceClient.tsx
"use client";

import Image from "next/image";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Item = {
  id: string;
  title: string;
  category: string | null;
  condition: string | null;
  location: string | null;
  description: string | null;
  phone: string | null;
  price_eur: number;
  image_urls: string[] | null;
  created_at: string;
  user_id: string | null;
  is_sold: boolean;
  college_domain: string | null;
};

type ConversationForBadge = {
  last_message_at: string | null;
};

const CATEGORY_DEFAULTS = [
  { value: "furniture", label: "Furniture" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books & Notes" },
  { value: "kitchen", label: "Kitchen & Home" },
  { value: "appliances", label: "Appliances" },
  { value: "tickets", label: "Tickets & Events" },
  { value: "stationery", label: "Stationery & Study" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "gaming", label: "Gaming & Accessories" },
  { value: "other", label: "Other" },
];

const CONDITION_DEFAULTS = [
  { value: "new", label: "New" },
  { value: "kind of new", label: "Kind of new" },
  { value: "used", label: "Used" },
  { value: "well used", label: "Well used" },
];

const LOCATION_DEFAULTS = [
  "Dublin 1",
  "Dublin 2",
  "Dublin 4",
  "Dublin 6",
  "Dublin 8",
  "On-campus TCD",
  "On-campus UCD",
  "On-campus DCU",
  "NCIRL",
  "Online only",
];

export default function MarketplaceClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentCollegeDomain, setCurrentCollegeDomain] =
    useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Filters + sort
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "price_low" | "price_high"
  >("newest");
  const [hideSold, setHideSold] = useState(true);
  const [onlyMine, setOnlyMine] = useState(false);

  // 1) Load all items
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/items");
        const json = await res.json();
        setItems(json.items || []);
      } catch (e) {
        setError("Failed to load listings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 2) Load logged-in user
  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (user) {
        setCurrentUserId(user.id);
        const domain = user.email?.split("@")[1]?.toLowerCase() ?? null;
        setCurrentCollegeDomain(domain);
      }
    });
  }, []);

  // 3) Load favorites
  useEffect(() => {
    if (!currentUserId) return;
    async function loadFavs() {
      const res = await fetch("/api/favorites", { cache: "no-store" });
      const json = await res.json();
      setFavoriteIds(json.favorites?.map((f: any) => f.item_id) || []);
    }
    loadFavs();
  }, [currentUserId]);

  // 4) Inbox unread badge
  useEffect(() => {
    if (!currentUserId) return;

    const key = `studenthub_last_chats_seen_${currentUserId}`;

    async function fetchUnread() {
      const lastSeen = Number(localStorage.getItem(key) || 0);

      const res = await fetch("/api/chats", { cache: "no-store" });
      const json = await res.json();

      const conversations: ConversationForBadge[] = json.conversations || [];
      let count = 0;

      conversations.forEach((c) => {
        if (c.last_message_at) {
          const t = new Date(c.last_message_at).getTime();
          if (t > lastSeen) count++;
        }
      });

      setUnreadCount(count);
    }

    fetchUnread();
    const id = setInterval(fetchUnread, 15000);
    return () => clearInterval(id);
  }, [currentUserId]);

  // Toggle favorites
  async function toggleFavorite(id: string, isFav: boolean) {
    const res = await fetch("/api/favorites", {
      method: "POST",
      body: JSON.stringify({
        itemId: id,
        action: isFav ? "remove" : "add",
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      if (isFav) {
        setFavoriteIds((prev) => prev.filter((i) => i !== id));
      } else {
        setFavoriteIds((prev) => [...prev, id]);
      }
    }
  }

  // ---------------------- FILTER LOGIC ----------------------

  const locationOptions = useMemo(() => {
    const set = new Set(LOCATION_DEFAULTS);
    items.forEach((i) => i.location && set.add(i.location));
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = [...items];

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((i) =>
        (
          (i.title || "") +
          " " +
          (i.description || "") +
          " " +
          (i.category || "")
        )
          .toLowerCase()
          .includes(q)
      );
    }

    // Category
    if (categoryFilter !== "all") {
      list = list.filter((i) => i.category === categoryFilter);
    }

    // Condition
    if (conditionFilter !== "all") {
      list = list.filter((i) => i.condition === conditionFilter);
    }

    // Location
    if (locationFilter !== "all") {
      list = list.filter((i) => i.location === locationFilter);
    }

    // Hide sold
    if (hideSold) list = list.filter((i) => !i.is_sold);

    // Only my listings
    if (onlyMine && currentUserId) {
      list = list.filter((i) => i.user_id === currentUserId);
    }

    // Sort
    if (sortOrder === "price_low") {
      list.sort((a, b) => a.price_eur - b.price_eur);
    } else if (sortOrder === "price_high") {
      list.sort((a, b) => b.price_eur - a.price_eur);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return list;
  }, [
    items,
    search,
    categoryFilter,
    conditionFilter,
    locationFilter,
    hideSold,
    sortOrder,
    onlyMine,
    currentUserId,
  ]);

  // 💸 Student deals under €25
  const budgetItems = useMemo(() => {
    return filteredItems
      .filter((i) => i.price_eur <= 25)
      .sort((a, b) => a.price_eur - b.price_eur)
      .slice(0, 10);
  }, [filteredItems]);

  const hasQuery = search.trim().length > 0;
  const resultCount = filteredItems.length;

  // ------------------------ UI ------------------------

  // UI-only blur background layer (same for loading/error/main)
    const BlurBg = () => (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {/* BLURRED COLLAGE IMAGE (same style as login) */}
      <Image
        src="/marketplace-collage.jpg"
        alt="Marketplace background"
        fill
        priority
        className="object-cover scale-110 blur-xl opacity-80"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />

      {/* COLOR GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_82%_22%,rgba(167,139,250,0.16),transparent_44%),radial-gradient(circle_at_55%_90%,rgba(16,185,129,0.12),transparent_46%)]" />

      {/* VIGNETTE */}
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.75)]" />
    </div>
  );


  if (loading)
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#05070d] text-slate-200">
        <BlurBg />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border border-slate-700 border-t-sky-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading Student Hub…</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#05070d] text-slate-100">
        <BlurBg />
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md rounded-2xl border border-rose-500/40 bg-rose-950/40 px-6 py-5 shadow-lg backdrop-blur-xl">
            <p className="text-sm font-semibold text-rose-300">
              Something went wrong
            </p>
            <p className="mt-1 text-xs text-rose-200/80">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#05070d] text-slate-100">
      <BlurBg />

      <main className="mx-auto max-w-6xl px-4 py-6 pb-12 relative z-10">
        {/* TOP NAV / HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-sky-400 uppercase mb-2">
              Student Hub
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              Discover Your Next Favorite
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Search through hundreds of student listings – furniture, bikes,
              books, and more across Irish colleges.
            </p>
            {currentCollegeDomain && (
              <p className="mt-1 text-[11px] text-slate-500">
                Logged in as{" "}
                <span className="font-mono text-sky-300">
                  {currentCollegeDomain}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-2 self-start md:self-auto">
            <Link
              href="/chats"
              className="relative rounded-full border border-slate-700 px-4 py-2 text-xs md:text-sm hover:bg-slate-900 flex items-center gap-2"
            >
              <span>Inbox</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-sky-600 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/marketplace/my"
              className="rounded-full border border-slate-700 px-4 py-2 text-xs md:text-sm hover:bg-slate-900"
            >
              My listings
            </Link>

            <Link
              href="/marketplace/new"
              className="rounded-full bg-sky-600 px-4 py-2 text-xs md:text-sm font-medium hover:bg-sky-500 shadow-[0_0_25px_rgba(56,189,248,0.35)]"
            >
              + New listing
            </Link>
          </div>
        </header>

        {/* HERO SEARCH BAR */}
        <section className="mb-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-3 md:flex-row">
              {/* Category dropdown */}
              <div className="w-full md:w-52">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-xl border border-sky-600/70 bg-slate-950 px-3 py-2 text-xs md:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All categories</option>
                  {CATEGORY_DEFAULTS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search input with icon style */}
              <div className="flex-1 relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs md:text-sm text-slate-500">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Type here to search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-sky-600/70 bg-slate-950 pl-9 pr-3 py-2 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Secondary filters row under search */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] md:text-xs">
            <div className="flex flex-wrap gap-2">
              {/* Condition */}
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5"
              >
                <option value="all">Condition</option>
                {CONDITION_DEFAULTS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Location */}
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5"
              >
                <option value="all">Location</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value as "newest" | "price_low" | "price_high"
                  )
                }
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5"
              >
                <option value="newest">Newest first</option>
                <option value="price_low">Price low → high</option>
                <option value="price_high">Price high → low</option>
              </select>
            </div>

            <div className="flex gap-2">
              {/* Hide sold */}
              <button
                onClick={() => setHideSold((v) => !v)}
                className={`rounded-full px-3 py-1.5 border ${
                  hideSold
                    ? "border-emerald-500 bg-emerald-900/40 text-emerald-200"
                    : "border-slate-700 bg-slate-950 text-slate-300"
                }`}
              >
                {hideSold ? "Hiding sold" : "Show sold"}
              </button>

              {/* Only my listings */}
              <button
                onClick={() => setOnlyMine((v) => !v)}
                className={`rounded-full px-3 py-1.5 border ${
                  onlyMine
                    ? "border-sky-500 bg-sky-900/40 text-sky-200"
                    : "border-slate-700 bg-slate-950 text-slate-300"
                }`}
              >
                {onlyMine ? "My listings" : "All sellers"}
              </button>
            </div>
          </div>
        </section>

        {/* 💸 Student deals horizontal strip */}
        {budgetItems.length > 0 && !hasQuery && (
          <section className="mb-10">
            <h2 className="text-sm md:text-base font-semibold text-slate-100 mb-1">
              Student deals under €25
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500 mb-3">
              Cheap essentials picked from current listings
            </p>

            <div className="flex overflow-x-auto gap-3 pb-2">
              {budgetItems.map((item) => {
                const img = item.image_urls?.[0] || null;

                return (
                  <Link
                    key={item.id}
                    href={`/marketplace/${item.id}`}
                    className="min-w-[160px] max-w-[180px] flex-shrink-0 rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden hover:bg-slate-950 hover:border-sky-500/70 transition"
                  >
                    <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-2 text-[11px]">{item.title}</p>
                      <p className="text-[11px] text-emerald-300 font-bold mt-1">
                        €{item.price_eur}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* MAIN RESULTS SECTION */}
        <section>
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-sky-500" />
              <h2 className="text-lg font-semibold">
                {hasQuery
                  ? `Search results for "${search.trim()}"`
                  : "Trending Today"}
              </h2>
            </div>
            <p className="text-[11px] md:text-xs text-slate-500">
              {resultCount} result{resultCount === 1 ? "" : "s"} found
            </p>
          </div>

          {filteredItems.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No listings match your filters. Try changing the search or filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredItems.map((item) => {
                const img = item.image_urls?.[0] || null;
                const isFav = favoriteIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`group rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden hover:border-sky-500/70 hover:bg-slate-950 transition ${
                      item.is_sold ? "opacity-60" : ""
                    }`}
                  >
                    <Link href={`/marketplace/${item.id}`}>
                      <div className="relative aspect-[2/3] bg-slate-950 overflow-hidden">
                        {img ? (
                          <img
                            src={img}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                            No image
                          </div>
                        )}

                        {item.is_sold && (
                          <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                            Sold
                          </div>
                        )}

                        {/* Favorite */}
                        {currentUserId && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(item.id, isFav);
                            }}
                            className="absolute top-2 right-2 bg-black/60 border border-slate-700 px-2 py-1 rounded-full text-[11px] hover:border-sky-400"
                          >
                            <span
                              className={
                                isFav ? "text-yellow-300" : "text-slate-300"
                              }
                            >
                              {isFav ? "★" : "☆"}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="p-2 space-y-1">
                        <p className="line-clamp-2 text-[12px] font-medium">
                          {item.title}
                        </p>
                        <p className="text-[12px] font-semibold text-sky-300">
                          €{item.price_eur}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
