// app/marketplace/new/NewListingClient.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Props = {
  userEmail: string;
  collegeDomain: string | null;
};

const CATEGORY_OPTIONS = [
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

const CONDITION_OPTIONS = [
  { value: "new", label: "New" },
  { value: "kind of new", label: "Kind of new" },
  { value: "used", label: "Used" },
  { value: "well used", label: "Well used" },
];

const LOCATION_OPTIONS = [
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

export default function NewListingClient({ userEmail, collegeDomain }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("electronics");
  const [condition, setCondition] = useState<string>("used");
  const [location, setLocation] = useState<string>("On-campus TCD");
  const [phone, setPhone] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const combined = [...files, ...selected].slice(0, 5);
    setFiles(combined);

    const previewUrls = combined.map((f) => URL.createObjectURL(f));
    setPreviews(previewUrls);
  }

  async function uploadImages(): Promise<string[]> {
    if (files.length === 0) return [];

    const supabase = supabaseBrowser();
    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(path, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(
          uploadError.message || "Failed to upload one of the images."
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("item-images").getPublicUrl(path);

      urls.push(publicUrl);
    }

    return urls;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNumber = Number(price);

    if (!title.trim() || !priceNumber) {
      setError("Please add a title and price.");
      return;
    }

    // ✅ phone is OPTIONAL – no check here
    // if (!phone.trim()) { ... }  <- removed

    setSubmitting(true);

    try {
      const imageUrls = await uploadImages();

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          price_eur: priceNumber,
          description: description.trim() || null,
          category,
          condition,
          location,
          phone: phone.trim() || null, // optional
          image_urls: imageUrls.length > 0 ? imageUrls : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Create item error:", data.error);
        setError(data.error || "Failed to create listing.");
        setSubmitting(false);
        return;
      }

      // if your API returns { success, id }, adjust here accordingly:
      const itemId = data.item?.id ?? data.id;
      if (itemId) {
        router.push(`/marketplace/${itemId}`);
      } else {
        router.push("/marketplace");
      }
    } catch (err: any) {
      console.error("Unexpected error while creating listing:", err);
      setError(err?.message || "Something went wrong while uploading images.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
    >
      {/* Title + Price */}
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div>
          <label className="text-xs font-medium text-slate-200">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500"
            placeholder="Eg: Study desk, Laptop, Cycle..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-200">Price (€)</label>
          <input
            value={price}
            type="number"
            min={0}
            step={1}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500"
            placeholder="20"
          />
        </div>
      </div>

      {/* Category, Condition, Location */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-slate-200">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-200">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs"
          >
            {CONDITION_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-200">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs"
          >
            {LOCATION_OPTIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-slate-200">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Mention condition, what's included, any issues..."
        />
      </div>

      {/* Phone (optional now) */}
      <div>
        <label className="text-xs font-medium text-slate-200">
          Phone / contact (optional)
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500"
          placeholder="+353 87 123 4567 or WhatsApp / Insta"
        />
        <p className="text-[10px] text-slate-500">
          Buyers will see this if you choose to share it.
        </p>
      </div>

      {/* Images */}
      <div>
        <label className="text-xs font-medium text-slate-200">
          Photos (up to 5)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="mt-1 block w-full text-xs text-slate-300 file:bg-slate-800 file:border-0 file:px-3 file:py-1.5 file:rounded-md"
        />

        {previews.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative h-20 w-24 overflow-hidden rounded-lg border border-slate-700"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} className="h-full w-full object-cover" alt="" />
                <span className="absolute left-1 top-1 rounded bg-slate-900/70 px-1 text-[9px]">
                  {i === 0 ? "Cover" : `#${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-300 bg-red-900/20 border border-red-700 rounded p-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-2">
        {collegeDomain && (
          <p className="text-[10px] text-slate-500">
            Listing will be posted as{" "}
            <span className="font-mono text-sky-300">{collegeDomain}</span>{" "}
            student.
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post listing"}
        </button>
      </div>
    </form>
  );
}
