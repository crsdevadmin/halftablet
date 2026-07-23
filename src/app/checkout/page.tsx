'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Upload, CreditCard, Smartphone, Banknote } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'
import { cn } from '@/lib/utils'
import { SafetyWarnings } from '@/components/cart/SafetyWarnings'

const STEPS = ['Cart Review', 'Delivery & Rx', 'Payment']

import { EMPTY_ADDRESS, loadSavedAddress, saveAddress } from '@/lib/address'

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [payMethod, setPayMethod] = useState('upi')
  const { items, total, clearCart } = useCartStore()
  const [ordered, setOrdered] = useState<{ number: string; id: string; status: string } | null>(null)
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [placing, setPlacing] = useState(false)

  // Prefill the saved delivery address
  useEffect(() => { setAddress(loadSavedAddress()) }, [])
  const subtotal = total()
  const delivery = subtotal > 999 ? 0 : 99

  const setField = (key: keyof typeof EMPTY_ADDRESS) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setAddress(a => ({ ...a, [key]: e.target.value }))

  const handleOrder = async () => {
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ medicineId: i.medicine.id, quantity: i.quantity })),
          address,
        }),
      })
      if (res.status === 401) {
        toast('Please sign in to place your order', { kind: 'info' })
        router.push('/login?callbackUrl=/checkout')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        toast(data.error || 'Order failed', { kind: 'error' })
        return
      }
      saveAddress(address)
      clearCart()
      setOrdered({ number: data.order.number, id: data.order.id, status: data.order.status })
    } catch {
      toast('Network error — is the dev server and database running?', { kind: 'error' })
    } finally {
      setPlacing(false)
    }
  }

  if (ordered) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-accent" />
      </div>
      <h1 className="font-display font-bold text-3xl text-fg mb-3">Order Placed!</h1>
      <p className="text-muted mb-2">Order ID: <strong className="text-fg">{ordered.number}</strong></p>
      <p className="text-muted mb-6 text-sm">Our pharmacist will review your prescription within 2–4 hours. You&apos;ll receive a WhatsApp confirmation.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/account" className={buttonVariants('primary', 'lg')}>Track My Order</a>
        {ordered.status !== 'PENDING_RX' && (
          <a href={`/api/orders/invoice?id=${ordered.id}`} className={buttonVariants('outline', 'lg')}>
            Download GST Invoice
          </a>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-2xl text-fg mb-8">Checkout</h1>

      {/* Step indicator */}
      <ol className="flex items-center mb-10" aria-label="Checkout progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn('flex items-center gap-2', i <= step ? 'text-primary' : 'text-faint')}
              aria-current={i === step ? 'step' : undefined}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                i < step ? 'bg-primary border-primary text-white'
                  : i === step ? 'border-primary text-primary'
                  : 'border-border text-faint'
              )}>
                {i < step ? <CheckCircle size={16} aria-hidden /> : i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div aria-hidden className={cn('flex-1 h-0.5 mx-2 transition-colors', i < step ? 'bg-primary' : 'bg-border')} />
            )}
          </li>
        ))}
      </ol>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {/* Step 0: Review */}
          {step === 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-semibold text-lg text-fg">Review Cart</h2>
              <SafetyWarnings medicines={items.map(i => i.medicine)} />
              {items.map(({ medicine, quantity }) => (
                <div key={medicine.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-fg">{medicine.name}</p>
                    <p className="text-xs text-muted">Qty: {quantity}</p>
                  </div>
                  <p className="font-bold text-fg">{formatPrice(medicine.halftabletPrice * quantity)}</p>
                </div>
              ))}
              <Button size="lg" className="w-full mt-4" onClick={() => setStep(1)}>
                Continue to Delivery →
              </Button>
            </div>
          )}

          {/* Step 1: Delivery + Rx */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg text-fg">Delivery Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full Name" name="name" autoComplete="name" placeholder="e.g. Thirumurugan M" value={address.name} onChange={setField('name')} />
                  <Input label="Phone Number" name="phone" type="tel" autoComplete="tel" inputMode="numeric" placeholder="10-digit mobile number" value={address.phone} onChange={setField('phone')} />
                  <div className="sm:col-span-2">
                    <Input label="Address Line 1" name="address1" autoComplete="address-line1" placeholder="House / flat, street" value={address.line1} onChange={setField('line1')} />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="Address Line 2 (optional)" name="address2" autoComplete="address-line2" placeholder="Landmark, area" value={address.line2} onChange={setField('line2')} />
                  </div>
                  <Input label="City" name="city" autoComplete="address-level2" placeholder="City" value={address.city} onChange={setField('city')} />
                  <Input label="State" name="state" autoComplete="address-level1" placeholder="State" value={address.state} onChange={setField('state')} />
                  <Input label="PIN Code" name="pincode" autoComplete="postal-code" inputMode="numeric" maxLength={6} placeholder="6-digit PIN" value={address.pincode} onChange={setField('pincode')} />
                </div>
              </div>

              {items.some(i => i.medicine.requiresPrescription) && (
                <div className="card p-6">
                  <h2 className="font-display font-semibold text-lg text-fg mb-4">Upload Prescription</h2>
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-primary-soft/50 hover:bg-primary-soft transition-colors cursor-pointer">
                    <Upload size={32} className="mx-auto text-primary mb-3" aria-hidden />
                    <p className="font-semibold text-fg text-sm">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted mt-1">JPG, PNG or PDF · Max 10MB per file</p>
                    <Button variant="outline" size="sm" className="mt-4 px-6">Choose File</Button>
                  </div>
                  <p className="text-xs text-muted mt-3">
                    💡 Our licensed pharmacist will verify your prescription within 2–4 hours. You&apos;ll be notified on WhatsApp.
                  </p>
                </div>
              )}

              <Button size="lg" className="w-full" onClick={() => setStep(2)}>
                Continue to Payment →
              </Button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-semibold text-lg text-fg">Choose Payment Method</h2>
              {[
                { id: 'upi', icon: <Smartphone size={18} aria-hidden />, label: 'UPI', desc: 'PhonePe, GPay, Paytm & more' },
                { id: 'card', icon: <CreditCard size={18} aria-hidden />, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                { id: 'cod', icon: <Banknote size={18} aria-hidden />, label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
              ].map(m => (
                <label key={m.id} className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  payMethod === m.id ? 'border-primary bg-primary-soft' : 'border-border hover:border-faint'
                )}>
                  <input type="radio" name="pay" value={m.id} checked={payMethod === m.id}
                    onChange={() => setPayMethod(m.id)} className="accent-[rgb(var(--primary))]" />
                  <span className={payMethod === m.id ? 'text-primary' : 'text-muted'}>{m.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-fg">{m.label}</p>
                    <p className="text-xs text-muted">{m.desc}</p>
                  </div>
                </label>
              ))}
              <Button size="lg" className="w-full mt-2" onClick={handleOrder} loading={placing} disabled={items.length === 0}>
                Place Order · {formatPrice(subtotal + delivery)}
              </Button>
              <p className="text-center text-xs text-muted">
                🔒 Secured by Razorpay · 256-bit SSL encryption
              </p>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="card p-5 h-fit space-y-3">
          <h3 className="font-semibold text-fg">Order Summary</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>Delivery</span><span className={delivery === 0 ? 'text-accent' : ''}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span>Total</span><span className="text-fg text-lg">{formatPrice(subtotal + delivery)}</span>
            </div>
          </div>
          <div className="text-xs text-accent font-semibold">
            You save {formatPrice(items.reduce((s, i) => s + (i.medicine.mrp - i.medicine.halftabletPrice) * i.quantity, 0))} on this order!
          </div>
        </div>
      </div>
    </div>
  )
}
