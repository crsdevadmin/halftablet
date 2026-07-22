import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
  'transition-all duration-200 select-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

const variants: Record<ButtonVariant, string> = {
  primary:   'bg-cta text-white shadow-sm hover:brightness-110 active:brightness-95',
  secondary: 'bg-primary text-white shadow-sm hover:brightness-110 active:brightness-95',
  outline:   'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost:     'text-muted hover:text-primary hover:bg-primary-soft font-medium',
  danger:    'bg-danger text-white shadow-sm hover:brightness-110',
}

const sizes: Record<ButtonSize, string> = {
  sm:   'text-xs px-3 py-2',
  md:   'text-sm px-5 py-2.5',
  lg:   'text-base px-6 py-3',
  icon: 'p-2 rounded-lg',
}

/** Compose button classes for non-button elements (e.g. <Link>). */
export function buttonVariants(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={buttonVariants(variant, size, className)}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
