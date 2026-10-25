# Luminate Creators

Equipment shop for Nigerian content creators. React + Vite frontend (hosted on
Vercel), Supabase backend (Postgres, Auth, Storage, Edge Functions), Paystack
payments and Resend email.

## Local development

```sh
npm install
cp .env.example .env   # fill in your Supabase URL and anon key
npm run dev            # http://localhost:8080
```

## Backend setup (new Supabase project)

Everything the backend needs lives in `supabase/`:

- `migrations/` — full database schema, row-level security policies, triggers
  and the `product-images` storage bucket, applied in filename order.
- `functions/` — Edge Functions: `paystack-initialize`, `paystack-verify`,
  `paystack-webhook`, `send-order-email`, `send-contact-email`,
  `send-admin-alert`, `send-newsletter-welcome`, `send-coin-receipt`.

With the [Supabase CLI](https://supabase.com/docs/guides/cli):

```sh
supabase login
supabase link --project-ref <your-project-ref>   # also set project_id in supabase/config.toml
supabase db push                                  # applies every migration
supabase functions deploy                         # deploys all Edge Functions
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_... RESEND_API_KEY=re_...
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided
to Edge Functions automatically.

Then in the Supabase dashboard:

1. **Authentication → URL Configuration**: set *Site URL* to your Vercel domain
   and add `https://<your-domain>/**` to *Redirect URLs* (needed for email
   confirmation and password reset links).
2. **Paystack dashboard → Settings → API Keys & Webhooks**: set the webhook URL
   to `https://<your-project-ref>.supabase.co/functions/v1/paystack-webhook`.

### Making yourself an admin

Sign up on the site, then run this in the Supabase SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
ON CONFLICT DO NOTHING;
```

## Deploying the frontend (Vercel)

1. Import this GitHub repository in Vercel. The framework (Vite), build command
   and SPA routing come from `vercel.json`.
2. Add environment variables (Production and Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (the project's anon public key)
   - `VITE_SUPABASE_PROJECT_ID`
3. Deploy. Redeploy after changing environment variables — they are baked in at
   build time.
