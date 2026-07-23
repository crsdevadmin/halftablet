import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { saveUpload } from '@/lib/storage'
import { extractMedicinesFromRx, type RxSuggestion } from '@/lib/rxAi'
import crypto from 'crypto'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf']

/**
 * GET →
 *  - staff: standalone prescriptions awaiting review (no order yet)
 *  - customer: own prescriptions with their linked order (if any)
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const isStaff = session.user.role === 'ADMIN' || session.user.role === 'PHARMACIST'
  const prescriptions = await prisma.prescription.findMany({
    where: isStaff
      ? { orderId: null, status: 'PENDING' }
      : { userId: session.user.id },
    include: {
      user: { select: { name: true, phone: true } },
      order: { select: { id: true, number: true, status: true, total: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ prescriptions })
}

/**
 * POST multipart/form-data { file, orderId? }
 * With orderId → attach to that order (checkout flow).
 * Without orderId → standalone upload; a pharmacist reviews it and prepares an order.
 * Storage: S3 when the bucket is configured, local ./uploads otherwise (see src/lib/storage.ts).
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

  if (orderId) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
  }

  const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg'
  const name = `${orderId || session.user.id}-${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const filePath = await saveUpload(name, buffer, file.type)

  // AI reads the Rx so the patient sees progress immediately; pharmacist verifies
  let aiSuggestions: RxSuggestion[] = []
  try {
    aiSuggestions = await extractMedicinesFromRx(buffer, file.type)
  } catch {
    // extraction is best-effort — never block the upload
  }

  const suggestionsJson = JSON.parse(JSON.stringify(aiSuggestions))
  // Start the patient's editable selection from the AI catalog matches
  const initialItems = JSON.parse(
    JSON.stringify(
      aiSuggestions.filter(s => s.id).map(s => ({ medicineId: s.id, quantity: 1 }))
    )
  )
  const prescription = await prisma.prescription.create({
    data: orderId
      ? { orderId, userId: session.user.id, filePath, aiSuggestions: suggestionsJson, requestedItems: initialItems }
      : { userId: session.user.id, filePath, aiSuggestions: suggestionsJson, requestedItems: initialItems },
  })

  return NextResponse.json(
    { prescription: { id: prescription.id, status: prescription.status, aiSuggestions } },
    { status: 201 }
  )
}

/**
 * PATCH
 *  { id, action: 'approve' | 'reject' } — pharmacist/admin only
 *  { id, action: 'items', items: [{medicineId, quantity}] } — the uploading
 *    patient adjusts which medicines (and how many) they want from their Rx
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const id = String(body?.id ?? '')
  const action = body?.action

  if (action === 'items') {
    const items = Array.isArray(body?.items) ? body.items : []
    if (
      !id ||
      items.length > 30 ||
      items.some(
        (i: { medicineId?: unknown; quantity?: unknown }) =>
          typeof i.medicineId !== 'string' ||
          !Number.isInteger(i.quantity) ||
          (i.quantity as number) < 1 ||
          (i.quantity as number) > 50
      )
    ) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const rx = await prisma.prescription.findUnique({ where: { id } })
    if (!rx || rx.userId !== session.user.id) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }
    if (rx.orderId || rx.status !== 'PENDING') {
      return NextResponse.json({ error: 'This prescription is already being processed' }, { status: 409 })
    }

    const requestedItems = JSON.parse(
      JSON.stringify(
        items.map((i: { medicineId: string; quantity: number }) => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
        }))
      )
    )
    await prisma.prescription.update({ where: { id }, data: { requestedItems } })
    return NextResponse.json({ ok: true, requestedItems })
  }

  if (session.user.role !== 'PHARMACIST' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Pharmacist access required' }, { status: 403 })
  }

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
  if (action === 'approve' && prescription.orderId) {
    await prisma.order.update({
      where: { id: prescription.orderId, status: 'PENDING_RX' },
      data: { status: 'RX_VERIFIED' },
    }).catch(() => {}) // ignore if already past PENDING_RX
  }

  return NextResponse.json({ prescription: { id: prescription.id, status: prescription.status } })
}
