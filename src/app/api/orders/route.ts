import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface OrderRequestItem {
  medicineId: string
  quantity: number
}

/** GET → current user's orders (all orders for ADMIN/PHARMACIST) */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const isStaff = session.user.role === 'ADMIN' || session.user.role === 'PHARMACIST'
  const orders = await prisma.order.findMany({
    where: isStaff ? {} : { userId: session.user.id },
    include: { items: { include: { medicine: { select: { name: true } } } }, prescriptions: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ orders })
}

/**
 * POST { items: [{medicineId, quantity}], address: {...} }
 * Staff may additionally pass { forUserId, prescriptionId } to prepare an
 * order for a patient from an uploaded prescription — the order is created
 * as AWAITING_CONFIRMATION, the Rx is approved and linked, and the patient
 * confirms it (PATCH below) to place it.
 * Creates an order in a single transaction:
 *  - validates stock across batches
 *  - decrements FIFO by soonest expiry (standard pharmacy practice)
 *  - prices come from the DB, never the client
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const items: OrderRequestItem[] = Array.isArray(body?.items) ? body.items : []
  const address = body?.address ?? {}
  const forUserId = typeof body?.forUserId === 'string' ? body.forUserId : ''
  const prescriptionId = typeof body?.prescriptionId === 'string' ? body.prescriptionId : ''

  if (items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }
  if (items.some(i => !i.medicineId || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 50)) {
    return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
  }

  // Staff preparing an order for a patient from an uploaded Rx
  const isStaff = session.user.role === 'ADMIN' || session.user.role === 'PHARMACIST'
  const isRxOrder = Boolean(forUserId && prescriptionId)
  if (isRxOrder) {
    if (!isStaff) return NextResponse.json({ error: 'Pharmacist access required' }, { status: 403 })
    const rx = await prisma.prescription.findUnique({ where: { id: prescriptionId } })
    if (!rx || rx.orderId || rx.userId !== forUserId) {
      return NextResponse.json({ error: 'Prescription not found or already processed' }, { status: 404 })
    }
  }

  try {
    const order = await prisma.$transaction(async tx => {
      let subtotal = 0
      let requiresRx = false
      const orderItems: { medicineId: string; quantity: number; unitPrice: number }[] = []

      for (const item of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId },
          include: { batches: { where: { qty: { gt: 0 } }, orderBy: { expiry: 'asc' } } },
        })
        if (!medicine) throw new Error(`Medicine ${item.medicineId} not found`)

        const available = medicine.batches.reduce((s, b) => s + b.qty, 0)
        if (available < item.quantity) {
          throw new Error(`Only ${available} unit(s) of ${medicine.name} in stock`)
        }

        // FIFO decrement — soonest-expiring batches ship first
        let remaining = item.quantity
        for (const batch of medicine.batches) {
          if (remaining === 0) break
          const take = Math.min(batch.qty, remaining)
          await tx.batch.update({ where: { id: batch.id }, data: { qty: batch.qty - take } })
          remaining -= take
        }

        subtotal += medicine.halftabletPrice * item.quantity
        if (medicine.requiresPrescription) requiresRx = true
        orderItems.push({ medicineId: medicine.id, quantity: item.quantity, unitPrice: medicine.halftabletPrice })
      }

      const deliveryFee = subtotal > 999 ? 0 : 99
      const count = await tx.order.count()
      const number = `ORD-2026-${String(1252 + count).padStart(6, '0')}`

      const created = await tx.order.create({
        data: {
          number,
          userId: isRxOrder ? forUserId : session.user.id,
          status: isRxOrder ? 'AWAITING_CONFIRMATION' : requiresRx ? 'PENDING_RX' : 'CONFIRMED',
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          address,
          items: { create: orderItems },
        },
        include: { items: true },
      })

      if (isRxOrder) {
        await tx.prescription.update({
          where: { id: prescriptionId },
          data: {
            orderId: created.id,
            status: 'APPROVED',
            reviewerId: session.user.id,
            reviewedAt: new Date(),
          },
        })
      }

      return created
    })

    return NextResponse.json({ order: { id: order.id, number: order.number, status: order.status, total: order.total } }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Order failed'
    return NextResponse.json({ error: message }, { status: 409 })
  }
}

/**
 * PATCH { id, action: 'confirm', address } — patient confirms an order the
 * pharmacist prepared from their prescription (AWAITING_CONFIRMATION → CONFIRMED).
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const id = String(body?.id ?? '')
  if (!id || body?.action !== 'confirm') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.status !== 'AWAITING_CONFIRMATION') {
    return NextResponse.json({ error: 'Order is not awaiting confirmation' }, { status: 409 })
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: 'CONFIRMED', address: body?.address ?? order.address ?? {} },
  })
  return NextResponse.json({ order: { id: updated.id, number: updated.number, status: updated.status } })
}
