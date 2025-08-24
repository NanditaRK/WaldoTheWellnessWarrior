"use client"
import React from 'react'
import { useSession } from 'next-auth/react'




const WelcomeMessage = () => {
    const sessionObject = useSession()
    const session = sessionObject.data
  return (
    
    <div><h1 className='text-center m-8 text-4xl font-bold text-black dark:text-primary'>Hello, {session?.user?.name}! 👋</h1></div>
  )
}

export default WelcomeMessage;