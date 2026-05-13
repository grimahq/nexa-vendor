# Nexa Vendors — Build Plan

A WhatsApp-first commerce platform for Nigerian online sellers. Vendors set up a branded micro-store, share product links with strong CTAs, accept payments (Moniepoint), manage orders, and follow up clients on WhatsApp. Buyers can browse, like, follow, comment, and track orders — accounts are optional.

## 1. Scope (v1)

**Vendor side**
- Sign up / sign in (email + Google)
- Brand setup: name, logo, tagline, WhatsApp number, category, brand color
- Products: title, description, images, icon/SVG, cost price, selling price, auto-calculated profit, stock, catalog/category
- Per-product unique shareable link with auto-generated CTA copy and animated +/- quantity selector
- Orders dashboard (real-time): new, paid, fulfilled, cancelled
- Customer list with WhatsApp follow-up (one-tap message templates)
- Receipts (auto-generated, downloadable + WhatsApp-shareable)
- Settings: delivery/pickup, payout details, KYC

**Buyer side**
- Browse store landing page (vendor's mini-site)
- Like, comment, follow store (requires account)
- Place order as guest OR logged in — pickup or delivery
- Order tracking via temporary signed link (no account needed) or account history
- Payment via Moniepoint link (stubbed for now)

**Nexa company side**
- Landing page: hero, pain points, features, FAQ, live feed of recent vendor signups (logo + name), category leaderboards
- Verified badge (post-KYC review)

## 2. Tech & Architecture

```text
Frontend:  TanStack Start (already set up) + Tailwind + shadcn/ui
Motion:    framer-motion for 3D cards, +/- animation, page transitions
Backend:   Lovable Cloud (Supabase) — auth, DB, storage, RLS
Payments:  Moniepoint (stubbed endpoint now, real API when creds arrive)
Realtime:  Supabase Realtime for orders dashboard + live signup feed
WhatsApp:  wa.me deep links for follow-ups & receipt sharing
```

### Database tables
- `profiles` (auth.users link, full_name, role: vendor|buyer|admin)
- `stores` (owner_id, slug, name, logo_url, tagline, whatsapp, brand_color, category, verified, kyc_status)
- `products` (store_id, title, description, images[], icon, cost_price, sell_price, stock, catalog, slug)
- `orders` (store_id, buyer_id?, items jsonb, total, fulfillment: pickup|delivery, address, status, payment_ref, tracking_token)
- `order_events` (order_id, type, note) — for tracking timeline
- `payments` (order_id, provider: moniepoint, amount, status, raw jsonb)
- `follows` (buyer_id, store_id)
- `likes` (buyer_id, product_id)
- `comments` (product_id, buyer_id, body)
- `kyc_submissions` (store_id, doc_url, status, reviewer_notes)
- `user_roles` (user_id, role app_role) — separate table per security rules

RLS on every table. Vendors see only their store data; buyers see only their orders/likes; landing page reads use a public view of stores (id, name, logo, verified).

### Routes
```text
/                          Nexa landing (public)
/login, /signup            Auth
/onboarding                Brand setup wizard
/_authenticated/dashboard  Vendor: orders + KPIs (realtime)
/_authenticated/products   Vendor: list/create/edit
/_authenticated/orders     Vendor: full orders table
/_authenticated/customers  Vendor: client list + WhatsApp followup
/_authenticated/settings   Brand, payouts, KYC
/s/$slug                   Public store landing page
/s/$slug/p/$productSlug    Public product page (CTA, +/- selector, buy)
/track/$token              Guest order tracking
/_authenticated/me/orders  Buyer order history
/_authenticated/me/feed    Buyer feed (followed stores)
/admin/kyc                 Admin: verify badges
api/public/moniepoint/webhook   Payment callback (signature-verified)
```

## 3. Phased Delivery

I'll build in this order so each phase is usable on its own:

1. **Foundation** — Enable Lovable Cloud, schema + RLS, auth (email + Google), design system (Nexa palette, motion utilities, 3D card primitives).
2. **Vendor core** — Onboarding wizard, brand, products CRUD with image upload, profit calc, public store page + product page with animated +/- CTA.
3. **Orders & payments (stubbed)** — Checkout flow, orders dashboard with realtime, Moniepoint stub (mock payment link + manual "mark paid"), receipt generation, WhatsApp share.
4. **Buyer side** — Optional buyer auth, like/comment/follow, guest tracking link, buyer order history.
5. **Nexa landing + KYC + admin** — Marketing landing with live signup ticker, FAQ, leaderboards, KYC submission, admin verification, verified badge everywhere.

## 4. Design

Nexa-branded, dark-leaning premium UI with 3D illustration accents and flow motion. Distinctive type pairing (display + clean sans). Bold copy on CTAs ("Lock it in" / "Add to cart" with animated counter). Glassmorphism on product cards, soft 3D blob backgrounds, framer-motion stagger on grids. Semantic tokens only (no hardcoded colors). I'll commit to one direction since you chose "just build it".

## 5. Open items I'll handle as defaults (tell me to change any)
- Payments: stub now, swap to real Moniepoint when you share docs/keys
- KYC docs: NIN + selfie + business proof, stored in private bucket, manually reviewed by admin role
- WhatsApp: `wa.me` links (no Business API integration in v1)
- Receipt: HTML → PDF via client-side render
- "Brand assets" — I'll generate placeholder Nexa logo/marks unless you upload yours

When you approve, I'll start with Phase 1.
