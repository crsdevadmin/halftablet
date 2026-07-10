import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  trendPct,
  icon,
  tone = 'default',
}: {
  label: string
  value: string
  /** vs previous period; positive = up */
  trendPct?: number
  icon?: ReactNode
  tone?: 'default' | 'warning' | 'danger'
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
        {icon && <span className="text-faint" aria-hidden>{icon}</span>}
      </div>
      <p className={cn(
        'font-display font-bold text-2xl',
        tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-fg'
      )}>
        {value}
      </p>
      {trendPct !== undefined && (
        <p className={cn(
          'text-xs font-semibold mt-1 inline-flex items-center gap-1',
          trendPct >= 0 ? 'text-accent' : 'text-danger'
        )}>
          {trendPct >= 0 ? <TrendingUp size={12} aria-hidden /> : <TrendingDown size={12} aria-hidden />}
          {trendPct >= 0 ? '+' : ''}{trendPct.toFixed(1)}% vs last 30 days
        </p>
      )}
    </div>
  )
}
