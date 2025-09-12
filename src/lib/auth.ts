import { promisify } from "util";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

const scryptAsync = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
) {
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedKey);
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return { salt, hash: derivedKey.toString("hex") };
}

export type SessionData = {
  userId?: string;
  email?: string;
  role?: string;
  isLoggedIn: boolean;
};

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "auth-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }

  return session;
}
