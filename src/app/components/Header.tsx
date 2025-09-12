import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function Header() {
  const session = await getSession();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Stripe Subscription
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-gray-300">
                Home
              </Link>
            </li>
            {session.isLoggedIn && (
              <>
                <li>
                  <Link href="/dashboard" className="hover:text-gray-300">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-gray-300">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/premium" className="hover:text-gray-300">
                    Premium
                  </Link>
                </li>
              </>
            )}
            {!session.isLoggedIn && (
              <>
                <li>
                  <Link href="/signin" className="hover:text-gray-300">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-gray-300">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
            {session?.role === "ADMIN" && (
              <li>
                <Link href="/admin" className="hover:text-gray-300">
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
