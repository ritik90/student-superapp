"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

type OwnerActionsProps = {
  itemId: string;
  initialIsSold: boolean;
};

export default function OwnerActions({
  itemId,
  initialIsSold,
}: OwnerActionsProps) {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [isSold, setIsSold] = useState(initialIsSold);
  const [busy, setBusy] = useState<null | "sold" | "delete">(null);
  const [error, setError] = useState<string | null>(null);

  async function ensureUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw new Error("not-auth");
    }
    return data.user;
  }

  // Toggle sold / available
  async function handleToggleSold() {
    try {
      setBusy("sold");
      setError(null);

      if (!itemId) {
        throw new Error("Missing item id");
      }

      const user = await ensureUser();

      const { error } = await supabase
        .from("items")
        .update({ is_sold: !isSold })
        .eq("id", itemId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Mark sold error:", error);
        setError(error.message || "Failed to update status.");
        setBusy(null);
        return;
      }

      setIsSold((prev) => !prev);
      setBusy(null);
      // refresh the current listing page
      router.refresh();
    } catch (err: any) {
      console.error("Toggle sold unexpected error:", err);
      if (err?.message === "not-auth") {
        setError("You must be logged in to update this listing.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setBusy(null);
    }
  }

  // Delete listing
  async function handleDelete() {
    try {
      if (!itemId) {
        alert("Invalid listing id.");
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete this listing? This cannot be undone."
      );
      if (!confirmed) return;

      setBusy("delete");
      setError(null);

      const user = await ensureUser();

      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Delete item error:", error);
        setError(error.message || "Failed to delete listing.");
        setBusy(null);
        return;
      }

      // Back to marketplace after successful delete
      router.push("/marketplace");
    } catch (err: any) {
      console.error("Delete unexpected error:", err);
      if (err?.message === "not-auth") {
        setError("You must be logged in to delete this listing.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Edit link */}
      <Link
        href={`/marketplace/${itemId}/edit`}
        className="px-3 py-1.5 rounded-full border border-slate-600 text-[11px] font-medium hover:bg-slate-900"
      >
        Edit listing
      </Link>

      {/* Mark as sold / available */}
      <button
        type="button"
        onClick={handleToggleSold}
        disabled={busy === "sold"}
        className={`px-3 py-1.5 rounded-full text-[11px] font-medium ${
          isSold
            ? "border border-emerald-500/80 text-emerald-200 hover:bg-emerald-500/10"
            : "border border-amber-400/80 text-amber-200 hover:bg-amber-500/10"
        } disabled:opacity-60`}
      >
        {busy === "sold"
          ? "Updating…"
          : isSold
          ? "Mark as available"
          : "Mark as sold"}
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy === "delete"}
        className="px-3 py-1.5 rounded-full border border-rose-500/80 text-rose-200 text-[11px] font-medium hover:bg-rose-500/10 disabled:opacity-60"
      >
        {busy === "delete" ? "Deleting…" : "Delete"}
      </button>

      {error && (
        <p className="w-full text-[11px] text-rose-300 mt-1">{error}</p>
      )}
    </div>
  );
}
