import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'rx' | 'discount' | 'cold' | 'success' | 'warning' | 'danger' | 'neutral'

const variants: Record<BadgeVariant, string> = {
  rx:       'bg-warning/10 text-warning border border-warning/30',
  discount: 'bg-accent text-white font-bold',
  cold:     'bg-primary-soft text-primary border border-primary/20',
  success:  'bg-accent/10 text-accent border border-accent/30',
  warning:  'bg-warning/10 text-warning border border-warning/30',
  danger:   'bg-danger/10 text-danger border border-danger/30',
  neutral:  'bg-surface-2 text-muted border border-border',
}

export function Badge({
  variant = 'neutral',
  children,
  className,
}: {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
