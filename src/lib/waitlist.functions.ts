import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WaitlistSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  business_type: z.string().trim().max(60).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => WaitlistSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("waitlist").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      business_type: data.business_type || null,
      note: data.note || null,
      source: "landing",
    });
    if (error) {
      if (error.code === "23505") {
        return { ok: true, duplicate: true as const };
      }
      throw new Error(error.message);
    }
    return { ok: true, duplicate: false as const };
  });
