'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Trash2, Plus, Minus, FileText, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCartStore()
  const subtotal = total()
  const delivery = subtotal > 999 ? 0 : 99
  const finalTotal = subtotal + delivery

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
      <h1 className="font-display font-bold text-2xl text-brand-dark mb-2">Your cart is empty</h1>
      <p className="text-brand-slate mb-6">Add specialty medicines to get started</p>
      <Link href="/medicines" className="btn-primary inline-block">Browse Medicines</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-brand-dark mb-8">
        Your Cart <span className="text-brand-slate text-xl font-normal">({itemCount()} items)</span>
      </h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ medicine, quantity, prescriptionUploaded }) => (
            <div key={medicine.id} className="card p-4 flex gap-4">
              <div className="relative w-20 h-20 bg-brand-grey rounded-xl overflow-hidden flex-shrink-0">
                <Image src={medicine.imageUrl} alt={medicine.name} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/medicines/${medicine.id}`}
                  className="font-display font-semibold text-brand-dark text-sm hover:text-brand-blue transition-colors line-clamp-1">
                  {medicine.name}
                </Link>
                <p className="text-xs text-brand-slate">{medicine.genericName}</p>
                <div className="flex items-center gap-2 mt-1">
                  {medicine.requiresPrescription && (
                    <span className="badge-rx text-xs"><FileText size={10} /> Rx Required</span>
                  )}
                  {medicine.requiresPrescription && !prescriptionUploaded && (
                    <button className="text-xs text-brand-orange font-semibold underline">Upload Prescription</button>
                  )}
                  {prescriptionUploaded && (
                    <span className="text-xs text-brand-teal font-semibold">✓ Rx Uploaded</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(medicine.id, quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-brand-ice transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button onClick={() => updateQuantity(medicine.id, quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-brand-ice transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-brand-blue">{formatPrice(medicine.drmedPrice * quantity)}</p>
                    <p className="text-xs text-gray-400 line-through">{formatPrice(medicine.mrp * quantity)}</p>
                  </div>
                  <button onClick={() => removeItem(medicine.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-brand-dark mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-slate">Subtotal ({itemCount()} items)</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-slate">Delivery</span>
                <span className={delivery === 0 ? 'text-brand-teal font-semibold' : 'font-semibold'}>
                  {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                </span>
              </div>
              {delivery === 0 && (
                <p className="text-xs text-brand-teal">🎉 You qualify for free delivery!</p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-brand-dark">Total</span>
                <span className="font-display font-bold text-xl text-brand-blue">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mt-5">
              <div className="flex gap-2">
                <input type="text" placeholder="Coupon code" className="input-field text-xs py-2" />
                <button className="btn-outline text-xs px-4 py-2 whitespace-nowrap">Apply</button>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center mt-5">
              Proceed to Checkout →
            </Link>
          </div>

          <div className="card p-4 text-xs text-brand-slate space-y-1.5">
            <p>✅ 100% genuine medicines</p>
            <p>🔒 Secure payment with Razorpay</p>
            <p>↩️ Easy returns within 7 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
