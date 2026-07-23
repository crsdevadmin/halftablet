'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FileText, Upload, CheckCircle2, Clock, XCircle, Package, Plus, Minus, Trash2 } from 'lucide-react'
import { MEDICINES } from '@/lib/mockData'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toaster'
import { formatPrice } from '@/lib/utils'

interface RxItem {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  aiSuggestions?: { id: string | null; name: string; note?: string }[]
  requestedItems?: { medicineId: string; quantity: number }[]
  order: { id: string; number: string; status: string; total: number } | null
}

type SelItem = { medicineId: string; quantity: number }

/** Patient's working selection: their saved choice, else AI catalog matches */
function initialSelection(rx: RxItem): SelItem[] {
  if (rx.requestedItems?.length) return rx.requestedItems
  return (rx.aiSuggestions ?? [])
    .filter(s => s.id)
    .map(s => ({ medicineId: s.id as string, quantity: 1 }))
}

const RX_BADGE: Record<RxItem['status'], { variant: BadgeVariant; label: string; icon: React.ReactNode }> = {
  PENDING: { variant: 'warning', label: 'Awaiting pharmacist review', icon: <Clock size={13} aria-hidden /> },
  APPROVED: { variant: 'success', label: 'Approved', icon: <CheckCircle2 size={13} aria-hidden /> },
  REJECTED: { variant: 'danger', label: 'Rejected', icon: <XCircle size={13} aria-hidden /> },
}

const EMPTY_ADDRESS = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' }

export default function UploadRxPage() {
  const { data: session, status: authStatus } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [items, setItems] = useState<RxItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [placing, setPlacing] = useState(false)
  const [editRxId, setEditRxId] = useState<string | null>(null)
  const [editItems, setEditItems] = useState<SelItem[]>([])
  const [medQuery, setMedQuery] = useState('')
  const [savingSel, setSavingSel] = useState(false)

  const searchResults = medQuery.trim()
    ? MEDICINES.filter(m => {
        const q = medQuery.trim().toLowerCase()
        return m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)
      }).slice(0, 5)
    : []

  const changeSelQty = (medicineId: string, delta: number) =>
    setEditItems(p =>
      p
        .map(i => (i.medicineId === medicineId ? { ...i, quantity: i.quantity + delta } : i))
        .filter(i => i.quantity > 0)
    )

  const addSelMedicine = (medicineId: string) => {
    setEditItems(p =>
      p.some(i => i.medicineId === medicineId)
        ? p.map(i => (i.medicineId === medicineId ? { ...i, quantity: i.quantity + 1 } : i))
        : [...p, { medicineId, quantity: 1 }]
    )
    setMedQuery('')
  }

  const saveSelection = async (rxId: string) => {
    setSavingSel(true)
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rxId, action: 'items', items: editItems }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error || 'Could not save your selection', { kind: 'error' })
        return
      }
      toast('Selection saved — our pharmacist will verify it against your prescription', { kind: 'success' })
      setEditRxId(null)
      load()
    } catch {
      toast('Network error — please try again', { kind: 'error' })
    } finally {
      setSavingSel(false)
    }
  }

  const load = useCallback(async () => {
    const res = await fetch('/api/prescriptions')
    if (res.ok) {
      const data = await res.json()
      setItems(data.prescriptions ?? [])
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (session?.user) load()
  }, [session, load])

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/prescriptions', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error || 'Upload failed', { kind: 'error' })
        return
      }
      toast('Prescription uploaded! Our pharmacist will review it within 2–4 hours.', { kind: 'success' })
      load()
    } catch {
      toast('Network error — please try again', { kind: 'error' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const setField = (key: keyof typeof EMPTY_ADDRESS) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setAddress(a => ({ ...a, [key]: e.target.value }))

  const confirmOrder = async (orderId: string) => {
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
      toast(`Order ${data.order.number} confirmed! Pay cash on delivery.`, { kind: 'success' })
      setConfirmingId(null)
      load()
    } catch {
      toast('Network error — please try again', { kind: 'error' })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-4">
          <FileText size={26} aria-hidden />
        </div>
        <h1 className="font-display font-bold text-3xl text-fg">Upload Your Prescription</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Upload a photo or PDF of your prescription. Our licensed pharmacist reads it, prepares your
          order with the right medicines, and you just confirm it — no searching needed.
        </p>
      </div>

      {authStatus === 'unauthenticated' && (
        <div className="card p-8 text-center">
          <p className="text-fg font-semibold mb-2">Sign in to upload your prescription</p>
          <p className="text-sm text-muted mb-5">We link your prescription to your account so you can track it.</p>
          <Link href="/login?callbackUrl=/upload-rx" className={buttonVariants('primary', 'lg')}>
            Sign In with Mobile Number
          </Link>
        </div>
      )}

      {session?.user && (
        <>
          <div
            className="card border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary transition-colors mb-8"
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={e => handleUpload(e.target.files?.[0])}
            />
            <Upload size={28} className="mx-auto text-primary mb-3" aria-hidden />
            <p className="font-semibold text-fg text-sm">Click to upload your prescription</p>
            <p className="text-xs text-muted mt-1">JPG, PNG or PDF · Max 10MB</p>
            <Button variant="outline" size="sm" className="mt-4 px-6" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Choose File'}
            </Button>
          </div>

          <h2 className="font-display font-semibold text-lg text-fg mb-4">My Prescriptions</h2>
          {!loaded && <p className="text-sm text-muted">Loading…</p>}
          {loaded && items.length === 0 && (
            <p className="text-sm text-muted">No prescriptions uploaded yet.</p>
          )}
          <div className="space-y-4">
            {items.map(rx => {
              const badge = RX_BADGE[rx.status]
              const awaiting = rx.order?.status === 'AWAITING_CONFIRMATION'
              return (
                <div key={rx.id} className="card p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-fg">
                        Prescription · {new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {rx.order && (
                        <p className="text-xs text-muted mt-0.5">
                          Order <span className="font-mono">{rx.order.number}</span> · {formatPrice(rx.order.total)}
                        </p>
                      )}
                    </div>
                    <Badge variant={badge.variant}>{badge.icon} {badge.label}</Badge>
                  </div>

                  {rx.status === 'PENDING' && !rx.order && (() => {
                    const editing = editRxId === rx.id
                    const selection = editing ? editItems : initialSelection(rx)
                    const unmatched = (rx.aiSuggestions ?? []).filter(s => !s.id)
                    const selTotal = selection.reduce((s, i) => {
                      const m = MEDICINES.find(x => x.id === i.medicineId)
                      return s + (m ? m.halftabletPrice * i.quantity : 0)
                    }, 0)
                    return (
                      <div className="mt-3 bg-surface-2 rounded-xl p-4">
                        <p className="text-xs font-semibold text-fg mb-2">
                          💊 {rx.requestedItems?.length ? 'Your medicine selection' : 'Medicines we read from your prescription'}
                          <span className="font-normal text-muted"> — our pharmacist will verify before preparing your order</span>
                        </p>

                        {selection.length === 0 && !editing && (
                          <p className="text-sm text-muted">No medicines selected yet — add what you need below.</p>
                        )}

                        <ul className="space-y-2">
                          {selection.map(item => {
                            const m = MEDICINES.find(x => x.id === item.medicineId)
                            if (!m) return null
                            const note = rx.aiSuggestions?.find(s => s.id === item.medicineId)?.note
                            return (
                              <li key={item.medicineId} className="text-sm flex items-center gap-2 bg-surface rounded-lg px-3 py-2">
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold text-fg">{m.name}</span>
                                  {note && <span className="text-xs text-muted ml-2">{note}</span>}
                                  <span className="block text-xs text-muted">{formatPrice(m.halftabletPrice)} each</span>
                                </div>
                                {editing ? (
                                  <div className="flex items-center gap-1.5">
                                    <button className="p-1 rounded-lg hover:bg-surface-2" onClick={() => changeSelQty(m.id, -1)} aria-label="Decrease">
                                      <Minus size={13} />
                                    </button>
                                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                                    <button className="p-1 rounded-lg hover:bg-surface-2" onClick={() => changeSelQty(m.id, 1)} aria-label="Increase">
                                      <Plus size={13} />
                                    </button>
                                    <button className="p-1 rounded-lg hover:bg-surface-2 text-danger" onClick={() => changeSelQty(m.id, -item.quantity)} aria-label="Remove">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted whitespace-nowrap">× {item.quantity}</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>

                        {unmatched.length > 0 && (
                          <p className="text-xs text-muted mt-2">
                            Also on your Rx (not in our catalog — pharmacist will advise): {unmatched.map(s => s.name).join(', ')}
                          </p>
                        )}

                        {editing && (
                          <div className="mt-3">
                            <Input
                              label="Add another medicine"
                              name="med-search"
                              placeholder="Search by name or salt…"
                              value={medQuery}
                              onChange={e => setMedQuery(e.target.value)}
                            />
                            {searchResults.length > 0 && (
                              <div className="mt-1 card divide-y divide-border overflow-hidden">
                                {searchResults.map(m => (
                                  <button
                                    key={m.id}
                                    className="w-full text-left px-3 py-2 hover:bg-surface-2 transition-colors flex items-center justify-between gap-2 text-sm"
                                    onClick={() => addSelMedicine(m.id)}
                                  >
                                    <span className="min-w-0">
                                      <span className="block font-semibold text-fg truncate">{m.name}</span>
                                      <span className="block text-xs text-muted truncate">{m.genericName}</span>
                                    </span>
                                    <span className="font-semibold whitespace-nowrap">{formatPrice(m.halftabletPrice)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                          <p className="text-xs text-muted">
                            Estimated total <strong className="text-fg">{formatPrice(selTotal)}</strong>
                          </p>
                          {editing ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveSelection(rx.id)} disabled={savingSel}>
                                {savingSel ? 'Saving…' : 'Save Selection'}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditRxId(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditRxId(rx.id)
                                setEditItems(initialSelection(rx))
                                setMedQuery('')
                              }}
                            >
                              Adjust Medicines
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {rx.status !== 'PENDING' && (rx.aiSuggestions?.length ?? 0) > 0 && !rx.order && (
                    <p className="text-xs text-muted mt-2">
                      Read from your Rx: {rx.aiSuggestions!.map(s => s.name).join(', ')}
                    </p>
                  )}

                  {awaiting && rx.order && (
                    <div className="mt-4 bg-primary-soft rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-fg mb-1">
                        <Package size={16} className="text-primary" aria-hidden />
                        Your order is ready — total {formatPrice(rx.order.total)}
                      </div>
                      <p className="text-xs text-muted mb-3">
                        Our pharmacist prepared this order from your prescription. Confirm to place it (cash on delivery).
                      </p>
                      {confirmingId === rx.order.id ? (
                        <div className="space-y-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Input label="Full Name" name="name" value={address.name} onChange={setField('name')} />
                            <Input label="Phone Number" name="phone" type="tel" inputMode="numeric" value={address.phone} onChange={setField('phone')} />
                            <Input label="Address Line 1" name="address1" value={address.line1} onChange={setField('line1')} />
                            <Input label="Address Line 2 (optional)" name="address2" value={address.line2} onChange={setField('line2')} />
                            <Input label="City" name="city" value={address.city} onChange={setField('city')} />
                            <Input label="PIN Code" name="pincode" inputMode="numeric" maxLength={6} value={address.pincode} onChange={setField('pincode')} />
                          </div>
                          <div className="flex gap-3">
                            <Button size="sm" onClick={() => confirmOrder(rx.order!.id)} disabled={placing}>
                              {placing ? 'Placing…' : 'Confirm Order'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setConfirmingId(rx.order!.id)}>Review & Confirm</Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
