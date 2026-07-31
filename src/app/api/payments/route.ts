import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

/**
 * Razorpay payments.
 *
 * POST { orderId, address? } → creates a Razorpay order and returns the
 *   details the browser checkout needs. Amount always comes from the DB,
 *   never from the client.
 * PUT  { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *   → verifies the signature server-side and marks the order paid/confirmed.
 */

const KEY_ID = process.env.RAZORPAY_KEY_ID
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!KEY_ID || !KEY_SECRET) {
    return NextResponse.json({ error: 'Online payment is not configured' }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const orderId = String(body?.orderId ?? '')

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.paymentStatus === 'PAID') {
    return NextResponse.json({ error: 'This order is already paid' }, { status: 409 })
  }

  // Save the delivery address if the patient supplied one at pay time
  if (body?.address && typeof body.address === 'object') {
    await prisma.order.update({ where: { id: order.id }, data: { address: body.address } })
  }

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64'),
    },
    body: JSON.stringify({
      amount: order.total * 100, // paise
      currency: 'INR',
      receipt: order.number,
      notes: { orderId: order.id, orderNumber: order.number },
    }),
  })

  if (!res.ok) {
    console.error('Razorpay order creation failed:', await res.text())
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 })
  }

  const rzpOrder = await res.json()
  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzpOrder.id, paymentStatus: 'PENDING' },
  })

  return NextResponse.json({
    keyId: KEY_ID,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    orderNumber: order.number,
  })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  if (!KEY_SECRET) return NextResponse.json({ error: 'Online payment is not configured' }, { status: 503 })

  const body = await req.json().catch(() => null)
  const orderId = String(body?.orderId ?? '')
  const paymentId = String(body?.razorpay_payment_id ?? '')
  const rzpOrderId = String(body?.razorpay_order_id ?? '')
  const signature = String(body?.razorpay_signature ?? '')

  if (!orderId || !paymentId || !rzpOrderId || !signature) {
    return NextResponse.json({ error: 'Invalid payment response' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Razorpay signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${rzpOrderId}|${paymentId}`)
    .digest('hex')

  const valid =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))

  if (!valid || order.razorpayOrderId !== rzpOrderId) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } })
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'PAID',
      razorpayPaymentId: paymentId,
      paidAt: new Date(),
      // A paid order moves out of "awaiting confirmation"
      ...(order.status === 'AWAITING_CONFIRMATION' ? { status: 'CONFIRMED' as const } : {}),
    },
  })

  return NextResponse.json({
    order: { id: updated.id, number: updated.number, status: updated.status, paymentStatus: updated.paymentStatus },
  })
}
