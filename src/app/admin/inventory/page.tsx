'use client'
import { useState } from 'react'
import { ChevronDown, Snowflake, AlertTriangle } from 'lucide-react'
import { STOCK, stockSummary, daysToExpiry, type StockStatus } from '@/lib/adminData'
import { MEDICINES } from '@/lib/mockData'
import { formatDate, cn } from '@/lib/utils'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toaster'

const STATUS_META: Record<StockStatus, { label: string; variant: BadgeVariant }> = {
  ok:  { label: 'In Stock',  variant: 'success' },
  low: { label: 'Low Stock', variant: 'warning' },
  out: { label: 'Out of Stock', variant: 'danger' },
}

type Filter = 'all' | 'low' | 'out' | 'expiring'

export default function InventoryPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const rows = STOCK.map(rec => {
    const medicine = MEDICINES.find(m => m.id === rec.medicineId)!
    const { totalQty, status } = stockSummary(rec)
    const soonestExpiry = Math.min(...rec.batches.filter(b => b.qty > 0).map(b => daysToExpiry(b.expiry)))
    return { rec, medicine, totalQty, status, soonestExpiry }
  }).filter(r => {
    if (filter === 'low') return r.status === 'low'
    if (filter === 'out') return r.status === 'out'
    if (filter === 'expiring') return isFinite(r.soonestExpiry) && r.soonestExpiry <= 90
    return true
  })

  const filters: [Filter, string][] = [
    ['all', 'All'],
    ['low', 'Low stock'],
    ['out', 'Out of stock'],
    ['expiring', 'Expiring ≤90d'],
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-fg">Inventory</h1>
          <p className="text-sm text-muted mt-0.5">{STOCK.length} medicines · batch-level tracking</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              aria-pressed={filter === val}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
                filter === val
                  ? 'bg-primary text-white border-primary'
                  : 'text-muted border-border hover:border-primary hover:text-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Header row */}
        <div className="hidden sm:grid grid-cols-[1fr_90px_110px_120px_40px] gap-3 px-4 py-2.5 border-b border-border bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wide">
          <span>Medicine</span>
          <span className="text-right">Qty</span>
          <span>Status</span>
          <span>Next Expiry</span>
          <span />
        </div>

        {rows.length === 0 && (
          <p className="px-4 py-8 text-sm text-muted text-center">Nothing matches this filter.</p>
        )}

        {rows.map(({ rec, medicine, totalQty, status, soonestExpiry }) => {
          const open = expanded === rec.medicineId
          return (
            <div key={rec.medicineId} className="border-b border-border last:border-0">
              <button
                onClick={() => setExpanded(open ? null : rec.medicineId)}
                aria-expanded={open}
                className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_90px_110px_120px_40px] gap-3 px-4 py-3 items-center text-left hover:bg-surface-2/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg truncate flex items-center gap-1.5">
                    {medicine.name}
                    {medicine.coldChain && <Snowflake size={12} className="text-primary flex-shrink-0" aria-label="Cold chain" />}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {rec.batches.length} batch{rec.batches.length > 1 ? 'es' : ''} · reorder at {rec.reorderLevel}
                  </p>
                </div>
                <span className={cn(
                  'text-sm font-bold text-right tabular-nums',
                  status === 'out' ? 'text-danger' : status === 'low' ? 'text-warning' : 'text-fg'
                )}>
                  {totalQty}
                </span>
                <span className="hidden sm:block">
                  <Badge variant={STATUS_META[status].variant}>{STATUS_META[status].label}</Badge>
                </span>
                <span className={cn(
                  'hidden sm:flex items-center gap-1 text-xs font-medium',
                  !isFinite(soonestExpiry) ? 'text-faint' : soonestExpiry <= 30 ? 'text-danger' : soonestExpiry <= 90 ? 'text-warning' : 'text-muted'
                )}>
                  {isFinite(soonestExpiry) ? (
                    <>
                      {soonestExpiry <= 90 && <AlertTriangle size={12} aria-hidden />}
                      {soonestExpiry}d
                    </>
                  ) : '—'}
                </span>
                <ChevronDown size={16} className={cn('text-faint transition-transform justify-self-end', open && 'rotate-180')} aria-hidden />
              </button>

              {open && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="grid grid-cols-[1fr_80px_1fr] gap-3 px-3 py-2 bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wide">
                      <span>Batch</span><span className="text-right">Qty</span><span>Expiry</span>
                    </div>
                    {rec.batches.map(b => {
                      const days = daysToExpiry(b.expiry)
                      return (
                        <div key={b.batchNo} className="grid grid-cols-[1fr_80px_1fr] gap-3 px-3 py-2.5 border-t border-border text-sm items-center">
                          <span className="font-mono text-xs text-fg">{b.batchNo}</span>
                          <span className={cn('text-right font-semibold tabular-nums', b.qty === 0 ? 'text-danger' : 'text-fg')}>{b.qty}</span>
                          <span className={cn('text-xs', days <= 30 ? 'text-danger font-semibold' : days <= 90 ? 'text-warning font-semibold' : 'text-muted')}>
                            {formatDate(b.expiry)} {b.qty > 0 && days <= 90 && `(${days}d left)`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => toast(`Reorder request created for ${medicine.name}`, { kind: 'info' })}>
                      Create reorder request
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast('Batch entry arrives with the Phase 2 backend', { kind: 'info' })}>
                      + Add batch
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
