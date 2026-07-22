'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Trash2, FileText, ShoppingBag } from 'lucide-react'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { buttonVariants } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toaster'

export default function CartPage() {
  const { items, updateQuantity, removeItem, addItem, total, itemCount } = useCartStore()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const subtotal = total()
  const delivery = subtotal > 999 ? 0 : 99
  const finalTotal = subtotal + delivery
  const freeDeliveryGap = 999 - subtotal

  const handleRemove = (medicineId: string) => {
    const item = items.find(i => i.medicine.id === medicineId)
    removeItem(medicineId)
    if (item) {
      toast(`${item.medicine.name} removed`, {
        kind: 'info',
        actionLabel: 'Undo',
        onAction: () => {
          for (let i = 0; i < item.quantity; i++) addItem(item.medicine)
        },
      })
    }
  }

  // Cart is persisted in localStorage — wait for hydration to avoid a flash of "empty"
  if (!hydrated) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-28 w-full max-w-3xl" />
      <Skeleton className="h-28 w-full max-w-3xl" />
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <EmptyState
        icon={<ShoppingBag size={64} strokeWidth={1.2} />}
        title="Your cart is empty"
        description="Add specialty medicines to get started"
        action={<Link href="/medicines" className={buttonVariants('primary', 'lg')}>Browse Medicines</Link>}
      />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-fg mb-8">
        Your Cart <span className="text-muted text-xl font-normal">({itemCount()} items)</span>
      </h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ medicine, quantity, prescriptionUploaded }) => (
            <div key={medicine.id} className="card p-4 flex gap-4">
              <div className="relative w-20 h-20 bg-surface-2 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={medicine.imageUrl} alt={medicine.name} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/medicines/${medicine.id}`}
                  className="font-display font-semibold text-fg text-sm hover:text-primary transition-colors line-clamp-1">
                  {medicine.name}
                </Link>
                <p className="text-xs text-muted">{medicine.genericName}</p>
                <div className="flex items-center gap-2 mt-1">
                  {medicine.requiresPrescription && (
                    <span className="badge-rx text-xs"><FileText size={10} aria-hidden /> Rx Required</span>
                  )}
                  {medicine.requiresPrescription && !prescriptionUploaded && (
                    <button className="text-xs text-cta font-semibold underline">Upload Prescription</button>
                  )}
                  {prescriptionUploaded && (
                    <span className="text-xs text-accent font-semibold">✓ Rx Uploaded</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 gap-2">
                  <QuantityStepper
                    size="sm"
                    quantity={quantity}
                    onChange={q => updateQuantity(medicine.id, q)}
                  />
                  <div className="text-right">
                    <p className="font-display font-bold text-fg">{formatPrice(medicine.halftabletPrice * quantity)}</p>
                    <p className="text-xs text-faint line-through">{formatPrice(medicine.mrp * quantity)}</p>
                  </div>
                  <button onClick={() => handleRemove(medicine.id)}
                    aria-label={`Remove ${medicine.name} from cart`}
                    className="text-faint hover:text-danger transition-colors p-1">
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
            <h2 className="font-display font-bold text-lg text-fg mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal ({itemCount()} items)</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span className={delivery === 0 ? 'text-accent font-semibold' : 'font-semibold'}>
                  {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                </span>
              </div>
              {delivery === 0 ? (
                <p className="text-xs text-accent">🎉 You qualify for free delivery!</p>
              ) : (
                <p className="text-xs text-muted">
                  Add <span className="font-semibold text-fg">{formatPrice(freeDeliveryGap)}</span> more for free delivery
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-fg">Total</span>
                <span className="font-display font-bold text-xl text-fg">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mt-5">
              <div className="flex gap-2">
                <input type="text" placeholder="Coupon code" aria-label="Coupon code" className="input-field text-xs py-2" />
                <button className="btn-outline text-xs px-4 py-2 whitespace-nowrap">Apply</button>
              </div>
            </div>

            <Link href="/checkout" className={buttonVariants('primary', 'lg', 'w-full mt-5')}>
              Proceed to Checkout →
            </Link>
          </div>

          <div className="card p-4 text-xs text-muted space-y-1.5">
            <p>✅ 100% genuine medicines</p>
            <p>🔒 Secure payment with Razorpay</p>
            <p>↩️ Easy returns within 7 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
