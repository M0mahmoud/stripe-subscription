import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY!

export const STRIPE_PRICE_IDS = {
  premium: "price_1S5uKcJgZtZ1uHWreTKuKbbU",
  pro: "price_1S5uJsJgZtZ1uHWrT8KbG6Pv",
} as const

export type StripePriceId = keyof typeof STRIPE_PRICE_IDS
