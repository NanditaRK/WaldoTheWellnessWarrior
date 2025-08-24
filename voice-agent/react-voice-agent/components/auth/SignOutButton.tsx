"use client"
import { signOut } from "next-auth/react"
 
export function SignOut() {
  return <button className="bg-black w-32 h-12 mx-auto m-2 rounded-2xl font-bold dark:bg-primary text-white dark:text-black" onClick={() => signOut()}>Sign Out</button>
}