import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const ProductInput = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(1200).optional().default(""),
  sellPrice: z.number().min(1).max(999_999_999),
  costPrice: z.number().min(0).max(999_999_999).optional().default(0),
  stock: z.number().int().min(0).max(999_999).optional().default(0),
  active: z.boolean().optional().default(true),
  icon: z.string().trim().max(12).optional().default("🛍️"),
  images: z.array(z.string().url()).max(8).optional().default([]),
  sourceUrl: z.string().trim().max(500).optional().default(""),
});

const OrderInput = z.object({
  storeId: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.number().int().min(1).max(999),
  buyerName: z.string().trim().min(1).max(200),
  buyerPhone: z.string().trim().min(1).max(50),
  buyerEmail: z.string().trim().email().optional().or(z.literal("")),
  fulfillment: z.enum(["pickup", "delivery"]),
  address: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
  mode: z.enum(["advance", "whatsapp"]),
});

export const createVendorProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ProductInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (storeError) throw new Error(storeError.message);
    if (!store) throw new Error("Create your store before adding products.");

    const baseSlug = slugify(data.title) || `item-${Date.now()}`;
    let slug = baseSlug;
    for (let i = 0; i < 8; i += 1) {
      const { data: existing, error } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", store.id)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!existing) break;
      slug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        title: data.title,
        slug,
        description: data.description || null,
        sell_price: data.sellPrice,
        cost_price: data.costPrice,
        stock: data.stock,
        active: data.active,
        icon: data.icon,
        images: data.images,
        catalog: data.sourceUrl || null,
      })
      .select("id, slug")
      .single();

    if (error) throw new Error(error.message);
    return { product };
  });

export const createCheckoutOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => OrderInput.parse(input))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const authHeader = getRequest()?.headers?.get("authorization");
    let buyerId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token) {
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        buyerId = userData.user?.id ?? null;
      }
    }

    if (data.fulfillment === "delivery" && !data.address) {
      throw new Error("Delivery address is required.");
    }

    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("id,name,whatsapp")
      .eq("id", data.storeId)
      .maybeSingle();
    if (storeError) throw new Error(storeError.message);
    if (!store) throw new Error("This store is no longer available.");

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id,title,sell_price,stock,active")
      .eq("id", data.productId)
      .eq("store_id", data.storeId)
      .maybeSingle();
    if (productError) throw new Error(productError.message);
    if (!product || !product.active) throw new Error("This product is no longer available.");
    if ((product.stock ?? 0) < data.qty) throw new Error("Not enough units left in stock.");

    const total = Number(product.sell_price) * data.qty;
    const orderId = crypto.randomUUID();
    const paymentReference = data.mode === "advance" ? orderId : null;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        id: orderId,
        store_id: data.storeId,
        buyer_id: buyerId,
        buyer_name: data.buyerName,
        buyer_phone: data.buyerPhone,
        buyer_email: data.buyerEmail || null,
        items: [
          {
            product_id: product.id,
            title: product.title,
            qty: data.qty,
            price: Number(product.sell_price),
          },
        ],
        subtotal: total,
        total,
        fulfillment: data.fulfillment,
        address: data.fulfillment === "delivery" ? data.address : null,
        notes: data.notes || null,
        status: data.mode === "advance" ? "paid" : "pending",
        payment_ref: paymentReference,
      })
      .select("id, tracking_token, status, total")
      .single();

    if (orderError) throw new Error(orderError.message);

    if (data.mode === "advance") {
      const { error: paymentError } = await supabaseAdmin.from("payments").insert({
        order_id: order.id,
        amount: total,
        provider: "moniepoint",
        status: "success",
        reference: paymentReference,
        raw: { source: "checkout", mode: "advance" },
      });
      if (paymentError) throw new Error(paymentError.message);
    }

    const { error: stockError } = await supabaseAdmin
      .from("products")
      .update({
        stock: Math.max(0, Number(product.stock) - data.qty),
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (stockError) throw new Error(stockError.message);

    return { order, buyerId, store };
  });


export const getMyCommerceOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = typeof context.claims.email === "string" ? context.claims.email : "";

    let query = supabaseAdmin
      .from("orders")
      .select("id,status,total,created_at,tracking_token,items,store_id,buyer_email,buyer_id")
      .order("created_at", { ascending: false })
      .limit(100);

    query = email
      ? query.or(`buyer_id.eq.${context.userId},buyer_email.eq.${email}`)
      : query.eq("buyer_id", context.userId);

    const { data: orders, error } = await query;
    if (error) throw new Error(error.message);

    const storeIds = Array.from(new Set((orders ?? []).map((order) => order.store_id)));
    const { data: stores, error: storeError } = storeIds.length
      ? await supabaseAdmin.from("stores").select("id,name,slug").in("id", storeIds)
      : { data: [], error: null };

    if (storeError) throw new Error(storeError.message);
    const storesById = new Map((stores ?? []).map((store) => [store.id, store]));

    return {
      orders: (orders ?? []).map((order) => ({
        ...order,
        store: storesById.get(order.store_id) ?? null,
      })),
    };
  });