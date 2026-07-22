'use client'
import { create } from 'zustand'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'info' | 'error'
interface Toast {
  id: number
  kind: ToastKind
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface ToastStore {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }))
    setTimeout(() => get().dismiss(id), 3500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Convenience: toast('Added to cart', { kind: 'success' }) */
export function toast(
  message: string,
  opts: { kind?: ToastKind; actionLabel?: string; onAction?: () => void } = {}
) {
  useToastStore.getState().push({ message, kind: opts.kind ?? 'success', ...opts })
}

const icons: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-accent flex-shrink-0" />,
  info:    <Info size={18} className="text-primary flex-shrink-0" />,
  error:   <AlertTriangle size={18} className="text-danger flex-shrink-0" />,
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()
  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 w-[calc(100vw-32px)] max-w-sm pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl',
            'bg-surface border border-border shadow-hover animate-slide-up text-sm text-fg'
          )}
        >
          {icons[t.kind]}
          <span className="flex-1">{t.message}</span>
          {t.actionLabel && (
            <button
              onClick={() => { t.onAction?.(); dismiss(t.id) }}
              className="text-primary font-semibold text-xs hover:underline flex-shrink-0"
            >
              {t.actionLabel}
            </button>
          )}
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-faint hover:text-muted flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
