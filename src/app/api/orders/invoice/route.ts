import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { buildInvoicePdf } from '@/lib/invoice'

/** GET /api/orders/invoice?id=<orderId> → GST invoice PDF (owner or staff) */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id') ?? ''
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { medicine: { select: { name: true } } } },
      user: { select: { name: true, phone: true } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const isStaff = session.user.role === 'ADMIN' || session.user.role === 'PHARMACIST'
  if (!isStaff && order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.status === 'AWAITING_CONFIRMATION' || order.status === 'CANCELLED') {
    return NextResponse.json({ error: 'Invoice available once the order is confirmed' }, { status: 409 })
  }

  const pdf = await buildInvoicePdf({
    number: order.number,
    createdAt: order.createdAt,
    customerName: order.user.name,
    customerPhone: order.user.phone,
    address: (order.address ?? {}) as Record<string, unknown>,
    items: order.items.map(i => ({
      name: i.medicine.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    deliveryFee: order.deliveryFee,
    total: order.total,
  })

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="invoice-${order.number}.pdf"`,
    },
  })
}
