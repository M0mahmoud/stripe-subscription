import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const session = await getSession();
  if (!session || !session.isLoggedIn) {
    redirect("/signin");
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });

  if (!user) {
    redirect("/signin");
  }

  if (user.plan !== "premium" && user.plan !== "pro") {
    redirect("/pricing");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Premium</h1>
        <p className="text-lg text-gray-300 mb-6">
          You have access to exclusive content and features.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-400">
              Gain deeper insights into your data with our advanced analytics tools.
            </p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Priority Support</h3>
            <p className="text-gray-400">
              Get faster response times and dedicated support from our team.
            </p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Custom Integrations</h3>
            <p className="text-gray-400">
              Integrate with your favorite tools and services seamlessly.
            </p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Exclusive Content</h3>
            <p className="text-gray-400">
              Access a library of premium articles, tutorials, and resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
