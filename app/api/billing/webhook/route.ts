import { NextRequest, NextResponse } from "next/server";
import { logBillingError, markCustomerAsFree, upsertSubscriptionFromStripe } from "@/lib/server/billing";
import {
  normalizeStripeId,
  retrieveStripeSubscription,
  verifyStripeWebhookSignature,
  type StripeCheckoutSession,
  type StripeSubscription,
  type StripeWebhookEvent,
} from "@/lib/server/stripe";

export const runtime = "nodejs";

async function handleCheckoutCompleted(session: StripeCheckoutSession) {
  const subscriptionId = normalizeStripeId(session.subscription);
  if (!subscriptionId) return;
  const subscription = await retrieveStripeSubscription(subscriptionId);
  await upsertSubscriptionFromStripe(subscription);
}

async function handleSubscriptionEvent(subscription: StripeSubscription) {
  await upsertSubscriptionFromStripe(subscription);
}

async function handleSubscriptionDeleted(subscription: StripeSubscription) {
  const customerId = normalizeStripeId(subscription.customer);
  if (!customerId) return;
  await markCustomerAsFree(customerId);
}

type StripeInvoiceLike = {
  subscription?: string | { id?: string } | null;
};

async function handleInvoiceEvent(invoice: StripeInvoiceLike) {
  const subscriptionId = normalizeStripeId(invoice.subscription);
  if (!subscriptionId) return;
  const subscription = await retrieveStripeSubscription(subscriptionId);
  await upsertSubscriptionFromStripe(subscription);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const payload = await req.text();
    const valid = verifyStripeWebhookSignature(payload, signature, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
    }

    const event = JSON.parse(payload) as StripeWebhookEvent;

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as StripeCheckoutSession);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionEvent(event.data.object as StripeSubscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as StripeSubscription);
        break;
      case "invoice.paid":
      case "invoice.payment_succeeded":
      case "invoice_payment.paid":
        await handleInvoiceEvent(event.data.object as StripeInvoiceLike);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    await logBillingError("Webhook handling failed", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
