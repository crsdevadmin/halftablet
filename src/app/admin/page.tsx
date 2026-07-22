import Link from 'next/link'
import { IndianRupee, ShoppingBag, AlertTriangle, PackageX } from 'lucide-react'
import {
  DAILY_SALES, TOTALS, TOP_SELLERS, STOCK, ADMIN_ORDERS,
  stockSummary, daysToExpiry, ORDER_STATUS_LABELS,
} from '@/lib/adminData'
import { MEDICINES } from '@/lib/mockData'
import { formatPrice, formatDate } from '@/lib/utils'
import { StatCard } from '@/components/admin/StatCard'
import { SalesChart } from '@/components/admin/SalesChart'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { OrderStatus } from '@/types'

const STATUS_BADGE: Record<OrderStatus, BadgeVariant> = {
  pending_rx: 'warning', rx_verified: 'cold', confirmed: 'cold',
  dispatched: 'cold', out_for_delivery: 'rx', delivered: 'success', cancelled: 'danger',
}

export default function AdminOverviewPage() {
  const lowStock = STOCK.filter(r => stockSummary(r).status === 'low').length
  const outOfStock = STOCK.filter(r => stockSummary(r).status === 'out').length
  const expiringSoon = STOCK.flatMap(r => r.batches).filter(b => b.qty > 0 && daysToExpiry(b.expiry) <= 90).length
  const revenueTrend = ((TOTALS.revenue - TOTALS.prevRevenue) / TOTALS.prevRevenue) * 100
  const ordersTrend = ((TOTALS.orders - TOTALS.prevOrders) / TOTALS.prevOrders) * 100
  const recentOrders = ADMIN_ORDERS.slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-fg">Overview</h1>
        <p className="text-sm text-muted mt-0.5">Last 30 days · ending {formatDate(DAILY_SALES[DAILY_SALES.length - 1].date)}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={formatPrice(TOTALS.revenue)} trendPct={revenueTrend} icon={<IndianRupee size={16} />} />
        <StatCard label="Orders" value={String(TOTALS.orders)} trendPct={ordersTrend} icon={<ShoppingBag size={16} />} />
        <StatCard label="Low / Out of Stock" value={`${lowStock} / ${outOfStock}`} tone={outOfStock > 0 ? 'danger' : lowStock > 0 ? 'warning' : 'default'} icon={<PackageX size={16} />} />
        <StatCard label="Batches Expiring ≤90d" value={String(expiringSoon)} tone={expiringSoon > 0 ? 'warning' : 'default'} icon={<AlertTriangle size={16} />} />
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-fg">Daily Revenue</h2>
          <p className="text-xs text-muted">Avg {formatPrice(Math.round(TOTALS.revenue / DAILY_SALES.length))}/day</p>
        </div>
        <SalesChart data={DAILY_SALES} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top sellers */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-lg text-fg mb-4">Top Sellers</h2>
          <ol className="space-y-3">
            {TOP_SELLERS.slice(0, 5).map(({ medicine, unitsSold, revenue }, i) => (
              <li key={medicine.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-surface-2 text-muted text-xs font-bold flex items-center justify-center flex-shrink-0" aria-hidden>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/medicines/${medicine.id}`} className="text-sm font-semibold text-fg hover:text-primary truncate block">
                    {medicine.name}
                  </Link>
                  <p className="text-xs text-muted">{unitsSold} units</p>
                </div>
                <p className="text-sm font-bold text-fg whitespace-nowrap">{formatPrice(revenue)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-fg">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary font-semibold hover:underline">View pipeline →</Link>
          </div>
          <ul className="space-y-3">
            {recentOrders.map(o => (
              <li key={o.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-fg truncate">{o.customer} <span className="text-faint font-normal">· {o.city}</span></p>
                  <p className="text-xs text-muted font-mono">{o.id}</p>
                </div>
                <Badge variant={STATUS_BADGE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                <p className="text-sm font-bold text-fg whitespace-nowrap w-20 text-right">{formatPrice(o.total)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stock alerts strip */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="card p-4 border-warning/40 bg-warning/5 flex items-center gap-3 flex-wrap">
          <AlertTriangle size={18} className="text-warning flex-shrink-0" aria-hidden />
          <p className="text-sm text-fg flex-1">
            {outOfStock > 0 && <><strong>{outOfStock}</strong> medicine{outOfStock > 1 ? 's' : ''} out of stock. </>}
            {lowStock > 0 && <><strong>{lowStock}</strong> below reorder level. </>}
            {STOCK.filter(r => stockSummary(r).status !== 'ok').slice(0, 3).map(r =>
              MEDICINES.find(m => m.id === r.medicineId)?.name
            ).filter(Boolean).join(', ')}…
          </p>
          <Link href="/admin/inventory" className="text-sm text-primary font-semibold hover:underline whitespace-nowrap">
            Review inventory →
          </Link>
        </div>
      )}
    </div>
  )
}
