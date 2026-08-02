# Login with Supabase — Setup

This app gates every page behind a **Supabase email + password login**.
Sessions are stored in cookies, so people stay logged in across reloads and
devices.

You only need to paste two values (`NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) — everything else is wired up in code.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project**.
2. Once it finishes provisioning, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Add the env vars

### Local
Copy `.env.local.example` to `.env.local`, paste your two keys, then:

```bash
npm install
npm run dev
```

### Vercel (production)
Project → **Settings → Environment Variables** → add both, then **redeploy**:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |

The login gate turns on automatically once the keys are present.

## 3. Create the database table

Games ("rooms") are saved to Postgres per user. Set up the table once:

1. In Supabase: **SQL Editor → New query**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, copy the
   whole file, paste it in, and click **Run**.

That creates a single `public.games` table with **Row Level Security**, so each
signed-in user can only see and edit their own games. You don't need any
extensions or a special database — the standard Postgres that every Supabase
project ships with is all it uses.

## 4. (Optional) Email settings

By default Supabase's **email/password** provider is already enabled — no extra
provider setup needed. A few settings worth knowing under
**Authentication → Providers → Email** and **Authentication → URL Configuration**:

- **Confirm email** (on by default): new sign-ups must click a link in their
  email before they can sign in. The app handles this — it shows
  "check your email" and the confirmation link returns to `/auth/callback`.
  Turn it **off** if you want instant sign-up with no email step.
- **Site URL:** set to your Vercel domain, e.g. `https://pokerthingo.vercel.app`
  (used as the base for confirmation links).
- **Redirect URLs:** add both so confirmation links are allowed to return:
  - `https://pokerthingo.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

---

## How it works

- `/login` — a standard email + password form with a Sign in / Create account
  toggle.
- `middleware.ts` refreshes the session on every request and redirects
  signed-out visitors to `/login` (and signed-in visitors away from it).
- `/auth/callback` handles the email-confirmation link (exchanges the code for
  a session).
- Until the env vars are set, the middleware lets everything through so the
  site still deploys — the login screen shows a "not configured yet" notice.
