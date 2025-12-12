// app/marketplace/[id]/ItemImagesClient.tsx
"use client";

import { useState } from "react";

type ItemImagesClientProps = {
  images: string[];
  title: string;
};

export default function ItemImagesClient({
  images,
  title,
}: ItemImagesClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const safeIndex =
    activeIndex >= 0 && activeIndex < images.length ? activeIndex : 0;
  const activeImage = images[safeIndex];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900">
        <img
          src={activeImage}
          alt={title || "Listing image"}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-colors ${
                index === safeIndex
                  ? "border-sky-400"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <img
                src={url}
                alt={`${title || "Image"} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
