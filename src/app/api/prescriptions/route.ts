import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { saveUpload } from '@/lib/storage'
import crypto from 'crypto'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf']

/**
 * POST multipart/form-data { file, orderId }
 * Storage: S3 when AWS_S3_BUCKET is configured, local ./uploads otherwise
 * (see src/lib/storage.ts).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  const orderId = String(form?.get('orderId') ?? '')

  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Only JPG, PNG or PDF allowed' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg'
  const name = `${orderId}-${crypto.randomUUID()}.${ext}`
  const filePath = await saveUpload(name, Buffer.from(await file.arrayBuffer()), file.type)

  const prescription = await prisma.prescription.create({
    data: { orderId, filePath },
  })

  return NextResponse.json({ prescription: { id: prescription.id, status: prescription.status } }, { status: 201 })
}

/** PATCH { id, action: 'approve' | 'reject' } — pharmacist/admin only */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== 'PHARMACIST' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Pharmacist access required' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const id = String(body?.id ?? '')
  const action = body?.action

  if (!id || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const prescription = await prisma.prescription.update({
    where: { id },
    data: {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      reviewerId: session.user.id,
      reviewedAt: new Date(),
    },
  })

  // Advance the order when its Rx is approved
  if (action === 'approve') {
    await prisma.order.update({
      where: { id: prescription.orderId, status: 'PENDING_RX' },
      data: { status: 'RX_VERIFIED' },
    }).catch(() => {}) // ignore if already past PENDING_RX
  }

  return NextResponse.json({ prescription: { id: prescription.id, status: prescription.status } })
}
