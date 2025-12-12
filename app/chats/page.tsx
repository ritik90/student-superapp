// app/chats/page.tsx
import Image from "next/image";
import ChatsClient from "./ChatsClient";

export default function ChatsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* ================= BACKGROUND BLUR ================= */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* Background image */}
        <Image
          src="/marketplace-collage.jpg"
          alt="Chats background"
          fill
          priority
          className="object-cover scale-110 blur-xl opacity-80"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />

        {/* Color glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_82%_22%,rgba(167,139,250,0.16),transparent_42%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.14),transparent_45%)]" />

        {/* Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.75)]" />
      </div>
      {/* =================================================== */}

      {/* ================= CONTENT ================= */}
      <main className="relative z-10 h-full">
        <ChatsClient />
      </main>
      {/* ============================================ */}
    </div>
  );
}
