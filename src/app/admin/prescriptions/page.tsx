'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { FileText, ExternalLink, Plus, Minus, Trash2 } from 'lucide-react'
import { MEDICINES } from '@/lib/mockData'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toaster'

interface PendingRx {
  id: string
  createdAt: string
  userId: string | null
  user: { name: string; phone: string } | null
  aiSuggestions?: { id: string | null; name: string; note?: string }[]
}

interface PickedItem {
  medicineId: string
  quantity: number
}

export default function AdminPrescriptionsPage() {
  const { data: session, status: authStatus } = useSession()
  const [pending, setPending] = useState<PendingRx[]>([])
  const [loaded, setLoaded] = useState(false)
  const [activeRx, setActiveRx] = useState<PendingRx | null>(null)
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<PickedItem[]>([])
  const [creating, setCreating] = useState(false)

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'PHARMACIST'

  const load = useCallback(async () => {
    const res = await fetch('/api/prescriptions')
    if (res.ok) {
      const data = await res.json()
      setPending((data.prescriptions ?? []).filter((p: PendingRx) => p.userId))
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (isStaff) load()
  }, [isStaff, load])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return MEDICINES.filter(
      m => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [query])

  const addMedicine = (medicineId: string) => {
    setPicked(p =>
      p.some(i => i.medicineId === medicineId)
        ? p.map(i => (i.medicineId === medicineId ? { ...i, quantity: i.quantity + 1 } : i))
        : [...p, { medicineId, quantity: 1 }]
    )
    setQuery('')
  }

  const changeQty = (medicineId: string, delta: number) => {
    setPicked(p =>
      p
        .map(i => (i.medicineId === medicineId ? { ...i, quantity: i.quantity + delta } : i))
        .filter(i => i.quantity > 0)
    )
  }

  const total = picked.reduce((s, i) => {
    const m = MEDICINES.find(x => x.id === i.medicineId)
    return s + (m ? m.halftabletPrice * i.quantity : 0)
  }, 0)

  const createOrder = async () => {
    if (!activeRx?.userId || picked.length === 0) return
    setCreating(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: picked,
          address: {},
          forUserId: activeRx.userId,
          prescriptionId: activeRx.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error || 'Could not create order', { kind: 'error' })
        return
      }
      toast(`Order ${data.order.number} prepared — patient will confirm it`, { kind: 'success' })
      setActiveRx(null)
      setPicked([])
      load()
    } catch {
      toast('Network error — please try again', { kind: 'error' })
    } finally {
      setCreating(false)
    }
  }

  if (authStatus === 'loading') return <div className="max-w-5xl mx-auto px-4 py-12 text-muted text-sm">Loading…</div>
  if (!isStaff) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-fg font-semibold">Pharmacist access required</p>
        <p className="text-sm text-muted mt-1">Sign in with a pharmacist or admin account.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-2xl text-fg mb-1">Prescription Review</h1>
      <p className="text-sm text-muted mb-8">
        Patients uploaded these prescriptions. Read each one, pick the medicines it prescribes, and
        prepare the order — the patient then confirms and pays.
      </p>

      {!loaded && <p className="text-sm text-muted">Loading…</p>}
      {loaded && pending.length === 0 && (
        <div className="card p-8 text-center text-sm text-muted">No prescriptions waiting for review. 🎉</div>
      )}

      <div className="space-y-4">
        {pending.map(rx => (
          <div key={rx.id} className="card p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                  <FileText size={18} aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-fg">{rx.user?.name ?? 'Patient'}</p>
                  <p className="text-xs text-muted">
                    {rx.user?.phone} · uploaded{' '}
                    {new Date(rx.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/prescriptions/file?id=${rx.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1"
                >
                  View file <ExternalLink size={13} aria-hidden />
                </a>
                <Button
                  size="sm"
                  variant={activeRx?.id === rx.id ? 'outline' : 'primary'}
                  onClick={() => {
                    const opening = activeRx?.id !== rx.id
                    setActiveRx(opening ? rx : null)
                    // Pre-fill with the medicines AI read from the Rx (pharmacist verifies)
                    setPicked(
                      opening
                        ? (rx.aiSuggestions ?? [])
                            .filter(s => s.id)
                            .map(s => ({ medicineId: s.id as string, quantity: 1 }))
                        : []
                    )
                  }}
                >
                  {activeRx?.id === rx.id ? 'Close' : 'Prepare Order'}
                </Button>
              </div>
            </div>

            {activeRx?.id === rx.id && (
              <div className="mt-5 border-t border-border pt-5">
                {(rx.aiSuggestions?.length ?? 0) > 0 && (
                  <p className="text-xs text-muted mb-3">
                    🤖 AI read from this Rx:{' '}
                    {rx.aiSuggestions!.map(s => s.name + (s.note ? ` (${s.note})` : '')).join(' · ')}
                    {' '}— catalog matches are pre-added below; verify against the file.
                  </p>
                )}
                <Input
                  label="Add medicine from catalog"
                  name="medicine-search"
                  placeholder="Search by name or salt…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {results.length > 0 && (
                  <div className="mt-2 card divide-y divide-border overflow-hidden">
                    {results.map(m => (
                      <button
                        key={m.id}
                        className="w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors flex items-center justify-between gap-3"
                        onClick={() => addMedicine(m.id)}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-fg truncate">{m.name}</span>
                          <span className="block text-xs text-muted truncate">{m.genericName}</span>
                        </span>
                        <span className="text-sm font-semibold text-fg whitespace-nowrap">{formatPrice(m.halftabletPrice)}</span>
                      </button>
                    ))}
                  </div>
                )}

                {picked.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {picked.map(i => {
                      const m = MEDICINES.find(x => x.id === i.medicineId)
                      if (!m) return null
                      return (
                        <div key={i.medicineId} className="flex items-center justify-between gap-3 bg-surface-2 rounded-xl px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-fg truncate">{m.name}</p>
                            <p className="text-xs text-muted">
                              {formatPrice(m.halftabletPrice)} each
                              {m.requiresPrescription && <Badge variant="rx" className="ml-2">Rx</Badge>}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1 rounded-lg hover:bg-surface" onClick={() => changeQty(i.medicineId, -1)} aria-label="Decrease">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">{i.quantity}</span>
                            <button className="p-1 rounded-lg hover:bg-surface" onClick={() => changeQty(i.medicineId, 1)} aria-label="Increase">
                              <Plus size={14} />
                            </button>
                            <button className="p-1 rounded-lg hover:bg-surface text-danger ml-1" onClick={() => changeQty(i.medicineId, -i.quantity)} aria-label="Remove">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex items-center justify-between pt-3">
                      <p className="text-sm text-muted">
                        Subtotal <strong className="text-fg">{formatPrice(total)}</strong>
                        <span className="text-xs"> + delivery {total > 999 ? '(free)' : formatPrice(99)}</span>
                      </p>
                      <Button onClick={createOrder} disabled={creating}>
                        {creating ? 'Creating…' : 'Create Order for Patient'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
