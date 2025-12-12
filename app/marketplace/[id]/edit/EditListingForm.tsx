"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

export type Item = {
  id: string;
  title: string;
  category: string | null;
  condition: string | null;
  location: string | null;
  description: string | null;
  phone: string | null;
  price_eur: number;
  image_urls: string[] | null;
  is_sold: boolean;
  user_id: string; // owner
};

type EditListingFormProps = {
  initialItem: Item;
};

export default function EditListingForm({ initialItem }: EditListingFormProps) {
  const router = useRouter();
  const supabase = supabaseBrowser();

  // Basic fields
  const [title, setTitle] = useState(initialItem.title ?? "");
  const [price, setPrice] = useState(String(initialItem.price_eur ?? ""));
  const [category, setCategory] = useState(initialItem.category ?? "");
  const [condition, setCondition] = useState(initialItem.condition ?? "");
  const [location, setLocation] = useState(initialItem.location ?? "");
  const [phone, setPhone] = useState(initialItem.phone ?? "");
  const [description, setDescription] = useState(
    initialItem.description ?? ""
  );

  // Existing images from DB
  const [existingImages] = useState<string[]>(
    initialItem.image_urls ?? []
  );

  // New local files selected in the edit form
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setNewFiles(files);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const uploadedUrls: string[] = [];

      // Upload any newly selected files to the "item-images" bucket
      for (const file of newFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${
          initialItem.user_id
        }/${initialItem.id}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw new Error("Failed to upload images.");
        }

        const { data: publicData } = supabase.storage
          .from("item-images")
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          uploadedUrls.push(publicData.publicUrl);
        }
      }

      const finalImageUrls = [...existingImages, ...uploadedUrls];

      const priceNumber = Number(price) || 0;

      // Update row in Supabase. RLS should ensure only the owner can do this.
      const { error: updateError } = await supabase
        .from("items")
        .update({
          title,
          price_eur: priceNumber,
          category: category || null,
          condition: condition || null,
          location: location || null,
          phone: phone || null,
          description: description || null,
          image_urls: finalImageUrls,
        })
        .eq("id", initialItem.id);

      if (updateError) {
        console.error("Update item error:", updateError);
        alert(
          updateError.message ||
            "Failed to update listing. Please try again."
        );
        setSaving(false);
        return;
      }

      // Back to the item details page
      router.push(`/marketplace/${initialItem.id}`);
    } catch (err) {
      console.error("Edit listing unexpected error:", err);
      alert("Something went wrong while saving. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm mb-1">Title</label>
        <input
          className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm mb-1">Price (€)</label>
        <input
          type="number"
          min={0}
          className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      {/* Category / Condition / Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <input
            className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Condition</label>
          <input
            className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Location</label>
          <input
            className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm mb-1">Phone</label>
        <input
          className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+353 ..."
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea
          className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm min-h-[90px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div>
          <label className="block text-sm mb-2">Existing photos</label>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((url, idx) => (
              <div
                key={idx}
                className="w-24 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New image upload from local */}
      <div>
        <label className="block text-sm mb-1">
          Upload new images (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="text-sm text-slate-300"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          You can add more photos here. Existing images will stay unless you
          change them in the database.
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
