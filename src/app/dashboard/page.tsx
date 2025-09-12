import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";
import SignOutButton from "../components/SignOutButton";
import ManageSubscriptionButton from "../components/ManageSubscriptionButton";

const Page = async () => {
  const session = await getSession();

  if (!session || !session.isLoggedIn) {
    redirect("/signin");
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });

  if (!user) {
    redirect("/signin");
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Information Card */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">User Information</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <div className="mt-4">
                <SignOutButton />
              </div>
            </div>
          </div>

          {/* Subscription Information Card */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">
              Subscription Information
            </h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>Current Plan:</strong>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    user.plan === "free"
                      ? "bg-gray-700 text-gray-300"
                      : user.plan === "premium"
                      ? "bg-blue-600 text-white"
                      : "bg-purple-600 text-white"
                  }`}
                >
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </span>
              </p>
              {user.stripeSubscriptionId && (
                <>
                  <p>
                    <strong>Subscription ID:</strong> {user.stripeSubscriptionId}
                  </p>
                  <p>
                    <strong>Current Period End:</strong>{" "}
                    {formatDate(user.stripeCurrentPeriodEnd)}
                  </p>
                  <div className="mt-4">
                    <ManageSubscriptionButton />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;