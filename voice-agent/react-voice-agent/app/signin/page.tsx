"use client"

import React from 'react'
import { signIn } from "next-auth/react"

const SignInPage = () => {
  return (
    <div className='w-1/2 bg-secondary rounded-3xl mx-auto h-fit p-8'>
        <h1 className='text-2xl text-center m-4 font-extrabold text-black dark:text-primary'>Waldo The Wellness Warrior</h1>
        <hr className='border-1 my-8  border-gray-300'/>
        <div className='flex justify-center my-8 w-full'><button className="bg-black w-64 h-12 rounded-2xl font-bold dark:bg-primary text-white dark:text-black" onClick={() => signIn("google")}>Sign In with Google</button></div>
        
    </div>
  )
}

export default SignInPage;