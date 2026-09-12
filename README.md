# Hackathon Starter — Next.js + Supabase

A ready-to-go template: **Next.js (App Router) + TypeScript + Tailwind CSS** on the frontend, **Supabase** (Postgres + Auth) on the backend, both free tier. Comes with a working email sign-in flow and a demo database table so you can confirm everything's wired up before you start building your actual idea.

Click **"Use this template"** on GitHub to get your own copy, then follow the steps below.

## What's included

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase browser + server clients (`src/lib/supabase/`) using `@supabase/ssr`
- `src/proxy.ts` — refreshes the Supabase auth session on every request (Next.js 16's replacement for `middleware.ts`)
- Email OTP sign-in (`/login`) — enter your email, get a 6-digit code, sign in. No password, no OAuth app to register.
- A demo `todos` table (with Row Level Security enabled) that the homepage reads from, so you can see the DB connection working immediately
- `supabase/config.toml` — declarative project config, including the custom email template needed for step 4 below

## Setup (~10 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Create your own Supabase project

Every team needs its **own** Supabase project — don't share one.

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in (GitHub login is fastest).
2. **New project** → pick your org, name it, set a database password (save it somewhere), pick the region closest to you, and use the **Free** plan.
3. Wait ~1-2 minutes for it to finish provisioning.

### 3. Get your API keys and set up `.env.local`

```bash
cp .env.example .env.local
```

In your Supabase project dashboard, go to **Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` → "Project URL"
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → the `anon` `public` key
- `SUPABASE_SERVICE_ROLE_KEY` → the `service_role` key (**secret** — never expose this in client code, never commit it)

Paste all three into `.env.local`.

### 4. Turn on 6-digit sign-in codes

By default, Supabase's email sign-in sends a clickable **magic link**, not a code. This template's login page expects a **code**, so you need to swap the email template once per project:

1. In your Supabase dashboard: **Authentication → Emails → Magic Link**.
2. Set the subject to: `Your sign-in code`
3. Replace the body with the contents of [`supabase/templates/magic_link.html`](./supabase/templates/magic_link.html) in this repo — the important part is that it uses `{{ .Token }}` instead of `{{ .ConfirmationURL }}`.
4. Save.

That's it — no Google/GitHub developer account, no OAuth redirect URIs to configure. `supabase.auth.signInWithOtp()` + `supabase.auth.verifyOtp()` (already wired up in `src/app/login/`) handle the rest.

> **CLI alternative:** if you'd rather not click through the dashboard, you can apply this (and the demo table below) from the terminal:
> ```bash
> npx supabase login
> npx supabase link --project-ref <your-project-ref>   # find this in your Supabase project URL
> npx supabase config push --yes   # applies the email template from supabase/config.toml
> npx supabase db push --linked    # creates the demo todos table
> ```

### 5. Create the demo table (if you didn't use the CLI above)

In the Supabase dashboard, go to **SQL Editor**, paste the contents of the migration file in [`supabase/migrations/`](./supabase/migrations), and run it. This creates a `todos` table with RLS policies and two seed rows.

### 6. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see two seeded to-dos and a **Sign in** link. Go to `/login`, enter your email, and check your inbox for the code.

## Building your actual project

- Swap out the `todos` table/migration for your own schema — add new files under `supabase/migrations/`.
- The RLS policies on `todos` are wide open (public read + insert) purely so the demo works with no auth required. **Lock this down** once you have real data: scope policies to `auth.uid()` and require `to authenticated`. See the [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Need the current user in a Server Component/Route Handler? `import { createClient } from "@/lib/supabase/server"` then `await (await createClient()).auth.getUser()`.
- Need it in a Client Component? `import { createClient } from "@/lib/supabase/client"`.
- To require sign-in on a page, redirect in the page itself (see `src/app/login/page.tsx` for the pattern) — the proxy only refreshes the session, it doesn't gate routes.

## Deploying

Free-tier friendly options: [Vercel](https://vercel.com/new) (built for Next.js) or [Netlify](https://www.netlify.com/). Whichever you pick, set the same three environment variables from `.env.local` in its dashboard — the app won't connect to Supabase without them.

## Learn more

- [Next.js docs](https://nextjs.org/docs)
- [Supabase docs](https://supabase.com/docs)
- [Supabase Auth: Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)
