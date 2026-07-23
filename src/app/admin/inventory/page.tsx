'use client'
import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, Snowflake, AlertTriangle } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'

type StockStatus = 'ok' | 'low' | 'out'

const STATUS_META: Record<StockStatus, { label: string; variant: BadgeVariant }> = {
  ok:  { label: 'In Stock',  variant: 'success' },
  low: { label: 'Low Stock', variant: 'warning' },
  out: { label: 'Out of Stock', variant: 'danger' },
}

interface StockMedicine {
  id: string
  name: string
  coldChain: boolean
  reorderLevel: number
  batches: { id: string; batchNo: string; expiry: string; qty: number }[]
}

type Filter = 'all' | 'low' | 'out' | 'expiring'

const daysToExpiry = (expiry: string) =>
  Math.round((new Date(expiry).getTime() - Date.now()) / 86_400_000)

const EMPTY_BATCH = { batchNo: '', expiry: '', qty: '' }

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<StockMedicine[]>([])
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [batchForm, setBatchForm] = useState(EMPTY_BATCH)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/inventory')
    if (res.ok) {
      setMedicines((await res.json()).medicines ?? [])
    } else {
      toast('Sign in with a pharmacist or admin account', { kind: 'info' })
    }
    setLoaded(true)
  }, [])

  useEffect(() => { load() }, [load])

  const addBatch = async (medicineId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId,
          batchNo: batchForm.batchNo,
          expiry: batchForm.expiry,
          qty: parseInt(batchForm.qty, 10),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error || 'Could not add batch', { kind: 'error' })
        return
      }
      toast('Batch added — stock updated', { kind: 'success' })
      setAddingFor(null)
      setBatchForm(EMPTY_BATCH)
      load()
    } catch {
      toast('Network error — please try again', { kind: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const rows = medicines.map(m => {
    const totalQty = m.batches.reduce((s, b) => s + b.qty, 0)
    const status: StockStatus = totalQty === 0 ? 'out' : totalQty <= m.reorderLevel ? 'low' : 'ok'
    const live = m.batches.filter(b => b.qty > 0)
    const soonestExpiry = live.length ? Math.min(...live.map(b => daysToExpiry(b.expiry))) : Infinity
    return { m, totalQty, status, soonestExpiry }
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
          <p className="text-sm text-muted mt-0.5">
            {loaded ? `${medicines.length} medicines · live batch-level stock` : 'Loading…'}
          </p>
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
        <div className="hidden sm:grid grid-cols-[1fr_90px_110px_120px_40px] gap-3 px-4 py-2.5 border-b border-border bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wide">
          <span>Medicine</span>
          <span className="text-right">Qty</span>
          <span>Status</span>
          <span>Next Expiry</span>
          <span />
        </div>

        {loaded && rows.length === 0 && (
          <p className="px-4 py-8 text-sm text-muted text-center">Nothing matches this filter.</p>
        )}

        {rows.map(({ m, totalQty, status, soonestExpiry }) => {
          const open = expanded === m.id
          return (
            <div key={m.id} className="border-b border-border last:border-0">
              <button
                onClick={() => setExpanded(open ? null : m.id)}
                aria-expanded={open}
                className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_90px_110px_120px_40px] gap-3 px-4 py-3 items-center text-left hover:bg-surface-2/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg truncate flex items-center gap-1.5">
                    {m.name}
                    {m.coldChain && <Snowflake size={12} className="text-primary flex-shrink-0" aria-label="Cold chain" />}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {m.batches.length} batch{m.batches.length === 1 ? '' : 'es'} · reorder at {m.reorderLevel}
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
                    {m.batches.map(b => {
                      const days = daysToExpiry(b.expiry)
                      return (
                        <div key={b.id} className="grid grid-cols-[1fr_80px_1fr] gap-3 px-3 py-2.5 border-t border-border text-sm items-center">
                          <span className="font-mono text-xs text-fg">{b.batchNo}</span>
                          <span className={cn('text-right font-semibold tabular-nums', b.qty === 0 ? 'text-danger' : 'text-fg')}>{b.qty}</span>
                          <span className={cn('text-xs', days <= 30 ? 'text-danger font-semibold' : days <= 90 ? 'text-warning font-semibold' : 'text-muted')}>
                            {formatDate(b.expiry)} {b.qty > 0 && days <= 90 && `(${days}d left)`}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {addingFor === m.id ? (
                    <div className="mt-3 space-y-3">
                      <div className="grid sm:grid-cols-3 gap-3">
                        <Input label="Batch No" name="batchNo" placeholder="e.g. IMB-4472"
                          value={batchForm.batchNo}
                          onChange={e => setBatchForm(f => ({ ...f, batchNo: e.target.value }))} />
                        <Input label="Expiry" name="expiry" type="date"
                          value={batchForm.expiry}
                          onChange={e => setBatchForm(f => ({ ...f, expiry: e.target.value }))} />
                        <Input label="Quantity" name="qty" inputMode="numeric" placeholder="e.g. 100"
                          value={batchForm.qty}
                          onChange={e => setBatchForm(f => ({ ...f, qty: e.target.value.replace(/\D/g, '') }))} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => addBatch(m.id)} disabled={saving}>
                          {saving ? 'Adding…' : 'Add Batch'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingFor(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => { setAddingFor(m.id); setBatchForm(EMPTY_BATCH) }}>
                        + Add batch
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
