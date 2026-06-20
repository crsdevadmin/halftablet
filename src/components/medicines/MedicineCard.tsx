'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Snowflake, FileText, Star } from 'lucide-react'
import { Medicine } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { cn } from '@/lib/utils'

interface Props {
  medicine: Medicine
  compact?: boolean
}

export function MedicineCard({ medicine, compact }: Props) {
  const addItem = useCartStore(s => s.addItem)

  const stockColor = medicine.stockLevel === 'high'
    ? 'text-green-600' : medicine.stockLevel === 'low'
    ? 'text-amber-600' : 'text-red-600'

  const stockLabel = medicine.stockLevel === 'high'
    ? '● In Stock' : medicine.stockLevel === 'low'
    ? '● Low Stock' : '● Out of Stock'

  return (
    <div className="card flex flex-col h-full group">
      {/* Image */}
      <Link href={`/medicines/${medicine.id}`} className="block overflow-hidden rounded-t-xl">
        <div className="relative bg-brand-grey h-44 flex items-center justify-center">
          <Image
            src={medicine.imageUrl}
            alt={medicine.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          {/* Discount badge */}
          <span className="absolute top-3 left-3 badge-discount">
            {medicine.discountPercent}% OFF
          </span>
          {/* Cold chain badge */}
          {medicine.coldChain && (
            <span className="absolute top-3 right-3 badge-cold">
              <Snowflake size={10} /> Cold Chain
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Category */}
        <span className="text-xs font-medium text-brand-blue uppercase tracking-wide">
          {medicine.category}
        </span>

        {/* Name */}
        <Link href={`/medicines/${medicine.id}`}>
          <h3 className="font-display font-semibold text-brand-dark text-base leading-snug
                         hover:text-brand-blue transition-colors line-clamp-2">
            {medicine.name}
          </h3>
        </Link>

        <p className="text-xs text-brand-slate">{medicine.genericName}</p>
        <p className="text-xs text-gray-400">{medicine.manufacturer}</p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-brand-dark">{medicine.rating}</span>
          <span className="text-xs text-gray-400">({medicine.reviewCount})</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {medicine.requiresPrescription && (
            <span className="badge-rx"><FileText size={10} /> Rx Required</span>
          )}
          <span className={cn('text-xs font-medium', stockColor)}>{stockLabel}</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="price-display text-xl">{formatPrice(medicine.drmedPrice)}</span>
          <span className="mrp-display">{formatPrice(medicine.mrp)}</span>
        </div>

        {/* Savings */}
        <p className="text-xs text-brand-teal font-semibold">
          You save {formatPrice(medicine.mrp - medicine.drmedPrice)}
        </p>

        {/* CTA */}
        <button
          onClick={() => addItem(medicine)}
          disabled={medicine.stockLevel === 'out'}
          className="btn-primary flex items-center justify-center gap-2 w-full mt-2 text-sm py-2.5"
        >
          <ShoppingCart size={16} />
          {medicine.stockLevel === 'out' ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
