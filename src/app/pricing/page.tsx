import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";
import PricingCards from "../components/PricingCards";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";

// Default tier shapes. We'll replace price strings for non-free tiers at runtime
const baseTiers = [
  {
    name: "Free",
    price: "$0",
    priceId: null,
    features: ["Basic features", "Limited usage", "Community support"],
    buttonText: "Get Started",
  },
  {
    name: "Premium",
    price: "",
    priceId: "premium",
    features: [
      "All basic features",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
    ],
    buttonText: "Upgrade to Premium",
  },
  {
    name: "Pro",
    price: "",
    priceId: "pro",
    features: [
      "All premium features",
      "Unlimited usage",
      "24/7 support",
      "White-label options",
      "API access",
    ],
    buttonText: "Go Pro",
  },
];

const PricingPage = async () => {
  const session = await getSession();

  if (!session || !session.isLoggedIn) {
    redirect("/signin");
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });

  if (!user) {
    redirect("/signin");
  }

  const hasActiveSubscription = Boolean(
    user.stripeSubscriptionId && user.plan !== null && user.plan !== "free"
  );

  const hasCanceledSubscription = Boolean(
    user.stripeSubscriptionId && user.plan === "free" && user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > new Date()
  );

  // Fetch Stripe prices for each tier that has a priceId configured
  const tiers = await Promise.all(
    baseTiers.map(async (t) => {
      if (!t.priceId) return t;

      const stripePriceId = (STRIPE_PRICE_IDS as Record<string, string>)[
        t.priceId as string
      ];

      try {
        const price = await stripe.prices.retrieve(stripePriceId);

        // price.unit_amount is in cents (or smallest currency unit). Use currency and recurring interval
        const unitAmount = price.unit_amount ?? 0;
        const currency = (price.currency ?? "usd").toUpperCase();

        // Format to localized currency string. We divide by 100 to get standard units.
        const formatted = new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currency,
          minimumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
        }).format(unitAmount / 100);

        const interval = (price.recurring && price.recurring.interval) || null;
        const intervalStr = interval ? `/${interval}` : "";

        return {
          ...t,
          price: `${formatted}${intervalStr}`,
        };
      } catch (err) {
        // On error, fall back to a generic price string
        return {
          ...t,
          price: "Contact sales",
        };
      }
    })
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Our Pricing Plans</h1>
      {hasCanceledSubscription && (
        <div className="bg-yellow-500 text-black p-4 rounded-lg mb-8">
          <p className="font-bold">Your subscription has been canceled.</p>
          <p>Your plan will be active until {new Date(user.stripeCurrentPeriodEnd!).toLocaleDateString()}.</p>
        </div>
      )}
      <PricingCards
        tiers={tiers}
        userPlan={user.plan}
        hasActiveSubscription={hasActiveSubscription}
      />
    </div>
  );
};

export default PricingPage;
