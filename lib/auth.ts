// lib/auth.ts
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { Session } from "next-auth"
// Import other providers you need

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Configure your authentication providers here
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authorization logic here
        const user = { id: "1", email: "user@example.com" } // Example user
        if (user) {
          return user
        }
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Add custom session properties here
      if (session.user) {
        session.user.id = token.sub || "" // Add user ID to session
      }
      return session
    }
  },
  // Other NextAuth configurations...
}