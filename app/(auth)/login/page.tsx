// app/(auth)/login/page.tsx
import Image from "next/image";
import LoginForm from "./LoginForm";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-950/70 px-2.5 py-1 text-[11px] text-slate-200">
      {children}
    </span>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-50">
      {/* ===== BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0">
        {/* BLURRED COLLAGE IMAGE */}
        <Image
          src="/login-collage.jpg"
          alt="Background"
          fill
          priority
          className="object-cover scale-110 blur-xl opacity-150"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />

        {/* COLOR GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.22),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(167,139,250,0.20),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.15),transparent_45%)]" />

        {/* VIGNETTE */}
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.75)]" />
      </div>

      {/* ===== CONTENT ===== */}
      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[1.15fr,0.85fr]">
          {/* LEFT SIDE */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 text-[11px] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live • Student-to-student marketplace
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
                One place for{" "}
                <span className="bg-gradient-to-r from-sky-400 to-violet-300 bg-clip-text text-transparent">
                  student deals, notes & rentals
                </span>
                .
              </h1>

              <p className="max-w-xl text-sm md:text-base text-slate-300/80">
                Buy and sell laptops, bikes, rooms, notes and more — securely
                with verified college emails only.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <Badge>Verified college emails</Badge>
                <Badge>No spam accounts</Badge>
                <Badge>Student-first UI</Badge>
              </div>
            </div>

            <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Trending today
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  {[
                    ["MacBook Air", "€650"],
                    ["Room near campus", "€900"],
                    ["Study notes", "€15"],
                  ].map(([label, price]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-slate-100">{label}</span>
                      <span className="font-semibold text-sky-300">
                        {price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Verified colleges
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                  {["🎓 TCD", "🎓 UCD", "🎓 DCU", "🎓 NCI", "+ more"].map((x) => (
                    <span
                      key={x}
                      className="rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-200"
                    >
                      {x}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[12px] text-slate-400">
                  Only students with valid college domains can create accounts.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Tip: Use your college email to access listings and contact sellers.
            </p>
          </div>

          {/* RIGHT SIDE (LOGIN CARD) */}
          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-to-br from-sky-500/20 via-transparent to-violet-500/20 blur-3xl opacity-70" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-black/40">
              <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500 opacity-70" />

              <div className="p-6 sm:p-7">
                <div className="mb-6 space-y-2 text-center">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Ireland · Student Marketplace
                  </p>
                  <h2 className="text-2xl font-semibold">Welcome back</h2>
                  <p className="text-sm text-slate-400">
                    Sign in with your college email to continue.
                  </p>
                </div>

                <LoginForm />

                <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[11px] text-slate-400">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 py-2">
                    Secure auth
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 py-2">
                    Verified users
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 py-2">
                    Fast listings
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] text-slate-500">
              By continuing, you agree to use the platform responsibly and
              respect student privacy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
