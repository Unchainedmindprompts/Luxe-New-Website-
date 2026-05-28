import Stripe from "stripe";

// The Stripe SDK bundles a pinned API version, and Stripe SDK 22 narrows
// the apiVersion field to that exact literal. We omit it so the SDK uses
// its bundled version automatically — this matches Stripe's recommendation
// and avoids churn when the SDK is upgraded. To override, pass
// { apiVersion: '<currently-supported-version>' } here.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
