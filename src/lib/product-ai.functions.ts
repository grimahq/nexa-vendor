import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ProductDescriptionInput = z.object({
  title: z.string().min(2).max(120),
  category: z.string().max(80).optional().default(""),
  sourceUrl: z.string().url().optional().or(z.literal("")),
});

function isSafeSourceUrl(value: string) {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  const isPrivateIp = /^(10\.|127\.|169\.254\.|192\.168\.|0\.)/.test(hostname)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    || hostname === "::1";
  return ["http:", "https:"].includes(url.protocol)
    && hostname !== "localhost"
    && !isPrivateIp
    && !hostname.endsWith(".local");
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2400);
}

export const generateProductDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ProductDescriptionInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI description generator is not configured yet.");

    let sourceText = "";
    if (data.sourceUrl && isSafeSourceUrl(data.sourceUrl)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(data.sourceUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (response.ok) sourceText = stripHtml(await response.text());
      } catch {
        sourceText = "";
      }
    }

    const prompt = [
      "Write a premium WhatsApp-store product description for Nigerian buyers.",
      "Keep it short, direct, trustworthy, and sales-ready. No markdown. No hashtags.",
      `Product: ${data.title}`,
      data.category ? `Category: ${data.category}` : "",
      sourceText ? `Source page notes: ${sourceText}` : "",
      "Return 2 polished sentences plus one concise benefit line.",
    ].filter(Boolean).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error("AI description generation failed. Please try again.");
    const json = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const description = json.choices?.[0]?.message?.content?.trim();
    if (!description) throw new Error("AI could not generate a description for this product.");
    return { description: description.slice(0, 700), sourceUsed: Boolean(sourceText) };
  });