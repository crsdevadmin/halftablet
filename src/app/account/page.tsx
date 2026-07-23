'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, FileText, ChevronRight, Download, Hourglass } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'

interface MyOrder {
  id: string
  number: string
  status: string
  total: number
  createdAt: string
  items: { quantity: number; medicine: { name: string } }[]
}

interface MyRx {
  id: string
  status: string
  createdAt: string
  order: { id: string; number: string } | null
}

const STATUS_UI: Record<string, { label: string; variant: BadgeVariant }> = {
  AWAITING_CONFIRMATION: { label: 'Ready — Confirm Order', variant: 'warning' },
  PENDING_RX: { label: 'Awaiting Prescription', variant: 'warning' },
  RX_VERIFIED: { label: 'Rx Verified', variant: 'cold' },
  CONFIRMED: { label: 'Confirmed', variant: 'cold' },
  DISPATCHED: { label: 'Dispatched', variant: 'cold' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', variant: 'rx' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
}

const PROGRESS: Record<string, number> = {
  PENDING_RX: 15, RX_VERIFIED: 30, CONFIRMED: 45, DISPATCHED: 65, OUT_FOR_DELIVERY: 85, DELIVERED: 100,
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession()
  const [orders, setOrders] = useState<MyOrder[]>([])
  const [prescriptions, setPrescriptions] = useState<MyRx[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const [oRes, pRes] = await Promise.all([fetch('/api/orders'), fetch('/api/prescriptions')])
    if (oRes.ok) setOrders((await oRes.json()).orders ?? [])
    if (pRes.ok) setPrescriptions((await pRes.json()).prescriptions ?? [])
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (session?.user) load()
  }, [session, load])

  if (authStatus === 'unauthenticated') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-fg font-semibold mb-2">Sign in to see your orders</p>
        <Link href="/login?callbackUrl=/account" className={buttonVariants('primary', 'lg')}>
          Sign In with Mobile Number
        </Link>
      </div>
    )
  }

  const active = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const awaiting = orders.filter(o => o.status === 'AWAITING_CONFIRMATION')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-fg">
          Hello, {session?.user?.name ?? 'there'} 👋
        </h1>
        <p className="text-muted mt-1">Your orders and prescriptions, all in one place</p>
      </div>

      {awaiting.length > 0 && (
        <Link href="/upload-rx"
          className="card p-4 mb-6 flex items-center gap-3 border-warning/40 bg-warning/5 hover:bg-warning/10 transition-colors">
          <Hourglass size={18} className="text-warning" aria-hidden />
          <p className="text-sm text-fg flex-1">
            Our pharmacist prepared {awaiting.length === 1 ? 'an order' : `${awaiting.length} orders`} from your
            prescription — <strong>tap to review and confirm</strong>.
          </p>
          <ChevronRight size={16} className="text-warning" aria-hidden />
        </Link>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-3">
          <div className="bg-primary-soft w-10 h-10 rounded-xl flex items-center justify-center" aria-hidden>
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-xl text-fg">{loaded ? active.length : '…'}</p>
            <p className="text-xs text-muted">Active Orders</p>
          </div>
        </div>
        <Link href="/upload-rx" className="card p-4 flex items-center gap-3 group hover:-translate-y-0.5 transition-transform">
          <div className="bg-warning/10 w-10 h-10 rounded-xl flex items-center justify-center" aria-hidden>
            <FileText size={20} className="text-warning" />
          </div>
          <div>
            <p className="font-display font-bold text-xl text-fg">{loaded ? prescriptions.length : '…'}</p>
            <p className="text-xs text-muted">Prescriptions</p>
          </div>
          <ChevronRight size={14} className="ml-auto text-faint group-hover:text-primary transition-colors" aria-hidden />
        </Link>
      </div>

      <h2 className="font-display font-semibold text-lg text-fg mb-4">My Orders</h2>
      {!loaded && <p className="text-sm text-muted">Loading…</p>}
      {loaded && orders.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted mb-4">No orders yet.</p>
          <Link href="/medicines" className={buttonVariants('primary', 'md')}>Browse Medicines</Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map(o => {
          const ui = STATUS_UI[o.status] ?? { label: o.status, variant: 'neutral' as BadgeVariant }
          const progress = PROGRESS[o.status]
          const summary = o.items.map(i => `${i.medicine.name} × ${i.quantity}`).join(', ')
          const invoiceReady = !['AWAITING_CONFIRMATION', 'PENDING_RX', 'CANCELLED'].includes(o.status)
          return (
            <div key={o.id} className="card p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <div>
                  <p className="font-mono text-sm text-fg font-semibold">{o.number}</p>
                  <p className="text-xs text-muted">Placed {formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={ui.variant}>{ui.label}</Badge>
                  <p className="font-bold text-fg">{formatPrice(o.total)}</p>
                </div>
              </div>
              <p className="text-sm text-muted truncate mb-3">{summary}</p>
              {progress !== undefined && (
                <div className="h-1.5 bg-surface-2 rounded-full mb-3">
                  <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="flex items-center gap-4">
                {o.status === 'AWAITING_CONFIRMATION' && (
                  <Link href="/upload-rx" className="text-sm text-primary font-semibold hover:underline">
                    Review & Confirm →
                  </Link>
                )}
                {invoiceReady && (
                  <a href={`/api/orders/invoice?id=${o.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                    <Download size={13} aria-hidden /> GST Invoice
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
