"use client";

export default function BlurBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#05070d] text-slate-100">
      {/* Background glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-[150px]" />
        <div className="absolute top-40 -right-40 h-[620px] w-[620px] rounded-full bg-fuchsia-500/15 blur-[170px]" />
        <div className="absolute -bottom-56 left-1/3 h-[560px] w-[560px] rounded-full bg-emerald-500/10 blur-[170px]" />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-black/40 to-black" />
      </div>

      {/* Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
