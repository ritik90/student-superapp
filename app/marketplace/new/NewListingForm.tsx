// app/marketplace/new/NewListingForm.tsx
"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FILES = 6;
const MAX_SIZE_MB = 5;

const CATEGORIES = [
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

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "kind of new", label: "Kind of new" },
  { value: "used", label: "Used" },
  { value: "well used", label: "Well used" },
];

const LOCATIONS = [
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

export default function NewListingForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("used");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filesList = e.target.files;
    if (!filesList) return;

    let selected = Array.from(filesList);

    if (selected.length > MAX_FILES) {
      alert(`You can upload up to ${MAX_FILES} photos per listing.`);
      selected = selected.slice(0, MAX_FILES);
    }

    const tooBig = selected.find(
      (f) => f.size > MAX_SIZE_MB * 1024 * 1024
    );
    if (tooBig) {
      alert(
        `File "${tooBig.name}" is larger than ${MAX_SIZE_MB}MB. Please choose smaller images.`
      );
      return;
    }

    setFiles(selected);
    setPreviewUrls(selected.map((file) => URL.createObjectURL(file)));
  }

  async function uploadImages(): Promise<string[]> {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload images");
    }

    const data = await res.json();
    const urls = data.urls as string[];
    return urls;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setUploadProgress(null);

    try {
      const trimmedTitle = title.trim();
      const numericPrice = Number(price);
      const trimmedDescription = description.trim();
      const trimmedPhone = phone.trim();

      // ---------- VALIDATION ----------
      if (!trimmedTitle) {
        alert("Please add a title for your item.");
        setSubmitting(false);
        return;
      }

      if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
        alert("Please enter a valid positive price (in euro).");
        setSubmitting(false);
        return;
      }

      if (!category) {
        alert("Please choose a category.");
        setSubmitting(false);
        return;
      }

      if (!location) {
        alert("Please choose a location.");
        setSubmitting(false);
        return;
      }
      // Phone is optional – no format restriction
      // -------------------------------

      let imageUrls: string[] = [];
      if (files.length > 0) {
        setUploadProgress(0);
        imageUrls = await uploadImages();
        setUploadProgress(100);
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          price_eur: numericPrice,
          category,
          location,
          condition,
          description: trimmedDescription || null,
          phone: trimmedPhone || null, // optional, any text
          imageUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Create item error:", data.error);
        alert(data.error || "Failed to create listing. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/marketplace");
      router.refresh();
    } catch (err) {
      console.error("New listing submit error:", err);
      alert("Something went wrong while creating your listing.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl backdrop-blur"
    >
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Title
        </label>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          placeholder="What are you selling?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Price (€)
          </label>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Category
          </label>
          <select
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Condition
          </label>
          <select
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Location / Area
          </label>
          <select
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Select location</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Phone number{" "}
            <span className="text-xs text-slate-400">
              (optional – share if you want)
            </span>
          </label>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="+353 83 123 4567 or WhatsApp handle"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Description
        </label>
        <textarea
          className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 min-h-[120px]"
          placeholder="Add details, condition notes, collection info..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Photos
          <span className="ml-2 text-xs text-slate-400">
            (up to {MAX_FILES} photos, max {MAX_SIZE_MB}MB each)
          </span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-sky-500"
        />
        {previewUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            {previewUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl border border-slate-700"
              >
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="h-32 w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {uploadProgress !== null && (
        <div className="text-sm text-slate-300">
          Uploading photos… {uploadProgress}%
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating listing…" : "Create listing"}
        </button>
      </div>
    </form>
  );
}
