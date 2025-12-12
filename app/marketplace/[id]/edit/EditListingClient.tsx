// app/marketplace/[id]/edit/EditListingClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
};

export default function EditListingClient({
  initialItem,
}: {
  initialItem: Item;
}) {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [title, setTitle] = useState(initialItem.title ?? "");
  const [price, setPrice] = useState(initialItem.price_eur.toString());
  const [category, setCategory] = useState(initialItem.category ?? "");
  const [condition, setCondition] = useState(initialItem.condition ?? "");
  const [location, setLocation] = useState(initialItem.location ?? "");
  const [phone, setPhone] = useState(initialItem.phone ?? "");
  const [description, setDescription] = useState(initialItem.description ?? "");

  // existing images stored in DB
  const [existingImages, setExistingImages] = useState<string[]>(
    initialItem.image_urls ?? []
  );

  // new images selected from local machine
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

  const [saving, setSaving] = useState(false);

  const handleRemoveExisting = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    // 1) upload new files to Supabase storage
    const uploadedUrls: string[] = [];
    if (newFiles && newFiles.length > 0) {
      for (const file of Array.from(newFiles)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${initialItem.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(path, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("Failed to upload one of the images.");
          setSaving(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("item-images").getPublicUrl(path);

        uploadedUrls.push(publicUrl);
      }
    }

    const finalImageUrls = [...existingImages, ...uploadedUrls];

    // 2) call PUT /api/items/[id] to update listing
    const res = await fetch(`/api/items/${initialItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        price,
        category,
        condition,
        location,
        phone,
        description,
        imageUrls: finalImageUrls,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Update failed:", text);
      alert("Failed to save changes. Check console for details.");
      setSaving(false);
      return;
    }

    router.push(`/marketplace/${initialItem.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Edit listing</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Item title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Price (€)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Category (e.g. furniture)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Condition (e.g. used, like new)"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Location (e.g. Dublin 1)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Seller phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <textarea
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500 min-h-[120px]"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Existing images:</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((url) => (
                  <div
                    key={url}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="item"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(url)}
                      className="text-rose-400 hover:text-rose-300 text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New uploads */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">
              Upload new images (they’ll be added on top of existing ones)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewFiles(e.target.files)}
              className="text-sm text-slate-200"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
