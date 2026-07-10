import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const OTP_TTL_MS = 5 * 60 * 1000 // 5 minutes

/** POST { phone } → generates an OTP. Dev mode: printed to the server console. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const phone = String(body?.phone ?? '').replace(/\D/g, '')

  if (phone.length !== 10) {
    return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 })
  }

  // Basic rate limit: max 3 unexpired OTPs per phone
  const pending = await prisma.otpCode.count({
    where: { phone, used: false, expiresAt: { gt: new Date() } },
  })
  if (pending >= 3) {
    return NextResponse.json({ error: 'Too many OTP requests. Try again in a few minutes.' }, { status: 429 })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  await prisma.otpCode.create({
    data: { phone, code, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  })

  // Phase 3: replace with WhatsApp/SMS provider call
  console.log(`\n  [DEV OTP] ${phone} → ${code}  (valid 5 min)\n`)

  // OTP_DEBUG=1 returns the code in the response so cloud deployments can be
  // tested without SMS or log access. NEVER enable in production with real users.
  if (process.env.OTP_DEBUG === '1') {
    return NextResponse.json({ ok: true, debugOtp: code })
  }

  return NextResponse.json({ ok: true })
}
