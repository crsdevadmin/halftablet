'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Upload, CreditCard, Smartphone, Banknote } from 'lucide-react'

const STEPS = ['Cart Review', 'Delivery & Rx', 'Payment']

export default function CheckoutPage() {
  const [step, setStep] = useState(0)
  const [payMethod, setPayMethod] = useState('upi')
  const { items, total, clearCart } = useCartStore()
  const [ordered, setOrdered] = useState(false)
  const subtotal = total()
  const delivery = subtotal > 999 ? 0 : 99

  const handleOrder = () => {
    clearCart()
    setOrdered(true)
  }

  if (ordered) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-brand-teal" />
      </div>
      <h1 className="font-display font-bold text-3xl text-brand-dark mb-3">Order Placed!</h1>
      <p className="text-brand-slate mb-2">Order ID: <strong className="text-brand-dark">ORD-2026-{Math.floor(Math.random()*9000+1000)}</strong></p>
      <p className="text-brand-slate mb-6 text-sm">Our pharmacist will review your prescription within 2–4 hours. You&apos;ll receive a WhatsApp confirmation.</p>
      <a href="/account/orders" className="btn-primary inline-block">Track My Order</a>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-2xl text-brand-dark mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-blue' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${i < step ? 'bg-brand-blue border-brand-blue text-white'
                  : i === step ? 'border-brand-blue text-brand-blue'
                  : 'border-gray-200 text-gray-400'}`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < step ? 'bg-brand-blue' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {/* Step 0: Review */}
          {step === 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-display font-semibold text-lg text-brand-dark">Review Cart</h2>
              {items.map(({ medicine, quantity }) => (
                <div key={medicine.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{medicine.name}</p>
                    <p className="text-xs text-brand-slate">Qty: {quantity}</p>
                  </div>
                  <p className="font-bold text-brand-blue">{formatPrice(medicine.drmedPrice * quantity)}</p>
                </div>
              ))}
              <button onClick={() => setStep(1)} className="btn-primary w-full mt-4">Continue to Delivery →</button>
            </div>
          )}

          {/* Step 1: Delivery + Rx */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg text-brand-dark">Delivery Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input className="input-field" placeholder="Full Name" />
                  <input className="input-field" placeholder="Phone Number" />
                  <input className="input-field sm:col-span-2" placeholder="Address Line 1" />
                  <input className="input-field sm:col-span-2" placeholder="Address Line 2 (optional)" />
                  <input className="input-field" placeholder="City" />
                  <input className="input-field" placeholder="State" />
                  <input className="input-field" placeholder="PIN Code" />
                </div>
              </div>

              {items.some(i => i.medicine.requiresPrescription) && (
                <div className="card p-6">
                  <h2 className="font-display font-semibold text-lg text-brand-dark mb-4">Upload Prescription</h2>
                  <div className="border-2 border-dashed border-brand-blue/30 rounded-xl p-8 text-center bg-brand-ice/50 hover:bg-brand-ice transition-colors cursor-pointer">
                    <Upload size={32} className="mx-auto text-brand-blue mb-3" />
                    <p className="font-semibold text-brand-dark text-sm">Click to upload or drag & drop</p>
                    <p className="text-xs text-brand-slate mt-1">JPG, PNG or PDF · Max 10MB per file</p>
                    <button className="btn-outline text-sm mt-4 px-6">Choose File</button>
                  </div>
                  <p className="text-xs text-brand-slate mt-3">
                    💡 Our licensed pharmacist will verify your prescription within 2–4 hours. You&apos;ll be notified on WhatsApp.
                  </p>
                </div>
              )}

              <button onClick={() => setStep(2)} className="btn-primary w-full">Continue to Payment →</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-semibold text-lg text-brand-dark">Choose Payment Method</h2>
              {[
                { id: 'upi', icon: <Smartphone size={18} />, label: 'UPI', desc: 'PhonePe, GPay, Paytm & more' },
                { id: 'card', icon: <CreditCard size={18} />, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                { id: 'cod', icon: <Banknote size={18} />, label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
              ].map(m => (
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${payMethod === m.id ? 'border-brand-blue bg-brand-ice' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="pay" value={m.id} checked={payMethod === m.id}
                    onChange={() => setPayMethod(m.id)} className="accent-brand-blue" />
                  <span className={payMethod === m.id ? 'text-brand-blue' : 'text-brand-slate'}>{m.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-brand-dark">{m.label}</p>
                    <p className="text-xs text-brand-slate">{m.desc}</p>
                  </div>
                </label>
              ))}
              <button onClick={handleOrder} className="btn-primary w-full mt-2">
                Place Order · {formatPrice(subtotal + delivery)}
              </button>
              <p className="text-center text-xs text-brand-slate">
                🔒 Secured by Razorpay · 256-bit SSL encryption
              </p>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="card p-5 h-fit space-y-3">
          <h3 className="font-semibold text-brand-dark">Order Summary</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between text-brand-slate"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-brand-slate"><span>Delivery</span><span className={delivery === 0 ? 'text-brand-teal' : ''}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span><span className="text-brand-blue text-lg">{formatPrice(subtotal + delivery)}</span>
            </div>
          </div>
          <div className="text-xs text-brand-teal font-semibold">
            You save {formatPrice(items.reduce((s, i) => s + (i.medicine.mrp - i.medicine.drmedPrice) * i.quantity, 0))} on this order!
          </div>
        </div>
      </div>
    </div>
  )
}
