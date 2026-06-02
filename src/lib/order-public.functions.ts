import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TrackingInput = z.object({
  token: z.string().min(16).max(80).regex(/^[a-zA-Z0-9_-]+$/),
});

export const getPublicOrderReceipt = createServerFn({ method: "GET" })
  .inputValidator((input) => TrackingInput.parse(input))
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id,status,total,fulfillment,address,buyer_name,items,created_at,store_id")
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
    return { order: { ...order, store: store ?? null } };
  });