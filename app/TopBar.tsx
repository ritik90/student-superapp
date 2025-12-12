// app/TopBar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

type UserInfo = {
  id: string;
  email: string | null;
};

export default function TopBar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const isAuthRoute =
    pathname === "/login" || pathname?.startsWith("/(auth)/login");

  useEffect(() => {
    const supabase = supabaseBrowser();

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email ?? null,
      });
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session || !session.user) {
        setUser(null);
      } else {
        setUser({
          id: session.user.id,
          email: session.user.email ?? null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = supabaseBrowser();

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }

    setUser(null);

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  if (isAuthRoute) return null;

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 text-slate-100 px-4 py-2 flex items-center justify-between">
      <Link href="/marketplace" className="text-sm font-semibold">
        STUDENT HUB
      </Link>

      <nav className="hidden md:flex items-center gap-2 text-xs">
        <Link
          href="/marketplace"
          className={`rounded-full px-3 py-1 ${
            isActive("/marketplace")
              ? "bg-slate-800 text-slate-50"
              : "text-slate-300 hover:bg-slate-900"
          }`}
        >
          Marketplace
        </Link>
        <Link
          href="/marketplace/my"
          className={`rounded-full px-3 py-1 ${
            isActive("/marketplace/my")
              ? "bg-slate-800 text-slate-50"
              : "text-slate-300 hover:bg-slate-900"
          }`}
        >
          My listings
        </Link>
        <Link
          href="/marketplace/saved"
          className={`rounded-full px-3 py-1 ${
            isActive("/marketplace/saved")
              ? "bg-slate-800 text-slate-50"
              : "text-slate-300 hover:bg-slate-900"
          }`}
        >
          Saved
        </Link>
        <Link
          href="/chats"
          className={`rounded-full px-3 py-1 ${
            isActive("/chats")
              ? "bg-slate-800 text-slate-50"
              : "text-slate-300 hover:bg-slate-900"
          }`}
        >
          Inbox
        </Link>
        <Link
          href="/dashboard"
          className={`rounded-full px-3 py-1 ${
            isActive("/dashboard")
              ? "bg-slate-800 text-slate-50"
              : "text-slate-300 hover:bg-slate-900"
          }`}
        >
          Dashboard
        </Link>
      </nav>

      <div className="flex items-center gap-3 text-xs">
        {!loading && user && (
          <span className="hidden sm:inline truncate text-slate-300 max-w-[180px]">
            Logged in as{" "}
            <span className="font-medium text-sky-400">
              {user.email ?? "Unknown"}
            </span>
          </span>
        )}

        {!loading && !user && (
          <span className="text-slate-400">Not logged in</span>
        )}

        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-600 px-3 py-1 text-[11px] hover:bg-slate-800"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
