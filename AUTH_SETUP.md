# Google Sign-In with Supabase — Setup

This app gates every page behind **Sign in with Google**. Sessions are stored
in cookies by Supabase, so people stay logged in across reloads and devices.

You only need to paste two values (`NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) — everything else is wired up in code.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project**.
2. Once it finishes provisioning, open **Project Settings → API**.
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Enable Google as a provider

1. In Supabase: **Authentication → Providers → Google** → toggle **Enabled**.
2. You need a Google OAuth client:
   - Go to <https://console.cloud.google.com/apis/credentials>.
   - **Create Credentials → OAuth client ID → Web application**.
   - Under **Authorized redirect URIs**, add the callback URL that Supabase
     shows on the Google provider page. It looks like:
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client secret** back into Supabase and save.

## 3. Set the redirect / site URLs in Supabase

**Authentication → URL Configuration:**

- **Site URL:** your production Vercel URL, e.g. `https://pokerthingo.vercel.app`
- **Redirect URLs** — add both:
  - `https://pokerthingo.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

## 4. Add the env vars

### Local
Copy `.env.local.example` to `.env.local` and paste your two keys, then:

```bash
npm install
npm run dev
```

### Vercel (production)
Project → **Settings → Environment Variables** → add both:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |

Then **redeploy**. That's it — the login gate turns on automatically once the
keys are present.

---

## How it works

- `middleware.ts` refreshes the session on every request and redirects
  signed-out visitors to `/login` (and signed-in visitors away from it).
- `/login` shows the single **Sign in with Google** button.
- `/auth/callback` exchanges Google's OAuth code for a Supabase session.
- Until the env vars are set, the middleware lets everything through so the
  site still deploys — the login screen shows a "not configured yet" notice.
