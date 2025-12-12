// app/chats/[id]/ChatClient.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Props = {
  conversationId: string;
  currentUserId: string;
  itemId: string;
  itemTitle: string;
  itemImage: string | null;
  itemPrice: number | null;
  itemLocation: string | null;
  selfDisplayName: string;
  otherDisplayName: string;
  otherRole: string; // "Buyer" / "Seller" / "Student"
};

export default function ChatClient({
  conversationId,
  currentUserId,
  itemId,
  itemTitle,
  itemImage,
  itemPrice,
  itemLocation,
  selfDisplayName,
  otherDisplayName,
  otherRole,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const storageKey = `studenthub_last_chats_seen_${currentUserId}`;

  async function loadMessages() {
    try {
      setError(null);
      const res = await fetch(
        `/api/messages?conversationId=${conversationId}`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load messages.");
        setLoading(false);
        return;
      }

      setMessages(data.messages ?? []);
      setLoading(false);
      scrollToBottom();

      // mark chats as seen for unread badge logic
      if (typeof window !== "undefined") {
        const now = Date.now().toString();
        window.localStorage.setItem(storageKey, now);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load messages.");
      setLoading(false);
    }
  }

  function scrollToBottom(smooth = true) {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }, 50);
  }

  useEffect(() => {
    loadMessages();
    const id = setInterval(loadMessages, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send message.");
        setSending(false);
        return;
      }

      setInput("");
      await loadMessages();
      scrollToBottom();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href="/chats"
              className="text-[11px] text-slate-300 hover:text-slate-100"
            >
              ← Back to inbox
            </a>
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate max-w-[180px]">
                {otherDisplayName}
              </span>
              <span className="text-[10px] text-slate-500">
                {otherRole} · about this listing
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col px-4 py-3 gap-3">
        {/* Listing summary card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
            {itemImage ? (
              <img
                src={itemImage}
                alt={itemTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500">
                No image
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold line-clamp-2">
              {itemTitle || "Listing"}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              {itemPrice !== null && (
                <span className="font-semibold text-sky-300">
                  €{itemPrice.toFixed(0)}
                </span>
              )}
              {itemLocation && <span>{itemLocation}</span>}
            </div>
            <a
              href={`/marketplace/${itemId}`}
              className="mt-1 inline-flex text-[11px] text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline"
            >
              View listing →
            </a>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-900/60 p-3 space-y-2">
          {loading ? (
            <p className="text-xs text-slate-400">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-400">
              No messages yet. Start the conversation.
            </p>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === currentUserId;
              const time = new Date(m.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-3 py-2 text-[12px] shadow-sm ${
                      isMe
                        ? "bg-slate-50 text-slate-900 rounded-br-sm"
                        : "bg-slate-800 text-slate-50 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-[10px] mb-0.5 opacity-70">
                      {isMe ? selfDisplayName : otherDisplayName}
                    </p>
                    <p>{m.content}</p>
                    <p className="mt-1 text-[9px] opacity-60 text-right">
                      {time}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <p className="mt-1 text-[11px] text-red-300 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-1">
            {error}
          </p>
        )}

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="mt-1 flex items-center gap-2 border border-slate-800 bg-slate-900/80 rounded-full px-3 py-1.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="text-[11px] px-3 py-1.5 rounded-full bg-slate-50 text-slate-900 font-medium disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}
