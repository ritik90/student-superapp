// app/marketplace/[id]/MessageSellerButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  itemId: string;
};

export default function MessageSellerButton({ itemId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not start chat.");
        setLoading(false);
        return;
      }

      const conversationId = data.conversationId as string;
      if (!conversationId) {
        setError("No conversation ID returned from server.");
        setLoading(false);
        return;
      }

      router.push(`/chats/${conversationId}`);
    } catch (e) {
      console.error(e);
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-slate-50 text-slate-900 text-sm font-medium hover:bg-white disabled:opacity-60"
      >
        {loading ? "Opening chat…" : "Message seller"}
      </button>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </div>
  );
}
