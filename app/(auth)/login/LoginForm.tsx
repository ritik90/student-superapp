"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300/40 border-t-slate-100"
      aria-hidden="true"
    />
  );
}

function IconMail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v9A3.5 3.5 0 0 1 16.5 20h-9A3.5 3.5 0 0 1 4 16.5v-9Z"
        className="stroke-current"
        strokeWidth="1.7"
      />
      <path
        d="M6.5 8.2 12 12.2l5.5-4"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7.5 11V8.5A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 4.5 4.5V11"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.5 11h11A2.5 2.5 0 0 1 20 13.5v4A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-4A2.5 2.5 0 0 1 6.5 11Z"
        className="stroke-current"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
        className="stroke-current"
        strokeWidth="1.7"
      />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconEye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
        className="stroke-current"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconEyeOff(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 5l18 14"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.3 9.2A3.5 3.5 0 0 1 15.2 13"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6 8.6C3.8 10.5 2.5 12 2.5 12s3.5 7 9.5 7c1.7 0 3.3-.5 4.7-1.2"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.7 15.8C21 13.7 21.5 12 21.5 12s-3.5-7-9.5-7c-1.2 0-2.4.2-3.4.6"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "error" | "info";
  children: React.ReactNode;
}) {
  const cls =
    tone === "error"
      ? "border-rose-700/70 bg-rose-950/40 text-rose-100"
      : "border-emerald-700/70 bg-emerald-950/40 text-emerald-100";

  return (
    <div className={`mb-4 rounded-2xl border px-3 py-2 text-xs ${cls}`}>
      {children}
    </div>
  );
}

function InputShell({
  label,
  icon,
  children,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-300">{label}</label>
        {hint ? <div className="text-[11px] text-slate-500">{hint}</div> : null}
      </div>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-sky-300">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // signup only
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // allowed college domains
  const allowedDomains = useMemo(
    () => [
      "tcd.ie",
      "ucd.ie",
      "dcu.ie",
      "student.ncirl.ie", // ✅ NCI student emails
      "ncirl.ie",
      "ul.ie",
      "mu.ie",
    ],
    []
  );

  const domain = useMemo(() => {
    const atIndex = email.lastIndexOf("@");
    if (atIndex === -1) return "";
    return email.slice(atIndex + 1).toLowerCase();
  }, [email]);

  const domainAllowed = useMemo(() => {
    if (!domain) return false;
    return allowedDomains.some((d) => d === domain);
  }, [allowedDomains, domain]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setCanResend(false);

    // 1) Domain check – only real college domains
    if (!domainAllowed) {
      setErrorMsg(
        "Please use your verified college email (e.g. @tcd.ie, @ucd.ie, @dcu.ie, @student.ncirl.ie)."
      );
      return;
    }

    // 2) Basic password rules
    if (!password || password.length < 6) {
      setErrorMsg("Please enter a password with at least 6 characters.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          const raw = error.message || "";
          const msg = raw.toLowerCase();

          if (
            msg.includes("email not confirmed") ||
            msg.includes("email_not_confirmed") ||
            msg.includes("unconfirmed") ||
            msg.includes("confirmation") ||
            msg.includes("confirm your email")
          ) {
            setErrorMsg("Your email is not verified.");
            setInfoMsg(
              `We sent a verification link to ${email}. Confirm it, then try logging in again. If you can't find it, use “Resend confirmation email”.`
            );
            setCanResend(true);
            return;
          }

          if (
            msg.includes("invalid login credentials") ||
            msg.includes("invalid email or password")
          ) {
            setErrorMsg("Invalid email or password.");
            return;
          }

          setErrorMsg(raw || "Login failed. Please check your details.");
          return;
        }

        router.push("/marketplace");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        const anyErr = error as any;

        if (
          anyErr?.message === "User already registered" ||
          anyErr?.code === "user_already_exists" ||
          anyErr?.code === "user_already_registered"
        ) {
          setErrorMsg("An account already exists. Please log in instead.");
          setMode("login");
          return;
        }

        setErrorMsg(error.message || "Sign up failed. Please try again.");
        return;
      }

      setInfoMsg(
        `We’ve sent a confirmation link to ${email}. Check your inbox (and spam), confirm your email, and then log in.`
      );
      setMode("login");
      setPassword("");
      setCanResend(true);
    } catch (err) {
      console.error("Auth exception:", err);
      setErrorMsg("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email) {
      setErrorMsg("Enter your email first so we know where to send it.");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setErrorMsg(
          error.message ||
            "Could not resend confirmation email. Please try again."
        );
        return;
      }

      setInfoMsg(
        `We’ve sent another confirmation link to ${email}. Check your inbox (and spam).`
      );
    } catch (err) {
      console.error("Resend confirmation error:", err);
      setErrorMsg("Unexpected error while resending. Please try again.");
    } finally {
      setResending(false);
    }
  }

  function switchMode(newMode: "login" | "signup") {
    setMode(newMode);
    setErrorMsg(null);
    setInfoMsg(null);
    setCanResend(false);
  }

  return (
    <div>
      {/* mode toggle */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`rounded-xl px-3 py-2 text-sm transition ${
            mode === "login"
              ? "bg-slate-900 text-slate-50 shadow"
              : "text-slate-300 hover:bg-slate-900/50"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`rounded-xl px-3 py-2 text-sm transition ${
            mode === "signup"
              ? "bg-slate-900 text-slate-50 shadow"
              : "text-slate-300 hover:bg-slate-900/50"
          }`}
        >
          Sign up
        </button>
      </div>

      {errorMsg && <Alert tone="error">{errorMsg}</Alert>}
      {infoMsg && <Alert tone="info">{infoMsg}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name – only for signup */}
        {mode === "signup" && (
          <InputShell
            label="Name"
            icon={<IconUser className="h-4 w-4" />}
            hint="Shown on listings"
          >
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-10 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="Your name"
              required
            />
          </InputShell>
        )}

        <InputShell
          label="College email"
          icon={<IconMail className="h-4 w-4" />}
          hint={
            email.length > 3 ? (
              <span
                className={`inline-flex items-center gap-1 ${
                  domainAllowed ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    domainAllowed ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                {domainAllowed ? "Verified domain" : "Not allowed"}
              </span>
            ) : (
              "College domain only"
            )
          }
        >
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-10 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            placeholder="you@tcd.ie"
            required
          />
        </InputShell>

        <InputShell
          label="Password"
          icon={<IconLock className="h-4 w-4" />}
          hint={mode === "signup" ? "Min 6 chars" : undefined}
        >
          <input
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-10 pr-12 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-slate-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <IconEyeOff className="h-4 w-4" />
            ) : (
              <IconEye className="h-4 w-4" />
            )}
          </button>
        </InputShell>

        {/* footer row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500/60" />
            <span>Only verified college emails</span>
          </div>

          {/* placeholder (future): forgot password */}
          <button
            type="button"
            className="text-xs text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
            onClick={() =>
              setInfoMsg(
                "Forgot password isn’t enabled yet. Tell me and I’ll add a Supabase reset flow."
              )
            }
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 hover:from-sky-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading
            ? mode === "login"
              ? "Signing in..."
              : "Creating account..."
            : mode === "login"
            ? "Login"
            : "Create account"}
        </button>
      </form>

      {/* Resend confirmation email */}
      {mode === "login" && canResend && (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center">
          <p className="text-[11px] text-slate-400">
            Didn’t get the verification email?
          </p>
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={resending}
            className="mt-1 text-[12px] font-medium text-sky-300 underline-offset-2 hover:underline disabled:opacity-60"
          >
            {resending ? "Resending..." : "Resend confirmation email"}
          </button>
        </div>
      )}

      {mode === "signup" && (
        <p className="mt-4 text-center text-[11px] text-slate-500">
          After sign up, we’ll email you a confirmation link. You must confirm
          your college email before logging in.
        </p>
      )}

      {/* small domains hint */}
      <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] text-slate-500">
        {[
          "tcd.ie",
          "ucd.ie",
          "dcu.ie",
          "student.ncirl.ie",
          "ncirl.ie",
          "ul.ie",
          "mu.ie",
        ].map((d) => (
          <span
            key={d}
            className={`rounded-full border px-2 py-1 ${
              domain === d
                ? "border-sky-700/70 bg-sky-950/30 text-sky-200"
                : "border-slate-800 bg-slate-950/40"
            }`}
          >
            @{d}
          </span>
        ))}
      </div>
    </div>
  );
}
