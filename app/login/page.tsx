"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

function LoginCard() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Something went wrong. Please try again." : null
  );
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!data.session) {
        // Email confirmation is enabled — no session yet.
        setNotice("Check your email to confirm your account, then sign in.");
        setMode("signin");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    // Session cookie is set — full navigation lets the middleware take over.
    window.location.href = "/";
  }

  return (
    <div className="login-card">
      <div className="login-mark">♠</div>
      <h1 className="login-title">Frank's Poker Night</h1>
      <p className="login-sub">
        {mode === "signin"
          ? "Sign in to track buy-ins and settle up."
          : "Create an account to get started."}
      </p>

      {!isSupabaseConfigured ? (
        <div className="login-notice">
          Supabase isn&apos;t configured yet. Add{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment
          variables, then redeploy.
        </div>
      ) : (
        <>
          <form className="login-form" onSubmit={onSubmit}>
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button className="login-btn" type="submit" disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "signin"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          {notice && <p className="login-ok">{notice}</p>}
          {error && <p className="login-error">{error}</p>}

          <button
            className="text-btn login-switch"
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </>
      )}
    </div>
  );
}

export default function LoginScreen() {
  return (
    <div className="login">
      <Suspense fallback={<div className="login-card" />}>
        <LoginCard />
      </Suspense>
    </div>
  );
}
