import { db } from "@/lib/db";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed: ", error);
    return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const priceId = session.metadata?.priceId;

        if (userId && priceId) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await db.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(
                subscription.items.data[0].current_period_end * 1000
              ),
              plan: priceId === "premium" ? "premium" : "pro",
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          // Get the current price ID from the subscription
          const currentPriceId = subscription.items.data[0]?.price?.id;
          let planType: "free" | "premium" | "pro" = "free";

          if (subscription.status === "active" && currentPriceId) {
            // Map price ID to plan type dynamically
            const priceIdMap = Object.entries(STRIPE_PRICE_IDS).find(
              ([, priceId]) => priceId === currentPriceId
            );
            planType = (priceIdMap?.[0] as "premium" | "pro") || "free";
          }

          await db.user.update({
            where: { id: user.id },
            data: {
              stripeCurrentPeriodEnd: new Date(
                subscription.items.data[0].current_period_end * 1000
              ),
              plan: planType,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          // You might want to send an email notification here
          console.log(`Payment failed for user ${user.id}`);
          // Optionally update user status or send notification
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        // Access subscription safely - it exists on Invoice but not in the type definition
        const subscriptionId = (invoice as unknown as { subscription?: string })
          .subscription;

        console.log(`💰 Payment succeeded for subscription: ${subscriptionId}`);

        if (subscriptionId && typeof subscriptionId === "string") {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          const user = await db.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (user && subscription) {
            const currentPriceId = subscription.items.data[0]?.price?.id;
            let planType: "free" | "premium" | "pro" = "free";

            if (subscription.status === "active" && currentPriceId) {
              const priceIdMap = Object.entries(STRIPE_PRICE_IDS).find(
                ([, priceId]) => priceId === currentPriceId
              );
              planType = (priceIdMap?.[0] as "premium" | "pro") || "free";
            }

            console.log(
              `🔄 Auto-renewal successful for user ${user.id} - ${planType} plan`
            );

            await db.user.update({
              where: { id: user.id },
              data: {
                stripeCurrentPeriodEnd: new Date(
                  subscription.items.data[0].current_period_end * 1000
                ),
                plan: planType,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(
          `⏰ Trial ending soon for subscription: ${subscription.id}`
        );

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          console.log(`📧 Trial ending in 3 days for user ${user.id}`);
          // Trial will end in 3 days - Stripe will send email if enabled
          // You can add custom logic here if needed
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
              plan: "free",
            },
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook: ", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
