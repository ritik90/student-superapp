// app/marketplace/[id]/RecentlyViewedClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type ItemSummary = {
  id: string;
  title: string;
  price_eur: number;
  image_url: string | null;
  category: string | null;
  location: string | null;
};

const STORAGE_KEY = "studenthub_recently_viewed";

export default function RecentlyViewedClient({
  current,
}: {
  current: ItemSummary;
}) {
  const [items, setItems] = useState<ItemSummary[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      let list: ItemSummary[] = raw ? JSON.parse(raw) : [];

      // remove if already there
      list = list.filter((i) => i.id !== current.id);

      // add current to front
      list.unshift(current);

      // keep only latest 8
      list = list.slice(0, 8);

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // for display, we don't show the current item itself
      setItems(list.filter((i) => i.id !== current.id));
    } catch (e) {
      console.error("Error handling recently viewed:", e);
    }
  }, [current]);

  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Recently viewed
        </h2>
        <p className="text-[10px] text-slate-500">
          Quick access to items you checked earlier
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/marketplace/${item.id}`}
            className="min-w-[180px] max-w-[200px] flex-shrink-0 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-sky-500/70 transition-colors overflow-hidden"
          >
            <div className="aspect-[4/3] bg-slate-900">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                  No image
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-2 text-[11px] font-medium">
                {item.title}
              </p>
              <p className="mt-1 text-[11px] text-sky-300 font-semibold">
                €{item.price_eur.toFixed(0)}
              </p>
              {item.location && (
                <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">
                  {item.location}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
