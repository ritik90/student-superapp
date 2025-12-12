// app/chats/ChatsClient.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Conversation = {
  id: string;
  other_user_name?: string | null;
  other_user_email?: string | null;
  item_title?: string | null;
  last_message_preview?: string | null;
  last_message_at?: string | null; // this is what we *try* to use to sort
};

function Avatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
      <span className="text-xs text-slate-400">👤</span>
    </div>
  );
}

export default function ChatsClient() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // for NEW badge
  const [lastSeenForBadges, setLastSeenForBadges] = useState<number>(0);

  // 1) load logged-in user
  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const user = data?.user;
        if (user) setCurrentUserId(user.id);
      })
      .catch(() => {
        setCurrentUserId(null);
      });
  }, []);

  // 2) load conversations from /api/chats with SAFE JSON parsing
  useEffect(() => {
    async function loadChats() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/chats", { cache: "no-store" });
        const text = await res.text();

        let json: any = {};
        if (text.trim().length > 0) {
          try {
            json = JSON.parse(text);
          } catch (parseErr) {
            console.error(
              "[Chats] Could not parse JSON from /api/chats. Raw response:",
              text
            );
            throw new Error("Server returned invalid JSON for /api/chats");
          }
        }

        const raw: Conversation[] = Array.isArray(json.conversations)
          ? json.conversations
          : [];

        setConversations(raw);
      } catch (e: any) {
        console.error("[Chats] load error", e);
        setError(e?.message || "Failed to load chats.");
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  // 3) read + update last seen (shared with Marketplace inbox badge)
  useEffect(() => {
    if (!currentUserId) return;

    const key = `studenthub_last_chats_seen_${currentUserId}`;
    const stored = Number(localStorage.getItem(key) || 0);

    // we use this to decide what is NEW
    setLastSeenForBadges(stored);

    // mark now as seen so future messages count as new
    const now = Date.now();
    localStorage.setItem(key, String(now));
  }, [currentUserId]);

  // 4) sort conversations by last_message_at desc (if field exists)
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return tb - ta;
    });
  }, [conversations]);

  // 5) attach hasNew flag
  const conversationsWithNew = useMemo(
    () =>
      sortedConversations.map((c) => {
        let hasNew = false;

        if (lastSeenForBadges > 0 && c.last_message_at) {
          const t = new Date(c.last_message_at).getTime();
          hasNew = t > lastSeenForBadges;
        }

        return { ...c, hasNew };
      }),
    [sortedConversations, lastSeenForBadges]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border border-slate-700 border-t-sky-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading your conversations…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center">
        <div className="max-w-md rounded-2xl border border-rose-500/40 bg-rose-950/40 px-6 py-5 shadow-lg">
          <p className="text-sm font-semibold text-rose-300">
            Couldn&apos;t load chats
          </p>
          <p className="mt-1 text-xs text-rose-200/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <main className="mx-auto max-w-5xl px-4 py-6 pb-12">
        {/* HEADER */}
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-sky-400 uppercase mb-1">
              Inbox
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Your conversations
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Chat with buyers and sellers about listings on the Student Hub.
            </p>
          </div>
        </header>

        {/* EMPTY */}
        {conversationsWithNew.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950/70 px-6 py-10 flex flex-col items-center text-center">
            <p className="text-sm font-medium text-slate-200">
              No conversations yet
            </p>
            <p className="mt-2 text-xs text-slate-500 max-w-sm">
              Once you message a seller or buyer from a listing, your
              conversations will appear here.
            </p>
            <a
              href="/marketplace"
              className="mt-4 rounded-full bg-sky-600 px-4 py-2 text-xs font-medium hover:bg-sky-500"
            >
              Browse marketplace
            </a>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 divide-y divide-slate-800">
            {conversationsWithNew.map((c) => {
              const displayName =
                c.other_user_name || c.other_user_email || "Student";

              const lastTime = c.last_message_at
                ? new Date(c.last_message_at)
                : null;

              const timeLabel = lastTime
                ? lastTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <a
                  key={c.id}
                  href={`/chats/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900/90 transition-colors"
                >
                  <Avatar />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-slate-50">
                      {displayName}
                    </p>
                    {c.item_title && (
                      <p className="text-xs text-slate-500 truncate">
                        {c.item_title}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.last_message_preview || "Tap to view messages"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-500">
                      {timeLabel}
                    </span>
                    {c.hasNew && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-600 text-white">
                        NEW
                      </span>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
