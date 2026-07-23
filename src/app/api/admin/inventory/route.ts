import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireStaff() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== 'PHARMACIST' && session.user.role !== 'ADMIN')) {
    return null
  }
  return session
}

/** GET → live stock: every medicine with its batches */
export async function GET() {
  const session = await requireStaff()
  if (!session) return NextResponse.json({ error: 'Pharmacist access required' }, { status: 403 })

  const medicines = await prisma.medicine.findMany({
    select: {
      id: true,
      name: true,
      coldChain: true,
      reorderLevel: true,
      batches: { select: { id: true, batchNo: true, expiry: true, qty: true }, orderBy: { expiry: 'asc' } },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ medicines })
}

/** POST { medicineId, batchNo, expiry (yyyy-mm-dd), qty } → add a stock batch */
export async function POST(req: Request) {
  const session = await requireStaff()
  if (!session) return NextResponse.json({ error: 'Pharmacist access required' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const medicineId = String(body?.medicineId ?? '')
  const batchNo = String(body?.batchNo ?? '').trim().slice(0, 40)
  const qty = body?.qty
  const expiry = new Date(String(body?.expiry ?? ''))

  if (!medicineId || !batchNo || !Number.isInteger(qty) || qty < 0 || qty > 100000 || isNaN(expiry.getTime())) {
    return NextResponse.json({ error: 'Invalid batch details' }, { status: 400 })
  }
  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } })
  if (!medicine) return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })

  const batch = await prisma.batch
    .create({ data: { medicineId, batchNo, expiry, qty } })
    .catch(() => null)
  if (!batch) return NextResponse.json({ error: 'Batch number already exists' }, { status: 409 })

  return NextResponse.json({ batch }, { status: 201 })
}
