import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'

/**
 * Phone-OTP auth (dev mode): OTPs are stored in the DB and printed to the
 * server console by /api/auth/otp. Phase 3 swaps the console.log for an
 * SMS/WhatsApp provider — nothing else changes.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        const phone = credentials?.phone?.replace(/\D/g, '')
        const otp = credentials?.otp?.trim()
        if (!phone || phone.length !== 10 || !otp) return null

        const record = await prisma.otpCode.findFirst({
          where: { phone, code: otp, used: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        })
        if (!record) return null

        await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } })

        const user = await prisma.user.upsert({
          where: { phone },
          update: {},
          create: { phone, name: `User ${phone.slice(-4)}` },
        })

        return { id: user.id, name: user.name, phone: user.phone, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
      }
      return session
    },
  },
}
