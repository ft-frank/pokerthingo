"use client";

import { useAuth } from "@/lib/auth";

/**
 * Compact avatar + sign-out control for the app header.
 * Renders nothing until we know who (if anyone) is signed in.
 */
export function UserMenu() {
  const { user, loading, signOut } = useAuth();

  if (loading || !user) return null;

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Signed in";
  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="user-menu">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="user-avatar" src={avatar} alt={name} />
      ) : (
        <div className="user-avatar user-avatar-fallback">{initial}</div>
      )}
      <button className="text-btn" onClick={signOut} title={name}>
        Sign out
      </button>
    </div>
  );
}
