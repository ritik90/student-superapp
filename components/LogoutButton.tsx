// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[11px] px-3 py-1.5 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-900"
    >
      Logout
    </button>
  );
}
