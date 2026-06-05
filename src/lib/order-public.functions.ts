import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TrackingInput = z.object({
  token: z.string().min(16).max(80).regex(/^[a-zA-Z0-9_-]+$/),
});

export const getPublicOrderReceipt = createServerFn({ method: "GET" })
  .inputValidator((input) => TrackingInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id,status,total,fulfillment,address,buyer_name,items,created_at,store_id,payment_ref")
      .eq("tracking_token", data.token)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!order) return { order: null };

    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("name,slug,whatsapp,logo_url")
      .eq("id", order.store_id)
      .maybeSingle();

    if (storeError) throw new Error(storeError.message);

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("provider,status,reference,amount,created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError) throw new Error(paymentError.message);
    return { order: { ...order, store: store ?? null, payment: payment ?? null } };
  });