'use client'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { checkCartSafety } from '@/lib/interactions'
import type { Medicine } from '@/types'
import { cn } from '@/lib/utils'

/** Duplicate-salt and interaction warnings for the medicines in the cart */
export function SafetyWarnings({ medicines }: { medicines: Medicine[] }) {
  const warnings = checkCartSafety(medicines)
  if (warnings.length === 0) return null

  return (
    <div className="space-y-3 mb-6" role="alert" aria-label="Medication safety warnings">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={cn(
            'card p-4 flex items-start gap-3 border-2',
            w.severity === 'serious'
              ? 'border-danger/40 bg-danger/5'
              : 'border-warning/40 bg-warning/5'
          )}
        >
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
              w.severity === 'serious' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
            )}
            aria-hidden
          >
            {w.kind === 'duplicate' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-fg">
              {w.kind === 'duplicate' ? 'Same medicine twice' : 'Possible interaction'} — {w.title}
            </p>
            <p className="text-sm text-muted mt-1">{w.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
