import Link from 'next/link'
import { MOCK_ORDER, MEDICINES } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'
import { Package, FileText, Heart, Coins, ChevronRight, Clock } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { OrderStatus } from '@/types'

const STATUS_BADGE: Record<OrderStatus, BadgeVariant> = {
  pending_rx: 'warning',
  rx_verified: 'cold',
  confirmed: 'cold',
  dispatched: 'cold',
  out_for_delivery: 'rx',
  delivered: 'success',
  cancelled: 'danger',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_rx: 'Awaiting Prescription',
  rx_verified: 'Rx Verified',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function DashboardPage() {
  const order = MOCK_ORDER
  const refills = MEDICINES.slice(0, 2)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-fg">Hello, Thirumurugan 👋</h1>
        <p className="text-muted mt-1">Here&apos;s a summary of your health dashboard</p>
      </div>

      {/* AI insight */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 rounded-2xl p-5 mb-8 flex items-start gap-4 text-white">
        <div className="w-10 h-10 bg-cta rounded-full flex items-center justify-center text-lg flex-shrink-0" aria-hidden>🤖</div>
        <div className="flex-1">
          <p className="font-semibold text-sm">HalfTablet AI Reminder</p>
          <p className="text-teal-100 text-sm mt-1">Your <strong className="text-white">Imatinib 400mg</strong> refill is due in 5 days. Would you like to reorder now?</p>
          <button className="mt-3 text-xs bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg font-semibold transition-colors">
            Reorder Now
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Package size={20} className="text-primary" />, label: 'Active Orders', value: '1', href: '/account/orders', bg: 'bg-primary-soft' },
          { icon: <FileText size={20} className="text-warning" />, label: 'Prescriptions', value: '3', href: '/account/prescriptions', bg: 'bg-warning/10' },
          { icon: <Heart size={20} className="text-danger" />, label: 'Conditions', value: '2', href: '/account/health', bg: 'bg-danger/10' },
          { icon: <Coins size={20} className="text-accent" />, label: 'HalfTablet Coins', value: '240', href: '/account/rewards', bg: 'bg-accent/10' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href}
            className="card p-4 flex items-center gap-3 group hover:-translate-y-0.5 transition-transform">
            <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`} aria-hidden>
              {stat.icon}
            </div>
            <div>
              <p className="font-display font-bold text-xl text-fg">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-faint group-hover:text-primary transition-colors" aria-hidden />
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active order */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-fg">Active Order</h2>
            <Link href="/account/orders" className="text-sm text-primary font-semibold hover:underline">View all →</Link>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-sm text-fg font-semibold">{order.id}</p>
              <p className="text-xs text-muted">Placed {formatDate(order.createdAt)}</p>
            </div>
            <Badge variant={STATUS_BADGE[order.status]}>{STATUS_LABELS[order.status]}</Badge>
          </div>

          {/* Progress */}
          <div className="relative mb-5">
            <div className="h-1.5 bg-surface-2 rounded-full">
              <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: '60%' }} />
            </div>
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>Order Placed</span><span>Dispatched</span><span>Delivered</span>
            </div>
          </div>

          <div className="bg-primary-soft rounded-xl p-3 flex items-center gap-3 text-sm">
            <Clock size={16} className="text-primary" aria-hidden />
            <span className="text-fg">Estimated delivery: <strong>{formatDate(order.estimatedDelivery)}</strong></span>
          </div>
        </div>

        {/* Upcoming refills */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-fg mb-5">Upcoming Refills</h2>
          <div className="space-y-4">
            {refills.map((m, i) => (
              <div key={m.id} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-surface-2 rounded-xl flex items-center justify-center text-lg flex-shrink-0" aria-hidden>💊</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-fg truncate">{m.name}</p>
                  <p className="text-xs text-muted">Due in {5 + i * 4} days</p>
                </div>
                <button className="text-xs bg-primary text-white px-2 py-1 rounded-lg hover:brightness-110 transition-all whitespace-nowrap">
                  Reorder
                </button>
              </div>
            ))}
          </div>
          <Link href="/medicines" className="block text-center text-sm text-primary font-semibold mt-5 hover:underline">
            + Add medicines to track
          </Link>
        </div>
      </div>
    </div>
  )
}
