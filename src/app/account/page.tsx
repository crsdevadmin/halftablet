'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, FileText, ChevronRight, Download, Hourglass, RotateCcw } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'

import { EMPTY_ADDRESS, loadSavedAddress, saveAddress } from '@/lib/address'

interface MyRefill {
  id: string
  quantity: number
  intervalDays: number
  nextDueAt: string
  active: boolean
  medicine: { name: string; halftabletPrice: number }
}

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
  const [refills, setRefills] = useState<MyRefill[]>([])
  const [loaded, setLoaded] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [placing, setPlacing] = useState(false)

  const setField = (key: keyof typeof EMPTY_ADDRESS) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setAddress(a => ({ ...a, [key]: e.target.value }))

  const load = useCallback(async () => {
    // /api/refills also auto-creates any due refill orders before we list orders
    const rRes = await fetch('/api/refills')
    if (rRes.ok) {
      const rData = await rRes.json()
      setRefills(rData.refills ?? [])
      if (rData.generatedOrder) {
        toast(`Refill order ${rData.generatedOrder.number} is ready — confirm below`, { kind: 'info' })
      }
    }
    const [oRes, pRes] = await Promise.all([fetch('/api/orders'), fetch('/api/prescriptions')])
    if (oRes.ok) setOrders((await oRes.json()).orders ?? [])
    if (pRes.ok) setPrescriptions((await pRes.json()).prescriptions ?? [])
    setLoaded(true)
  }, [])

  const enableRefill = async (orderId: string) => {
    const res = await fetch('/api/refills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, intervalDays: 30 }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast(data.error || 'Could not enable auto-refill', { kind: 'error' })
      return
    }
    toast(
      data.created > 0
        ? `Auto-refill on — ${data.created} medicine${data.created > 1 ? 's' : ''} will be re-ordered every 30 days`
        : 'Auto-refill was already on for these medicines',
      { kind: 'success' }
    )
    load()
  }

  const confirmOrderInline = async (orderId: string) => {
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      toast('Please fill in your delivery details', { kind: 'info' })
      return
    }
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, action: 'confirm', address }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error || 'Could not confirm order', { kind: 'error' })
        return
      }
      saveAddress(address)
      toast(`Order ${data.order.number} confirmed! Pay cash on delivery.`, { kind: 'success' })
      setConfirmingId(null)
      load()
    } catch {
      toast('Network error — please try again', { kind: 'error' })
    } finally {
      setPlacing(false)
    }
  }

  const refillAction = async (id: string, action: string) => {
    const res = await fetch('/api/refills', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (!res.ok) {
      toast('Could not update refill', { kind: 'error' })
      return
    }
    load()
  }

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
        <div className="card p-4 mb-6 flex items-center gap-3 border-warning/40 bg-warning/5">
          <Hourglass size={18} className="text-warning" aria-hidden />
          <p className="text-sm text-fg flex-1">
            {awaiting.length === 1 ? 'An order is' : `${awaiting.length} orders are`} ready for you —{' '}
            <strong>review and confirm below</strong>.
          </p>
        </div>
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
              {o.status === 'AWAITING_CONFIRMATION' && confirmingId === o.id && (
                <div className="bg-primary-soft rounded-xl p-4 mb-3 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="Full Name" name="name" value={address.name} onChange={setField('name')} />
                    <Input label="Phone Number" name="phone" type="tel" inputMode="numeric" value={address.phone} onChange={setField('phone')} />
                    <Input label="Address Line 1" name="address1" value={address.line1} onChange={setField('line1')} />
                    <Input label="Address Line 2 (optional)" name="address2" value={address.line2} onChange={setField('line2')} />
                    <Input label="City" name="city" value={address.city} onChange={setField('city')} />
                    <Input label="PIN Code" name="pincode" inputMode="numeric" maxLength={6} value={address.pincode} onChange={setField('pincode')} />
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" onClick={() => confirmOrderInline(o.id)} disabled={placing}>
                      {placing ? 'Placing…' : 'Confirm Order (COD)'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                {o.status === 'AWAITING_CONFIRMATION' && confirmingId !== o.id && (
                  <button onClick={() => { setConfirmingId(o.id); setAddress(loadSavedAddress()) }}
                    className="text-sm text-primary font-semibold hover:underline">
                    Review & Confirm →
                  </button>
                )}
                {invoiceReady && (
                  <a href={`/api/orders/invoice?id=${o.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                    <Download size={13} aria-hidden /> GST Invoice
                  </a>
                )}
                {invoiceReady && (
                  <button onClick={() => enableRefill(o.id)}
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
                    <RotateCcw size={13} aria-hidden /> Auto-refill every 30 days
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {refills.length > 0 && (
        <>
          <h2 className="font-display font-semibold text-lg text-fg mt-10 mb-4 flex items-center gap-2">
            <RotateCcw size={17} className="text-primary" aria-hidden /> Refill Autopilot
          </h2>
          <div className="space-y-3">
            {refills.map(r => (
              <div key={r.id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg">
                    {r.medicine.name} <span className="text-muted font-normal">× {r.quantity}</span>
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {r.active
                      ? <>Every {r.intervalDays} days · next order {formatDate(r.nextDueAt)}</>
                      : 'Paused'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.active ? (
                    <Button size="sm" variant="outline" onClick={() => refillAction(r.id, 'pause')}>Pause</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => refillAction(r.id, 'resume')}>Resume</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => refillAction(r.id, 'cancel')}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">
            When a refill is due, a ready-made order appears here for you to confirm — nothing is charged automatically.
          </p>
        </>
      )}
    </div>
  )
}
