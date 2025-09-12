"use server";

import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function SignInAction(_arg: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: "Invalid credentials." };
    }

    const isValid = await verifyPassword(password, user.password, user.salt);
    if (!isValid) {
      return { success: false, message: "Invalid credentials." };
    }

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: unknown }).message
        : String(error);

    return {
      success: false,
      message: typeof message === "string" ? message : "An error occurred during sign in.",
    };
  }
  redirect("/dashboard");
}

export async function SignUpAction(_arg: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }
  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters long.",
    };
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "Invalid email or password." };
    }

    const { salt, hash } = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        password: hash,
        salt,
        role: "user",
      },
    });

    const session = await getSession();
    session.userId = user.id;
    session.email = email;
    session.role = "user";
    session.isLoggedIn = true;
    await session.save();
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: unknown }).message
        : String(error);

    return {
      success: false,
      message: typeof message === "string" ? message : "An error occurred during sign up.",
    };
  }
  redirect("/dashboard");
}

export async function SignOutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/signin");
}
