# Running TheNerdLoop locally

## 1. Install

```bash
npm install
```

Make sure these are present in `package.json` (added during this integration):
`@supabase/supabase-js`, `@supabase/ssr`, `@aws-sdk/client-s3`,
`@aws-sdk/s3-request-presigner`, `razorpay`, `server-only`.

## 2. Environment variables

Copy `.env.local.example` → `.env.local` and fill in real values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

Never commit `.env.local`. `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET`
bypass all app-level security — server-only, never prefixed `NEXT_PUBLIC_`.

## 3. Database

Run these in the Supabase SQL editor, in order, once per project:

```
supabase/migrations/001_tnl_schema.sql
supabase/migrations/002_products_extra_fields.sql
supabase/migrations/003_create_order_function.sql
supabase/migrations/004_orders_require_user.sql
```

Then seed the catalog from the old static data:

```bash
npx tsx scripts/migrate-catalog.ts
```

## 4. Cloudflare R2

- Create a **private** bucket, name it to match `R2_BUCKET_NAME`.
- Add a CORS policy on the bucket (Settings → CORS Policy):
  - Allowed Origins: `http://localhost:3000` (add your ngrok/prod URLs when testing those)
  - Allowed Methods: `GET`, `PUT`
  - Allowed Headers: `content-type` (or `*` while developing)

## 5. Google OAuth (Supabase Auth)

- Google Cloud Console → OAuth consent screen + OAuth Client ID (Web application)
- Supabase → Authentication → Providers → Google → paste Client ID/Secret
- Supabase → Authentication → URL Configuration:
  - **Site URL**: your primary domain (e.g. `http://localhost:3000` for now)
  - **Redirect URLs**: add every origin you'll actually test from, each with
    `/auth/callback` appended, e.g.:
    - `http://localhost:3000/auth/callback`
    - `https://<your-ngrok-subdomain>.ngrok-free.dev/auth/callback` (if tunneling)
    - `https://thenerdloopcomsite.vercel.app/auth/callback`

  Supabase silently falls back to Site URL + an error if the redirect target
  isn't in this list — it must match exactly, protocol and path included.

## 6. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 7. Testing Razorpay locally (needs a tunnel)

Razorpay's webhook must reach your machine over the public internet — `localhost`
won't work for that one piece.

```bash
ngrok http 3000
```

- Copy the `https://...ngrok-free.dev` URL it gives you.
- Add `<that-url>/auth/callback` to Supabase's Redirect URLs (step 5) —
  needed if you're browsing via the ngrok URL, since Google auth also
  round-trips through it.
- Razorpay Dashboard (Test Mode) → Settings → Webhooks → Add Webhook:
  - URL: `<that-url>/api/webhooks/razorpay`
  - Secret: anything random — paste the same value into `RAZORPAY_WEBHOOK_SECRET`
  - Events: `payment.captured`, `payment.failed`, `refund.processed`
- Browse the site via the **ngrok URL**, not `localhost:3000`, while testing
  a payment, so the webhook can actually round-trip.
- Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

ngrok's free tier issues a new random subdomain every restart — re-add it to
both Supabase Redirect URLs and the Razorpay webhook URL each time it changes,
or add `allowedDevOrigins` in `next.config.ts` if you hit cross-origin dev
warnings.

## Known local-only gotchas

- **Next.js 16 uses `proxy.ts`**, not `middleware.ts` — if you ever regenerate
  this file, name it `proxy.ts` and export `proxy`, not `middleware`.
- **Firefox's HTTPS-Only Mode** will break plain `http://localhost:3000` —
  disable it or add an exception if you hit a "Secure Connection Failed" error.
- Product images stay local (`public/cards/...`) — R2 is only used for
  customer-uploaded personalization photos, not catalog images.