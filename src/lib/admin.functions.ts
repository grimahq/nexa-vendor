import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Throws 403 unless the caller has the 'admin' role.
async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Response("Forbidden", { status: 403 });
}

async function audit(actorId: string, action: string, target_table?: string, target_id?: string, before?: unknown, after?: unknown) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("admin_audit_log").insert({
    actor_id: actorId, action, target_table, target_id,
    before: before as any, after: after as any,
  });
}

/* ============ OVERVIEW ============ */
export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [users, stores, products, orders, pendingKyc, revenueRows, recentOrders, activeSubs] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("stores").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("total"),
      supabaseAdmin.from("kyc_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("platform_revenue").select("amount, created_at").gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()),
      supabaseAdmin.from("orders").select("id, buyer_name, total, status, created_at").order("created_at", { ascending: false }).limit(10),
      supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    ]);

    const gmv = (orders.data || []).reduce((s, o: any) => s + Number(o.total || 0), 0);
    const mrr30 = (revenueRows.data || []).reduce((s, r: any) => s + Number(r.amount || 0), 0);

    return {
      userCount: users.count || 0,
      storeCount: stores.count || 0,
      productCount: products.count || 0,
      orderCount: (orders.data || []).length,
      pendingKyc: pendingKyc.count || 0,
      activeSubs: activeSubs.count || 0,
      gmv, mrr30,
      recentOrders: recentOrders.data || [],
    };
  });

/* ============ USERS ============ */
export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const rolesByUser = new Map<string, string[]>();
    (roles || []).forEach((r: any) => {
      const arr = rolesByUser.get(r.user_id) || [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    });
    return (users.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      banned_until: (u as any).banned_until ?? null,
      roles: rolesByUser.get(u.id) || [],
      full_name: (u.user_metadata as any)?.full_name ?? null,
    }));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "admin" | "buyer"; grant: boolean }) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["admin", "buyer"]), grant: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    }
    await audit(context.userId, data.grant ? "role.grant" : "role.revoke", "user_roles", data.userId, null, { role: data.role });
    return { ok: true };
  });

export const banUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; ban: boolean }) =>
    z.object({ userId: z.string().uuid(), ban: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.ban ? "876000h" : "none",
    } as any);
    await audit(context.userId, data.ban ? "user.ban" : "user.unban", "auth.users", data.userId);
    return { ok: true };
  });

/* ============ VENDORS ============ */
export const listAllVendors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("stores").select("*").order("created_at", { ascending: false });
    return data || [];
  });

export const updateStoreFlags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { storeId: string; suspended?: boolean; featured?: boolean; verified?: boolean }) =>
    z.object({ storeId: z.string().uuid(), suspended: z.boolean().optional(), featured: z.boolean().optional(), verified: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: any = {};
    if (data.suspended !== undefined) patch.suspended = data.suspended;
    if (data.featured !== undefined) patch.featured = data.featured;
    if (data.verified !== undefined) patch.verified = data.verified;
    await supabaseAdmin.from("stores").update(patch).eq("id", data.storeId);
    await audit(context.userId, "store.update", "stores", data.storeId, null, patch);
    return { ok: true };
  });

/* ============ KYC ============ */
export const listKycSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("kyc_submissions")
      .select("*, stores(name, slug, owner_id)")
      .order("created_at", { ascending: false });
    return data || [];
  });

export const runDojahVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { submissionId: string }) =>
    z.object({ submissionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isKycConfigured, verifyNinWithSelfie } = await import("./kyc-provider.server");
    if (!isKycConfigured()) {
      return { ok: false, error: "Dojah is not configured. Add DOJAH_APP_ID and DOJAH_SECRET_KEY." };
    }
    const { data: sub } = await supabaseAdmin.from("kyc_submissions").select("*").eq("id", data.submissionId).single();
    if (!sub) throw new Error("Submission not found");

    let selfieBase64: string | null = null;
    if (sub.selfie_url) {
      const { data: file } = await supabaseAdmin.storage.from("kyc-docs").download(sub.selfie_url);
      if (file) {
        const buf = Buffer.from(await file.arrayBuffer());
        selfieBase64 = buf.toString("base64");
      }
    }
    try {
      const result = await verifyNinWithSelfie({ nin: sub.nin, selfieBase64, firstName: sub.full_name.split(" ")[0], lastName: sub.full_name.split(" ").slice(1).join(" ") });
      const newStatus = result.matched ? "approved" : "pending";
      await supabaseAdmin.from("kyc_submissions").update({
        provider: "dojah",
        provider_ref: result.reference,
        provider_payload: result.raw,
        face_match_score: result.faceMatchScore,
        auto_decision: result.matched ? "approved" : "needs_review",
        status: newStatus as any,
      }).eq("id", data.submissionId);
      await audit(context.userId, "kyc.verify", "kyc_submissions", data.submissionId, null, { matched: result.matched, score: result.faceMatchScore });
      return { ok: true, matched: result.matched, score: result.faceMatchScore };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

export const decideKyc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { submissionId: string; decision: "approved" | "rejected"; notes?: string }) =>
    z.object({ submissionId: z.string().uuid(), decision: z.enum(["approved", "rejected"]), notes: z.string().max(2000).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("kyc_submissions").update({ status: data.decision as any, reviewer_notes: data.notes ?? null }).eq("id", data.submissionId);
    await audit(context.userId, `kyc.${data.decision}`, "kyc_submissions", data.submissionId);
    return { ok: true };
  });

/* ============ ORDERS / PAYMENTS ============ */
export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("orders").select("*, stores(name, slug)").order("created_at", { ascending: false }).limit(500);
    return data || [];
  });

export const listAllPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("payments").select("*, orders(buyer_name, store_id, stores(name))").order("created_at", { ascending: false }).limit(500);
    return data || [];
  });

/* ============ SUBSCRIPTIONS / PLANS ============ */
export const listAllSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("subscriptions").select("*, stores(name, slug), subscription_plans(name)").order("created_at", { ascending: false });
    return data || [];
  });

export const listPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("subscription_plans").select("*").order("sort_order");
    return data || [];
  });

export const upsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(80),
    slug: z.string().min(1).max(40).regex(/^[a-z0-9-]+$/),
    description: z.string().max(500).optional().nullable(),
    price_monthly: z.number().min(0),
    price_yearly: z.number().min(0),
    currency: z.string().max(8).default("NGN"),
    features: z.array(z.string()).default([]),
    max_products: z.number().int().nullable().optional(),
    commission_pct: z.number().min(0).max(100),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().default(0),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("subscription_plans").upsert(data as any).select().single();
    if (error) throw new Error(error.message);
    await audit(context.userId, data.id ? "plan.update" : "plan.create", "subscription_plans", row.id, null, row);
    return row;
  });

/* ============ REVENUE ============ */
export const getRevenueOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 90 * 86400_000).toISOString();
    const [rows, subs] = await Promise.all([
      supabaseAdmin.from("platform_revenue").select("*, stores(name)").gte("created_at", since).order("created_at", { ascending: false }),
      supabaseAdmin.from("subscriptions").select("status, subscription_plans(name, price_monthly)").eq("status", "active"),
    ]);
    const items = rows.data || [];
    // bucket by day
    const byDay = new Map<string, number>();
    items.forEach((r: any) => {
      const d = (r.created_at as string).slice(0, 10);
      byDay.set(d, (byDay.get(d) || 0) + Number(r.amount));
    });
    const series = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date, amount }));
    const totals = {
      commission: items.filter((r: any) => r.source === "commission").reduce((s, r: any) => s + Number(r.amount), 0),
      subscription: items.filter((r: any) => r.source === "subscription").reduce((s, r: any) => s + Number(r.amount), 0),
      total: items.reduce((s, r: any) => s + Number(r.amount), 0),
    };
    const mrr = (subs.data || []).reduce((s, sub: any) => s + Number(sub.subscription_plans?.price_monthly || 0), 0);
    return { items, series, totals, mrr };
  });

/* ============ COUPONS ============ */
export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
    return data || [];
  });

export const upsertCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid().optional(),
    code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/),
    description: z.string().max(200).optional().nullable(),
    percent_off: z.number().min(0).max(100).nullable().optional(),
    amount_off: z.number().min(0).nullable().optional(),
    max_redemptions: z.number().int().min(0).nullable().optional(),
    expires_at: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("coupons").upsert(data as any).select().single();
    if (error) throw new Error(error.message);
    await audit(context.userId, data.id ? "coupon.update" : "coupon.create", "coupons", row.id, null, row);
    return row;
  });

/* ============ ANNOUNCEMENTS ============ */
export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("announcements").select("*").order("created_at", { ascending: false });
    return data || [];
  });

export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(2000),
    audience: z.enum(["all", "vendors", "buyers"]),
    variant: z.enum(["info", "success", "warning"]).default("info"),
    is_active: z.boolean().default(true),
    ends_at: z.string().nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("announcements").upsert(data as any).select().single();
    if (error) throw new Error(error.message);
    await audit(context.userId, data.id ? "announcement.update" : "announcement.create", "announcements", row.id, null, row);
    return row;
  });

/* ============ AUDIT ============ */
export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(200);
    return data || [];
  });

/* ============ KYC CONFIG CHECK ============ */
export const getAdminConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { isKycConfigured } = await import("./kyc-provider.server");
    return {
      kycProvider: "dojah",
      kycConfigured: isKycConfigured(),
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    };
  });
