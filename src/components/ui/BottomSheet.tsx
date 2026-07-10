'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/**
 * Mobile slide-up sheet: overlay, Escape to close, focus trap,
 * body scroll lock, focus restored to the trigger on close.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'

    // Move focus into the sheet
    const focusables = () =>
      panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ?? []
    focusables()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // Trap Tab inside the sheet
      const els = Array.from(focusables())
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      {/* Overlay */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-fade-in cursor-default"
        tabIndex={-1}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute bottom-0 inset-x-0 bg-surface rounded-t-2xl shadow-hover animate-slide-up
                   max-h-[85vh] flex flex-col pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <h2 className="font-display font-bold text-lg text-fg">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="btn-ghost p-2">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-border bg-surface">{footer}</div>}
      </div>
    </div>
  )
}
