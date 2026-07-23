import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { IndianRupee, ShoppingBag, AlertTriangle, PackageX } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { StatCard } from '@/components/admin/StatCard'
import { SalesChart } from '@/components/admin/SalesChart'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, BadgeVariant> = {
  AWAITING_CONFIRMATION: 'warning', PENDING_RX: 'warning', RX_VERIFIED: 'cold', CONFIRMED: 'cold',
  DISPATCHED: 'cold', OUT_FOR_DELIVERY: 'rx', DELIVERED: 'success', CANCELLED: 'danger',
}
const STATUS_LABEL: Record<string, string> = {
  AWAITING_CONFIRMATION: 'Awaiting Confirmation', PENDING_RX: 'Pending Rx', RX_VERIFIED: 'Rx Verified',
  CONFIRMED: 'Confirmed', DISPATCHED: 'Dispatched', OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
}

const DAY = 86_400_000
const countable = { notIn: ['CANCELLED', 'AWAITING_CONFIRMATION'] as ('CANCELLED' | 'AWAITING_CONFIRMATION')[] }

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions)
  const isStaff = session?.user && (session.user.role === 'ADMIN' || session.user.role === 'PHARMACIST')
  if (!isStaff) {
    return (
      <div className="py-16 text-center">
        <p className="text-fg font-semibold">Pharmacist access required</p>
        <p className="text-sm text-muted mt-1">Sign in with a pharmacist or admin account.</p>
      </div>
    )
  }

  const now = new Date()
  const d30 = new Date(now.getTime() - 30 * DAY)
  const d60 = new Date(now.getTime() - 60 * DAY)

  const [orders30, prevOrders, orderItems, medicines, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: d30 }, status: countable },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: d60, lt: d30 }, status: countable },
      select: { total: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: countable } },
      select: { quantity: true, unitPrice: true, medicine: { select: { id: true, name: true } } },
    }),
    prisma.medicine.findMany({
      select: { id: true, name: true, reorderLevel: true, batches: { select: { qty: true, expiry: true } } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true, number: true, status: true, total: true,
        address: true, user: { select: { name: true } },
      },
    }),
  ])

  // KPIs
  const revenue = orders30.reduce((s, o) => s + o.total, 0)
  const prevRevenue = prevOrders.reduce((s, o) => s + o.total, 0)
  const revenueTrend = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0
  const ordersTrend = prevOrders.length > 0 ? ((orders30.length - prevOrders.length) / prevOrders.length) * 100 : 0

  // Daily sales (last 30 days)
  const dailySales = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(now.getTime() - (29 - i) * DAY)
    const key = day.toISOString().slice(0, 10)
    const dayOrders = orders30.filter(o => o.createdAt.toISOString().slice(0, 10) === key)
    return { date: key, revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length }
  })

  // Top sellers
  const sellerMap = new Map<string, { name: string; unitsSold: number; revenue: number }>()
  for (const it of orderItems) {
    const cur = sellerMap.get(it.medicine.id) ?? { name: it.medicine.name, unitsSold: 0, revenue: 0 }
    cur.unitsSold += it.quantity
    cur.revenue += it.quantity * it.unitPrice
    sellerMap.set(it.medicine.id, cur)
  }
  const topSellers = [...sellerMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Stock health
  const stock = medicines.map(m => {
    const totalQty = m.batches.reduce((s, b) => s + b.qty, 0)
    const status = totalQty === 0 ? 'out' : totalQty <= m.reorderLevel ? 'low' : 'ok'
    return { ...m, totalQty, status }
  })
  const lowStock = stock.filter(s => s.status === 'low')
  const outOfStock = stock.filter(s => s.status === 'out')
  const expiringSoon = medicines
    .flatMap(m => m.batches)
    .filter(b => b.qty > 0 && b.expiry.getTime() - now.getTime() <= 90 * DAY).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-fg">Overview</h1>
        <p className="text-sm text-muted mt-0.5">Last 30 days · live data</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={formatPrice(revenue)} trendPct={revenueTrend} icon={<IndianRupee size={16} />} />
        <StatCard label="Orders" value={String(orders30.length)} trendPct={ordersTrend} icon={<ShoppingBag size={16} />} />
        <StatCard label="Low / Out of Stock" value={`${lowStock.length} / ${outOfStock.length}`} tone={outOfStock.length > 0 ? 'danger' : lowStock.length > 0 ? 'warning' : 'default'} icon={<PackageX size={16} />} />
        <StatCard label="Batches Expiring ≤90d" value={String(expiringSoon)} tone={expiringSoon > 0 ? 'warning' : 'default'} icon={<AlertTriangle size={16} />} />
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-fg">Daily Revenue</h2>
          <p className="text-xs text-muted">Avg {formatPrice(Math.round(revenue / 30))}/day</p>
        </div>
        <SalesChart data={dailySales} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top sellers */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-lg text-fg mb-4">Top Sellers</h2>
          {topSellers.length === 0 && <p className="text-sm text-muted">No sales yet.</p>}
          <ol className="space-y-3">
            {topSellers.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-surface-2 text-muted text-xs font-bold flex items-center justify-center flex-shrink-0" aria-hidden>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/medicines/${s.id}`} className="text-sm font-semibold text-fg hover:text-primary truncate block">
                    {s.name}
                  </Link>
                  <p className="text-xs text-muted">{s.unitsSold} units</p>
                </div>
                <p className="text-sm font-bold text-fg whitespace-nowrap">{formatPrice(s.revenue)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-fg">Recent Orders</h2>
            <div className="flex items-center gap-4">
              <Link href="/admin/prescriptions" className="text-sm text-primary font-semibold hover:underline">Review prescriptions →</Link>
              <Link href="/admin/orders" className="text-sm text-primary font-semibold hover:underline">View pipeline →</Link>
            </div>
          </div>
          {recentOrders.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
          <ul className="space-y-3">
            {recentOrders.map(o => {
              const city = (o.address as { city?: string } | null)?.city
              return (
                <li key={o.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-fg truncate">
                      {o.user.name} {city && <span className="text-faint font-normal">· {city}</span>}
                    </p>
                    <p className="text-xs text-muted font-mono">{o.number}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[o.status] ?? 'neutral'}>{STATUS_LABEL[o.status] ?? o.status}</Badge>
                  <p className="text-sm font-bold text-fg whitespace-nowrap w-20 text-right">{formatPrice(o.total)}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Stock alerts strip */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="card p-4 border-warning/40 bg-warning/5 flex items-center gap-3 flex-wrap">
          <AlertTriangle size={18} className="text-warning flex-shrink-0" aria-hidden />
          <p className="text-sm text-fg flex-1">
            {outOfStock.length > 0 && <><strong>{outOfStock.length}</strong> medicine{outOfStock.length > 1 ? 's' : ''} out of stock. </>}
            {lowStock.length > 0 && <><strong>{lowStock.length}</strong> below reorder level. </>}
            {[...outOfStock, ...lowStock].slice(0, 3).map(s => s.name).join(', ')}
          </p>
          <Link href="/admin/inventory" className="text-sm text-primary font-semibold hover:underline whitespace-nowrap">
            Review inventory →
          </Link>
        </div>
      )}
    </div>
  )
}
