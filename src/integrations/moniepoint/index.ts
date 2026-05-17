/**
 * Moniepoint integration (docs-only stub)
 *
 * NOTE: This is a placeholder until merchant credentials are provisioned.
 * Reference: https://moniepoint.com/ng/developer (Checkout & Sub-account APIs)
 *
 * Typical flow:
 *  1. Vendor adds their Moniepoint sub-account / business code in Settings.
 *  2. At checkout we build a hosted checkout URL with reference = order.id.
 *  3. Moniepoint redirects buyer back to /track/:token after payment.
 *  4. A webhook (POST /api/public/moniepoint-webhook) confirms the payment
 *     and updates payments.status + orders.status.
 *
 * When real keys arrive, wire MONIEPOINT_PUBLIC_KEY (client) and
 * MONIEPOINT_SECRET_KEY (server) via the secrets manager and replace
 * `buildCheckoutUrl` with the official SDK call.
 */

export type MoniepointCheckoutInput = {
  amount: number; // in NGN, major units
  reference: string; // typically order.id
  customer: { name: string; phone: string; email?: string };
  redirectUrl: string;
  merchantCode: string; // vendor's Moniepoint business / sub-account code
};

export function buildCheckoutUrl(input: MoniepointCheckoutInput): string {
  // Placeholder — official endpoint TBD when credentials are issued.
  const params = new URLSearchParams({
    amount: String(Math.round(input.amount * 100)),
    reference: input.reference,
    merchant: input.merchantCode,
    redirect: input.redirectUrl,
    customer_name: input.customer.name,
    customer_phone: input.customer.phone,
    ...(input.customer.email ? { customer_email: input.customer.email } : {}),
  });
  return `https://checkout.moniepoint.com/pay?${params.toString()}`;
}

export const moniepoint = {
  buildCheckoutUrl,
  docs: "https://moniepoint.com/ng/developer",
};
