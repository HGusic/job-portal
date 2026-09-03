"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `${window.location.origin}/admin/login` })}
      className="hover:text-[#115e59]"
    >
      Sign out
    </button>
  );
}
