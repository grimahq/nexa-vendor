// Dojah KYC provider client. Server-only.
// Gracefully reports "not configured" if env keys are missing so the
// admin queue still functions with manual review.

const BASE = "https://api.dojah.io";

function getKeys() {
  const appId = process.env.DOJAH_APP_ID;
  const secret = process.env.DOJAH_SECRET_KEY;
  if (!appId || !secret) return null;
  return { appId, secret };
}

export function isKycConfigured() {
  return getKeys() !== null;
}

async function dojahPost(path: string, body: Record<string, unknown>) {
  const keys = getKeys();
  if (!keys) throw new Error("Dojah is not configured. Add DOJAH_APP_ID and DOJAH_SECRET_KEY.");
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "AppId": keys.appId,
      "Authorization": keys.secret,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* keep raw */ }
  if (!res.ok) {
    throw new Error(`Dojah ${path} failed (${res.status}): ${json?.error || text.slice(0, 200)}`);
  }
  return json ?? {};
}

export type KycLookupResult = {
  matched: boolean;
  faceMatchScore: number | null;
  raw: any;
  reference: string;
};

// Verify a NIN and optionally face-match a selfie image (base64, no data URL prefix).
export async function verifyNinWithSelfie(input: {
  nin: string;
  selfieBase64?: string | null;
  firstName?: string;
  lastName?: string;
}): Promise<KycLookupResult> {
  const body: Record<string, unknown> = { nin: input.nin };
  if (input.selfieBase64) body.selfie_image = input.selfieBase64;
  if (input.firstName) body.first_name = input.firstName;
  if (input.lastName) body.last_name = input.lastName;

  const data = await dojahPost("/api/v1/kyc/nin/verify", body);
  const entity = data?.entity ?? data?.data ?? data;
  const score = Number(entity?.selfie_verification?.confidence_value ?? entity?.match?.confidence_value ?? 0) || null;
  const matched = score !== null ? score >= 70 : false;
  const reference = entity?.reference_id || entity?.tracking_id || crypto.randomUUID();
  return { matched, faceMatchScore: score, raw: data, reference };
}
