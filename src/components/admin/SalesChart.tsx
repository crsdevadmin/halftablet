import { DailySale } from '@/lib/adminData'
import { formatPrice } from '@/lib/utils'

/**
 * Dependency-free SVG bar chart. Theme-aware via CSS variables.
 * Swap for a chart library in Phase 2 if richer interaction is needed.
 */
export function SalesChart({ data }: { data: DailySale[] }) {
  const W = 720
  const H = 220
  const PAD = { top: 12, right: 8, bottom: 28, left: 8 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const max = Math.max(...data.map(d => d.revenue))
  const barW = innerW / data.length

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Daily revenue for the last ${data.length} days, peak ${formatPrice(max)}`}
      className="w-full h-auto"
    >
      {/* gridlines at 25/50/75/100% */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line
          key={f}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + innerH * (1 - f)}
          y2={PAD.top + innerH * (1 - f)}
          stroke="rgb(var(--border))"
          strokeWidth="1"
          strokeDasharray={f === 1 ? undefined : '3 4'}
        />
      ))}
      {data.map((d, i) => {
        const h = (d.revenue / max) * innerH
        const x = PAD.left + i * barW
        const label = new Date(d.date).getDate()
        return (
          <g key={d.date}>
            <title>{`${d.date}: ${formatPrice(d.revenue)} · ${d.orders} orders`}</title>
            <rect
              x={x + barW * 0.18}
              y={PAD.top + innerH - h}
              width={barW * 0.64}
              height={h}
              rx="3"
              fill="rgb(var(--primary))"
              opacity={i === data.length - 1 ? 1 : 0.55}
              className="hover:opacity-100 transition-opacity"
            />
            {/* x labels every 5th day */}
            {i % 5 === 0 && (
              <text
                x={x + barW / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize="10"
                fill="rgb(var(--muted))"
              >
                {label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
