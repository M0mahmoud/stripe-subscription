"use client";

import React, { useActionState } from "react";
import { SignOutAction } from "../../lib/action";

export default function SignOutButton() {
  const [_, action, isPending] = useActionState(SignOutAction, undefined);
  return (
    <form action={action}>
      <button
        type="submit"
        disabled={isPending}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
      >
        Sign Out
      </button>
    </form>
  );
}
