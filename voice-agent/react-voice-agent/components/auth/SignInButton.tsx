"use client";
import { signIn } from "next-auth/react";

export function SignIn() {
  return (
    <button
      className="bg-black w-32 h-12 mx-auto m-8 rounded-2xl font-bold dark:bg-primary text-white dark:text-black"
      onClick={() => signIn()}
    >
      Sign In
    </button>
  );
}
