"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/GoogleIcon";

function LoginCard() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Sign-in failed. Please try again." : null
  );

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success the browser navigates away to Google — no further work here.
  }

  return (
    <div className="login-card">
      <div className="login-mark">♠</div>
      <h1 className="login-title">Poker Night</h1>
      <p className="login-sub">
        Track buy-ins, cash-outs and settle up with your table.
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
          <button
            className="google-btn"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <GoogleIcon />
            {loading ? "Redirecting…" : "Sign in with Google"}
          </button>
          {error && <p className="login-error">{error}</p>}
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
