'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Snowflake, FileText, Star } from 'lucide-react'
import { Medicine } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { toast } from '@/components/ui/Toaster'

export function MedicineCard({ medicine }: { medicine: Medicine }) {
  const addItem = useCartStore(s => s.addItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const inCartQty = useCartStore(s => s.items.find(i => i.medicine.id === medicine.id)?.quantity ?? 0)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const out = medicine.stockLevel === 'out'

  const handleAdd = () => {
    addItem(medicine)
    toast(`${medicine.name} added to cart`, {
      kind: 'success',
      actionLabel: 'View cart',
      onAction: () => { window.location.href = '/cart' },
    })
  }

  return (
    <article className="card flex flex-col h-full group overflow-hidden">
      {/* Image */}
      <Link href={`/medicines/${medicine.id}`} className="block overflow-hidden" tabIndex={-1} aria-hidden>
        <div className="relative bg-surface-2 h-40 flex items-center justify-center">
          <Image
            src={medicine.imageUrl}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          {medicine.discountPercent > 0 && (
            <Badge variant="discount" className="absolute top-2.5 left-2.5">
              {medicine.discountPercent}% OFF
            </Badge>
          )}
          {medicine.coldChain && (
            <Badge variant="cold" className="absolute top-2.5 right-2.5">
              <Snowflake size={10} aria-hidden /> Cold Chain
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-1.5">
        {/* Name */}
        <Link href={`/medicines/${medicine.id}`} className="focus-visible:outline-none">
          <h3 className="font-display font-semibold text-fg text-base leading-snug
                         group-hover:text-primary transition-colors line-clamp-2">
            {medicine.name}
          </h3>
        </Link>

        {/* One muted meta line instead of three stacked ones */}
        <p className="text-xs text-muted truncate">
          {medicine.genericName} · {medicine.manufacturer}
        </p>

        {/* Rating + Rx + stock — single compact row */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5">
          <span className="inline-flex items-center gap-1 text-xs">
            <Star size={12} className="fill-warning text-warning" aria-hidden />
            <span className="font-semibold text-fg">{medicine.rating}</span>
            <span className="text-faint">({medicine.reviewCount})</span>
          </span>
          {medicine.requiresPrescription && (
            <Badge variant="rx"><FileText size={10} aria-hidden /> Rx</Badge>
          )}
          {medicine.stockLevel === 'low' && <Badge variant="warning">Low stock</Badge>}
          {out && <Badge variant="danger">Out of stock</Badge>}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="font-display font-bold text-xl text-fg">{formatPrice(medicine.drmedPrice)}</span>
          <span className="mrp-display">{formatPrice(medicine.mrp)}</span>
          <span className="text-xs text-accent font-semibold ml-auto">
            Save {formatPrice(medicine.mrp - medicine.drmedPrice)}
          </span>
        </div>

        {/* CTA — flips to a stepper once the item is in the cart */}
        {hydrated && inCartQty > 0 ? (
          <div className="flex items-center justify-between mt-2">
            <QuantityStepper
              size="sm"
              quantity={inCartQty}
              onChange={q => updateQuantity(medicine.id, q)}
            />
            <Link href="/cart" className="text-xs font-semibold text-primary hover:underline">
              View cart →
            </Link>
          </div>
        ) : (
          <Button
            onClick={handleAdd}
            disabled={out}
            size="md"
            className="w-full mt-2"
            aria-label={`Add ${medicine.name} to cart`}
          >
            <ShoppingCart size={16} aria-hidden />
            {out ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </article>
  )
}
