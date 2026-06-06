# Super Admin Panel — Proposal

A dedicated, role-gated admin area at `/admin/*` with its own layout, navigation, and analytics. Separated from the vendor dashboard so it can scale into a full operations console.

## 1. Access & Security

- New role: `superadmin` (added to `app_role` enum alongside existing `admin`, `buyer`).
- Pathless layout `src/routes/_admin/route.tsx` — `ssr: false`, redirects non-admins to `/dashboard`.
- All admin queries via `createServerFn` + `requireSupabaseAuth` + `has_role(uid, 'superadmin')` check (never client-only gating).
- Audit log table `admin_audit_log` records every action (who, what, target, before/after, IP).

## 2. Routes / Modules

```
/admin                  -> Overview (KPIs: GMV, MRR, active vendors, pending KYC)
/admin/users            -> All users; search, ban, impersonate, reset password
/admin/vendors          -> Stores list; verify, suspend, feature, edit
/admin/kyc              -> Real KYC queue (replaces current /admin/kyc)
/admin/orders           -> All orders across platform; refund, dispute
/admin/payments         -> Transactions, payouts, reconciliation
/admin/subscriptions    -> Plans, subscribers, churn, manual overrides
/admin/revenue          -> Income dashboard: fees, commissions, MRR charts
/admin/plans            -> CRUD subscription plans (price, features, limits)
/admin/coupons          -> Promo codes & discounts
/admin/announcements    -> Broadcast banners to vendors/buyers
/admin/audit-log        -> Full action history
/admin/settings         -> Platform fees, KYC provider keys, feature flags
```

## 3. Real KYC Verification (Nigeria)

Replace the manual NIN text field with a verified lookup. Recommended providers (pick one):

| Provider | What it verifies | Notes |
|---|---|---|
| **Dojah** | NIN, BVN, CAC, driver's license, voter ID, selfie liveness | NG-focused, popular, sandbox available |
| **Smile ID** | NIN, BVN, biometric face match | Pan-African, strong liveness |
| **Prembly (Identitypass)** | NIN, BVN, CAC, address | NG-focused, broad coverage |
| **Youverify** | NIN, BVN, AML screening | Enterprise-leaning |

Flow:
1. Vendor enters NIN + uploads selfie in onboarding.
2. Server fn calls provider → returns name, DOB, photo from official source.
3. Face-match selfie vs official photo (provider returns confidence score).
4. Auto-approve if score ≥ threshold; else queue for manual super-admin review.
5. Result + raw provider payload stored in `kyc_submissions.provider_payload`.

I'll wire Dojah by default (cheapest sandbox, NG-first). Requires `DOJAH_APP_ID` + `DOJAH_SECRET_KEY` secrets.

## 4. Subscriptions & Revenue

New tables:
- `subscription_plans` (name, price_monthly, price_yearly, features jsonb, max_products, commission_pct)
- `subscriptions` (store_id, plan_id, status, current_period_end, provider_ref)
- `platform_revenue` (source: 'commission'|'subscription', order_id?, amount, fee, created_at)

Revenue dashboard shows: MRR, ARR, commission earned, active subs by plan, churn rate, top-earning vendors. Powered by server-side aggregates.

Subscription billing via **Paddle** or **Stripe** (you choose — Paddle handles VAT/MoR globally; Stripe is more flexible). Webhook at `/api/public/billing-webhook` updates subscription status.

## 5. Tech Details

- New migration: add `superadmin` to `app_role`, create `admin_audit_log`, `subscription_plans`, `subscriptions`, `platform_revenue`, `coupons`, `announcements`; extend `kyc_submissions` with `provider`, `provider_ref`, `provider_payload jsonb`, `face_match_score`.
- Server functions in `src/lib/admin.functions.ts` (all gated by superadmin check).
- KYC provider client in `src/lib/kyc-provider.server.ts`.
- Charts via `recharts` (already available through shadcn `chart.tsx`).
- Admin layout: collapsible sidebar with sections grouped (Operations, Finance, Growth, System).

## Questions before I build

1. **KYC provider**: Dojah (recommended), Smile ID, or Prembly? I'll need API keys for whichever you pick.
2. **Subscription billing**: Paddle or Stripe? Or skip billing integration for now and just track plans manually?
3. **First super-admin**: which email should I promote to `superadmin` on migration? (Your account email.)
4. **Scope for this round**: build the full module set above, or start with `Overview + Users + Vendors + Real KYC + Revenue` and add Subscriptions/Coupons/Announcements next?

Once you answer these I'll create the migration, request the secrets, and implement.
