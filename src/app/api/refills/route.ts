import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * Refill autopilot.
 * GET  → list my refill subscriptions; any that are due auto-create a
 *        ready-to-confirm order (AWAITING_CONFIRMATION) — the patient
 *        confirms it exactly like a pharmacist-prepared order.
 * POST { orderId, intervalDays } → enable auto-refill for every medicine in that order
 * PATCH { id, action: 'pause' | 'resume' | 'cancel' | 'interval', intervalDays? }
 */

async function generateDueOrders(userId: string) {
  const due = await prisma.refill.findMany({
    where: { userId, active: true, nextDueAt: { lte: new Date() } },
  })
  if (due.length === 0) return null

  try {
    return await prisma.$transaction(async tx => {
      let subtotal = 0
      const orderItems: { medicineId: string; quantity: number; unitPrice: number }[] = []

      for (const sub of due) {
        const medicine = await tx.medicine.findUnique({
          where: { id: sub.medicineId },
          include: { batches: { where: { qty: { gt: 0 } }, orderBy: { expiry: 'asc' } } },
        })
        if (!medicine) continue
        const available = medicine.batches.reduce((s, b) => s + b.qty, 0)
        if (available < sub.quantity) continue // skip out-of-stock refills; retried next visit

        let remaining = sub.quantity
        for (const batch of medicine.batches) {
          if (remaining === 0) break
          const take = Math.min(batch.qty, remaining)
          await tx.batch.update({ where: { id: batch.id }, data: { qty: batch.qty - take } })
          remaining -= take
        }
        subtotal += medicine.halftabletPrice * sub.quantity
        orderItems.push({ medicineId: medicine.id, quantity: sub.quantity, unitPrice: medicine.halftabletPrice })

        await tx.refill.update({
          where: { id: sub.id },
          data: { nextDueAt: new Date(Date.now() + sub.intervalDays * 86_400_000) },
        })
      }

      if (orderItems.length === 0) return null
      const deliveryFee = subtotal > 999 ? 0 : 99
      const count = await tx.order.count()
      const number = `ORD-2026-${String(1252 + count).padStart(6, '0')}`
      return tx.order.create({
        data: {
          number,
          userId,
          status: 'AWAITING_CONFIRMATION',
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          address: {},
          items: { create: orderItems },
        },
      })
    })
  } catch {
    return null
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const generated = await generateDueOrders(session.user.id)

  const refills = await prisma.refill.findMany({
    where: { userId: session.user.id },
    include: { medicine: { select: { name: true, halftabletPrice: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    refills,
    generatedOrder: generated ? { id: generated.id, number: generated.number } : null,
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const orderId = String(body?.orderId ?? '')
  const intervalDays = Number.isInteger(body?.intervalDays) && body.intervalDays >= 7 && body.intervalDays <= 180
    ? body.intervalDays
    : 30

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  let created = 0
  for (const item of order.items) {
    const exists = await prisma.refill.findFirst({
      where: { userId: session.user.id, medicineId: item.medicineId, active: true },
    })
    if (exists) continue
    await prisma.refill.create({
      data: {
        userId: session.user.id,
        medicineId: item.medicineId,
        quantity: item.quantity,
        intervalDays,
        nextDueAt: new Date(Date.now() + intervalDays * 86_400_000),
      },
    })
    created++
  }

  return NextResponse.json({ ok: true, created }, { status: 201 })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const id = String(body?.id ?? '')
  const action = body?.action

  const refill = await prisma.refill.findUnique({ where: { id } })
  if (!refill || refill.userId !== session.user.id) {
    return NextResponse.json({ error: 'Refill not found' }, { status: 404 })
  }

  if (action === 'pause') {
    await prisma.refill.update({ where: { id }, data: { active: false } })
  } else if (action === 'resume') {
    await prisma.refill.update({
      where: { id },
      data: { active: true, nextDueAt: new Date(Date.now() + refill.intervalDays * 86_400_000) },
    })
  } else if (action === 'cancel') {
    await prisma.refill.delete({ where: { id } })
  } else if (action === 'interval') {
    const days = body?.intervalDays
    if (!Number.isInteger(days) || days < 7 || days > 180) {
      return NextResponse.json({ error: 'Interval must be 7–180 days' }, { status: 400 })
    }
    await prisma.refill.update({ where: { id }, data: { intervalDays: days } })
  } else {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
