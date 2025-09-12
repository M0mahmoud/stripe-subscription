"use client";
import { useRouter } from "next/navigation";
import React from "react";

interface Tier {
  name: string;
  price: string;
  priceId: string | null;
  features: string[];
  buttonText: string;
}

interface PricingCardsProps {
  tiers: Tier[];
  userPlan: string;
  hasActiveSubscription: boolean | null;
}

const PricingCards: React.FC<PricingCardsProps> = ({
  tiers,
  userPlan,
  hasActiveSubscription,
}) => {
  const router = useRouter();
  const handleSubscripe = async (priceId: string) => {
    if (!priceId) return;

    if (hasActiveSubscription) {
      alert(
        `You already have an active ${userPlan} subscription. Please visit your dashboard to manage your subscription.`
      );

      router.push("/dashboard");
      return;
    }
    try {
      const response = await fetch("api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout url");
      }
    } catch (error) {
      console.error("Error creating checkout session: ", error);
      alert("Error creating checkout session");
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">{tier.name}</h2>
            <p className="text-4xl font-extrabold mb-6 text-white">
              {tier.price}
            </p>
            <ul className="mb-6 space-y-3 text-gray-300">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="text-green-400 mr-3">✔</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => handleSubscripe(tier.priceId!)}
            className="w-full py-3 mt-6 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
          >
            {tier.buttonText}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PricingCards;
