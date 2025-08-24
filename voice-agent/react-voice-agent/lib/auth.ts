import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaClient } from "./generated/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
const prisma = new PrismaClient()

 
export const {auth, handlers, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },
    providers: [
    GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
  })
  ],
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async jwt({token, user}) {
            if(user){
                token.id = user.id;
                token.name = user.name;
            }
            return token;
        },
        async session({session, token}){
            if(session.user){
                session.user.id = token.id as string;
                session.user.name = token.name as string;
            }
            return session;

        },
    },
});