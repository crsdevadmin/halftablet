'use client'
import { useState } from 'react'
import { FileText, Snowflake, ChevronRight } from 'lucide-react'
import {
  ADMIN_ORDERS, ORDER_STATUS_LABELS, PIPELINE_STATUSES, type AdminOrder,
} from '@/lib/adminData'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toaster'
import { OrderStatus } from '@/types'

function OrderCard({ order, onAdvance }: { order: AdminOrder; onAdvance: (o: AdminOrder) => void }) {
  const next = PIPELINE_STATUSES[PIPELINE_STATUSES.indexOf(order.status) + 1]
  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg truncate">{order.customer}</p>
          <p className="text-xs text-muted">{order.city} · {formatDate(order.createdAt)}</p>
        </div>
        <p className="text-sm font-bold text-fg whitespace-nowrap">{formatPrice(order.total)}</p>
      </div>
      <p className="text-xs font-mono text-faint">{order.id}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="neutral">{order.itemCount} item{order.itemCount > 1 ? 's' : ''}</Badge>
        {order.requiresRx && <Badge variant="rx"><FileText size={10} aria-hidden /> Rx</Badge>}
        {order.coldChain && <Badge variant="cold"><Snowflake size={10} aria-hidden /> Cold</Badge>}
      </div>
      {next && (
        <Button size="sm" variant="outline" className="w-full" onClick={() => onAdvance(order)}>
          {order.status === 'pending_rx' ? 'Verify Rx' : `Move to ${ORDER_STATUS_LABELS[next]}`}
          <ChevronRight size={13} aria-hidden />
        </Button>
      )}
    </div>
  )
}

export default function OrdersPipelinePage() {
  const [orders, setOrders] = useState(ADMIN_ORDERS)

  const advance = (order: AdminOrder) => {
    const next = PIPELINE_STATUSES[PIPELINE_STATUSES.indexOf(order.status) + 1] as OrderStatus | undefined
    if (!next) return
    setOrders(os => os.map(o => o.id === order.id ? { ...o, status: next } : o))
    toast(`${order.id} → ${ORDER_STATUS_LABELS[next]}`, { kind: 'success' })
  }

  const cancelled = orders.filter(o => o.status === 'cancelled')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-fg">Order Pipeline</h1>
        <p className="text-sm text-muted mt-0.5">
          {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} active ·{' '}
          {orders.filter(o => o.status === 'pending_rx').length} awaiting Rx verification
        </p>
      </div>

      {/* Kanban on desktop, stacked sections on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {PIPELINE_STATUSES.map(status => {
          const col = orders.filter(o => o.status === status)
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
                  col.map(o => <OrderCard key={o.id} order={o} onAdvance={advance} />)
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
            <p key={o.id} className="text-xs text-faint font-mono">{o.id} · {o.customer} · {formatPrice(o.total)}</p>
          ))}
        </div>
      )}
    </div>
  )
}
