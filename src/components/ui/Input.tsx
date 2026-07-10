'use client'
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const autoId = useId()
    const inputId = id ?? autoId
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-fg mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-surface-2 text-fg text-sm placeholder-faint',
              'transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent',
              icon && 'pl-10',
              error
                ? 'border-danger focus:ring-danger'
                : 'border-border focus:ring-primary',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
