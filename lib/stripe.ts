import Stripe from "stripe";

// Stripe SDK 22 throws at construction if no API key is provided, which
// breaks Next.js's "collect page data" build step on environments where
// STRIPE_SECRET_KEY isn't set yet (e.g. a fresh Vercel project). Lazy-init
// defers the constructor to first request, so the build always succeeds
// and the missing-key error only surfaces at runtime with a clear message.
let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured. Set it in .env.local for local dev, or in Vercel → Project Settings → Environment Variables for deployments."
      );
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}
