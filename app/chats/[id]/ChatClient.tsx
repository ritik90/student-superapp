"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

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
  otherRole: string;
};

export default function ChatClient({ conversationId, currentUserId, itemId, itemTitle, itemImage, itemPrice, itemLocation, selfDisplayName, otherDisplayName, otherRole }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const latestMessageIds = useRef<Set<string>>(new Set());

  function scrollToBottom(smooth = true) {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }, 50);
  }

  async function markRead() {
    try {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

  async function loadMessages(silent = false) {
    try {
      if (!silent) setError(null);
      const res = await fetch(`/api/messages?conversationId=${conversationId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { if (!silent) setError(data.error || "Failed to load messages."); return; }
      const incoming: Message[] = data.messages ?? [];
      setMessages(incoming);
      incoming.forEach((m) => latestMessageIds.current.add(m.id));
      setLoading(false);
      scrollToBottom(false);
    } catch (err) {
      console.error(err);
      if (!silent) setError("Failed to load messages.");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    markRead();
    const id = setInterval(() => loadMessages(true), 4000);
    return () => clearInterval(id);
  }, [conversationId]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const msg = payload.new as Message;
        if (latestMessageIds.current.has(msg.id)) return;
        latestMessageIds.current.add(msg.id);
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
        if (msg.sender_id !== currentUserId) markRead();
      })
      .subscribe((status) => { setConnected(status === "SUBSCRIBED"); });
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, currentUserId]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);
    setInput("");

    // Optimistic update — show message instantly before server confirms
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Roll back the optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError(data.error || "Failed to send message.");
        setInput(trimmed);
        return;
      }
      // Next poll will replace the temp message with the real one from the server
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError("Something went wrong.");
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a href="/chats" className="text-[11px] text-slate-300 hover:text-slate-100">← Back to inbox</a>
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate max-w-[180px]">{otherDisplayName}</span>
              <span className="text-[10px] text-slate-500">{otherRole} · about this listing</span>
            </div>
          </div>
          <span className={`text-[10px] ${connected ? "text-emerald-400" : "text-slate-500"}`}>
            {connected ? "● Live" : "○ Connecting…"}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col px-4 py-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
            {itemImage ? (
              <img src={itemImage} alt={itemTitle} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500">No image</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold line-clamp-2">{itemTitle || "Listing"}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              {itemPrice !== null && <span className="font-semibold text-sky-300">€{itemPrice.toFixed(0)}</span>}
              {itemLocation && <span>{itemLocation}</span>}
            </div>
            <a href={`/marketplace/${itemId}`} className="mt-1 inline-flex text-[11px] text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline">View listing →</a>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-900/60 p-3 space-y-2">
          {loading ? (
            <p className="text-xs text-slate-400">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-400">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === currentUserId;
              const isTemp = m.id.startsWith("temp-");
              const time = new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-[12px] shadow-sm ${isMe ? "bg-slate-50 text-slate-900 rounded-br-sm" : "bg-slate-800 text-slate-50 rounded-bl-sm"} ${isTemp ? "opacity-60" : ""}`}>
                    <p className="text-[10px] mb-0.5 opacity-70">{isMe ? selfDisplayName : otherDisplayName}</p>
                    <p>{m.content}</p>
                    <p className="mt-1 text-[9px] opacity-60 text-right">{isTemp ? "Sending…" : time}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="mt-1 text-[11px] text-red-300 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-1">{error}</p>
        )}

        <form onSubmit={handleSend} className="mt-1 flex items-center gap-2 border border-slate-800 bg-slate-900/80 rounded-full px-3 py-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
          />
          <button type="submit" disabled={sending || !input.trim()} className="text-[11px] px-3 py-1.5 rounded-full bg-slate-50 text-slate-900 font-medium disabled:opacity-60">
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}
