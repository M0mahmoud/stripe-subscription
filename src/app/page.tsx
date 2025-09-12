import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{" "}
          <span className="text-blue-600">Stripe Subscription</span>
        </h1>

        <p className="mt-3 text-2xl">
          Get started by exploring our pricing plans and features.
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link
            href="/pricing"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Pricing &rarr;</h3>
            <p className="mt-4 text-xl">
              Find the perfect plan for your needs.
            </p>
          </Link>

          <Link
            href="/premium"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Premium Features &rarr;</h3>
            <p className="mt-4 text-xl">
              Unlock exclusive content and features.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
