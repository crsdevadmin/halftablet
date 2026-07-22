'use client'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuantityStepper({
  quantity,
  onChange,
  size = 'md',
  className,
}: {
  quantity: number
  onChange: (q: number) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const btn = cn(
    'flex items-center justify-center text-muted hover:text-primary hover:bg-primary-soft transition-colors',
    size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  )
  return (
    <div
      className={cn(
        'inline-flex items-center border border-border rounded-xl overflow-hidden bg-surface',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
        className={btn}
      >
        {quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
      </button>
      <span
        aria-live="polite"
        className={cn('text-center font-semibold text-fg', size === 'sm' ? 'w-8 text-sm' : 'w-10')}
      >
        {quantity}
      </span>
      <button type="button" onClick={() => onChange(quantity + 1)} aria-label="Increase quantity" className={btn}>
        <Plus size={14} />
      </button>
    </div>
  )
}
