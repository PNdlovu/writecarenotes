/**
 * WriteCareNotes.com
 * @fileoverview NextAuth.js configuration
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials')
            throw new Error("Please provide both email and password")
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              organization: true,
              careHome: true,
            },
          })

          if (!user) {
            console.error('User not found:', credentials.email)
            throw new Error("Invalid credentials")
          }

          if (!user.hashedPassword) {
            console.error('User has no password:', credentials.email)
            throw new Error("Please use magic link to sign in")
          }

          const isPasswordValid = await compare(credentials.password, user.hashedPassword)

          if (!isPasswordValid) {
            console.error('Invalid password for user:', credentials.email)
            throw new Error("Invalid credentials")
          }

          console.log('User authenticated successfully:', credentials.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
            organization: user.organization,
            careHomeId: user.careHomeId,
            careHome: user.careHome,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.organization = user.organization
        token.careHomeId = user.careHomeId
        token.careHome = user.careHome
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.organizationId = token.organizationId
        session.user.organization = token.organization
        session.user.careHomeId = token.careHomeId
        session.user.careHome = token.careHome
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
