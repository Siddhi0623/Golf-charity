import "server-only";
import type { SubPlan } from "@/types/domain";

/**
 * Payment provider abstraction. The MVP ships with `MockPaymentProvider` which
 * succeeds instantly and returns a synthetic payment ID. When Stripe is wired
 * up, drop in `StripePaymentProvider` (same interface) and the rest of the app
 * doesn't change.
 */

export type CheckoutInput = {
  userId: string;
  email: string;
  plan: SubPlan;
  /** Major-units amount, e.g. 9.99 */
  amount: number;
  /** Where the user should land after a successful checkout. */
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutResult = {
  paymentId: string;
  /** URL to redirect to. For the mock provider, this is the success URL. */
  redirectUrl: string;
};

export interface PaymentProvider {
  readonly id: "mock" | "stripe";
  startCheckout(input: CheckoutInput): Promise<CheckoutResult>;
}

class MockPaymentProvider implements PaymentProvider {
  readonly id = "mock" as const;

  async startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const paymentId = `mock_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    // Forward to success immediately; the route handler that started checkout
    // is responsible for inserting the subscription row.
    return { paymentId, redirectUrl: input.successUrl };
  }
}

let _provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (_provider) return _provider;
  // Swap to StripePaymentProvider here when ready.
  _provider = new MockPaymentProvider();
  return _provider;
}
