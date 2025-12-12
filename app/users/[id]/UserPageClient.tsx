// app/users/[id]/UserPageClient.tsx
"use client";

import Link from "next/link";

type Profile = {
  id: string;
  fullName: string | null;
  studentId: string | null;
  collegeDomain: string | null;
};

type Props = {
  userId: string;
  profile: Profile | null;
  totalListings: number;
};

export default function UserPageClient({ userId, profile, totalListings }: Props) {
  // Friendly name:
  // 1) fullName from profiles table
  // 2) fallback to "Student"
  const name =
    (profile?.fullName && profile.fullName.trim()) || "Student";

  const initial = name.charAt(0).toUpperCase();

  // Subtitle:
  // - Prefer student ID (if present)
  // - Else use "tcd.ie student" style from collegeDomain
  let subtitle = "Student";
  if (profile?.studentId) {
    subtitle = `Student ID: ${profile.studentId}`;
  } else if (profile?.collegeDomain) {
    subtitle = `${profile.collegeDomain} student`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/marketplace"
          className="text-xs text-slate-400 hover:text-sky-300"
        >
          ← Back to marketplace
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left: avatar + name */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-2xl font-semibold">
                {initial}
              </div>
              <div>
                <h1 className="text-xl font-semibold">{name}</h1>
                <p className="text-sm text-slate-400">{subtitle}</p>
              </div>
            </div>

            {/* Right: total listings */}
            <div className="text-right text-sm text-slate-300">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total listings
              </p>
              <p className="mt-0.5 text-lg font-semibold">{totalListings}</p>
            </div>
          </div>
        </div>

        {/* You can add a "User's listings" section below if you want */}
        {/* <section className="mt-6"> ... </section> */}
      </div>
    </div>
  );
}
