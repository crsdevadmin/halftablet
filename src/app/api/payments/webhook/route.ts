import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

/**
 * Razorpay webhook — the reliable source of truth for payment outcomes
 * (fires even if the patient closes the browser mid-payment).
 *
 * Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL:     https://<your-domain>/api/payments/webhook
 *   Events:  payment.captured, payment.failed
 *   Secret:  save the same value as RAZORPAY_WEBHOOK_SECRET in Amplify
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })

  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')

  const valid =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  const event = JSON.parse(raw)
  const payment = event?.payload?.payment?.entity
  const rzpOrderId: string | undefined = payment?.order_id
  if (!rzpOrderId) return NextResponse.json({ ok: true })

  const order = await prisma.order.findUnique({ where: { razorpayOrderId: rzpOrderId } })
  if (!order) return NextResponse.json({ ok: true })

  if (event.event === 'payment.captured' && order.paymentStatus !== 'PAID') {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId: payment.id,
        paidAt: new Date(),
        ...(order.status === 'AWAITING_CONFIRMATION' ? { status: 'CONFIRMED' as const } : {}),
      },
    })
  } else if (event.event === 'payment.failed' && order.paymentStatus === 'PENDING') {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } })
  }

  return NextResponse.json({ ok: true })
}
