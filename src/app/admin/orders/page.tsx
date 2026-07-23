'use client'
import { useCallback, useEffect, useState } from 'react'
import { FileText, Snowflake, ChevronRight, Hourglass, ExternalLink } from 'lucide-react'
import { ORDER_STATUS_LABELS, PIPELINE_STATUSES } from '@/lib/adminData'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toaster'
import { OrderStatus } from '@/types'

interface LiveOrder {
  id: string
  number: string
  status: string // server enum, e.g. PENDING_RX
  total: number
  createdAt: string
  address: { city?: string } | null
  user: { name: string; phone: string }
  items: { quantity: number; medicine: { name: string; coldChain: boolean } }[]
  prescriptions: { id: string; status: string }[]
}

const toUi = (s: string) => s.toLowerCase() as OrderStatus

function OrderCard({ order, onAdvance, busy }: { order: LiveOrder; onAdvance: (o: LiveOrder, next: OrderStatus) => void; busy: boolean }) {
  const ui = toUi(order.status)
  const next = PIPELINE_STATUSES[PIPELINE_STATUSES.indexOf(ui) + 1]
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
  const coldChain = order.items.some(i => i.medicine.coldChain)
  const rx = order.prescriptions[0]
  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg truncate">{order.user.name}</p>
          <p className="text-xs text-muted">{order.address?.city || order.user.phone} · {formatDate(order.createdAt)}</p>
        </div>
        <p className="text-sm font-bold text-fg whitespace-nowrap">{formatPrice(order.total)}</p>
      </div>
      <p className="text-xs font-mono text-faint">{order.number}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="neutral">{itemCount} item{itemCount > 1 ? 's' : ''}</Badge>
        {rx && (
          <a href={`/api/prescriptions/file?id=${rx.id}`} target="_blank" rel="noopener noreferrer"
             className="inline-flex">
            <Badge variant="rx"><FileText size={10} aria-hidden /> Rx <ExternalLink size={9} aria-hidden /></Badge>
          </a>
        )}
        {coldChain && <Badge variant="cold"><Snowflake size={10} aria-hidden /> Cold</Badge>}
      </div>
      {next && (
        <Button size="sm" variant="outline" className="w-full" disabled={busy}
          onClick={() => onAdvance(order, next)}>
          {ui === 'pending_rx' ? 'Verify Rx' : `Move to ${ORDER_STATUS_LABELS[next]}`}
          <ChevronRight size={13} aria-hidden />
        </Button>
      )}
    </div>
  )
}

export default function OrdersPipelinePage() {
  const [orders, setOrders] = useState<LiveOrder[]>([])
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/orders')
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders ?? [])
    } else if (res.status === 401) {
      toast('Sign in with a pharmacist or admin account', { kind: 'info' })
    }
    setLoaded(true)
  }, [])

  useEffect(() => { load() }, [load])

  const advance = async (order: LiveOrder, next: OrderStatus) => {
    setBusy(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, action: 'status', status: next.toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error || 'Could not update order', { kind: 'error' })
        return
      }
      setOrders(os => os.map(o => (o.id === order.id ? { ...o, status: next.toUpperCase() } : o)))
      toast(`${order.number} → ${ORDER_STATUS_LABELS[next]}`, { kind: 'success' })
    } catch {
      toast('Network error — please try again', { kind: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const awaiting = orders.filter(o => o.status === 'AWAITING_CONFIRMATION')
  const cancelled = orders.filter(o => o.status === 'CANCELLED')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-fg">Order Pipeline</h1>
        <p className="text-sm text-muted mt-0.5">
          {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length} active ·{' '}
          {orders.filter(o => o.status === 'PENDING_RX').length} awaiting Rx verification
        </p>
      </div>

      {!loaded && <p className="text-sm text-muted">Loading orders…</p>}

      {awaiting.length > 0 && (
        <div className="card p-4 border-primary/30 bg-primary-soft/50">
          <h2 className="text-sm font-semibold text-fg mb-2 flex items-center gap-2">
            <Hourglass size={14} className="text-primary" aria-hidden />
            Waiting for patient confirmation ({awaiting.length})
          </h2>
          {awaiting.map(o => (
            <p key={o.id} className="text-xs text-muted font-mono">
              {o.number} · {o.user.name} · {formatPrice(o.total)}
            </p>
          ))}
        </div>
      )}

      {/* Kanban on desktop, stacked sections on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {PIPELINE_STATUSES.map(status => {
          const col = orders.filter(o => toUi(o.status) === status)
          return (
            <section
              key={status}
              aria-label={ORDER_STATUS_LABELS[status]}
              className="w-64 flex-shrink-0 snap-start"
            >
              <div className={cn(
                'flex items-center justify-between px-3 py-2 rounded-t-xl border border-b-0 border-border',
                status === 'pending_rx' ? 'bg-warning/10' : status === 'delivered' ? 'bg-accent/10' : 'bg-surface-2'
              )}>
                <h2 className="text-xs font-bold text-fg uppercase tracking-wide">{ORDER_STATUS_LABELS[status]}</h2>
                <span className="text-xs font-bold text-muted bg-surface rounded-full w-5 h-5 flex items-center justify-center">
                  {col.length}
                </span>
              </div>
              <div className="border border-border rounded-b-xl p-2 space-y-2 min-h-[80px] bg-bg">
                {col.length === 0 ? (
                  <p className="text-xs text-faint text-center py-4">Empty</p>
                ) : (
                  col.map(o => <OrderCard key={o.id} order={o} onAdvance={advance} busy={busy} />)
                )}
              </div>
            </section>
          )
        })}
      </div>

      {cancelled.length > 0 && (
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-muted mb-2">Cancelled ({cancelled.length})</h2>
          {cancelled.map(o => (
            <p key={o.id} className="text-xs text-faint font-mono">{o.number} · {o.user.name} · {formatPrice(o.total)}</p>
          ))}
        </div>
      )}
    </div>
  )
}
