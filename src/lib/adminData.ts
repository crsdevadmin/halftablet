import { MEDICINES } from './mockData'
import { OrderStatus } from '@/types'

/**
 * Deterministic mock data for the admin dashboard (Phase 1).
 * Replace with real DB queries in Phase 2 — the shapes below are
 * designed to map 1:1 onto Prisma models.
 */

// ---------- Sales ----------

export interface DailySale {
  date: string // ISO yyyy-mm-dd
  revenue: number
  orders: number
}

// 30 days of pseudo-random but stable sales ending 2026-07-01
export const DAILY_SALES: DailySale[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 5, 2 + i) // Jun 2 … Jul 1, 2026
  const wave = Math.sin(i / 4.5) * 14000
  const noise = ((i * 7919) % 13) * 2100
  const weekend = d.getDay() === 0 || d.getDay() === 6 ? -8000 : 0
  const revenue = Math.round((52000 + wave + noise + weekend) / 100) * 100
  return {
    date: d.toISOString().slice(0, 10),
    revenue,
    orders: Math.max(4, Math.round(revenue / 5200)),
  }
})

export const TOTALS = {
  revenue: DAILY_SALES.reduce((s, d) => s + d.revenue, 0),
  orders: DAILY_SALES.reduce((s, d) => s + d.orders, 0),
  prevRevenue: 1_384_000, // previous 30-day window, for trend %
  prevOrders: 262,
}

// Top sellers: units sold in the last 30 days per medicine
export const TOP_SELLERS = MEDICINES.map((m, i) => ({
  medicine: m,
  unitsSold: 220 - i * 24 + ((i * 37) % 11),
  revenue: (220 - i * 24 + ((i * 37) % 11)) * m.halftabletPrice,
})).sort((a, b) => b.revenue - a.revenue)

// ---------- Inventory ----------

export interface Batch {
  batchNo: string
  expiry: string // ISO date
  qty: number
}

export interface StockRecord {
  medicineId: string
  reorderLevel: number
  batches: Batch[]
}

export const STOCK: StockRecord[] = [
  { medicineId: 'm1', reorderLevel: 40, batches: [
    { batchNo: 'IMB-4471', expiry: '2027-11-30', qty: 96 },
    { batchNo: 'IMB-4390', expiry: '2026-09-15', qty: 22 },
  ]},
  { medicineId: 'm2', reorderLevel: 30, batches: [
    { batchNo: 'TRZ-1082', expiry: '2026-08-10', qty: 14 },
  ]},
  { medicineId: 'm3', reorderLevel: 50, batches: [
    { batchNo: 'SOF-7731', expiry: '2028-01-31', qty: 210 },
    { batchNo: 'SOF-7698', expiry: '2027-03-31', qty: 55 },
  ]},
  { medicineId: 'm4', reorderLevel: 60, batches: [
    { batchNo: 'TEN-9012', expiry: '2027-06-30', qty: 340 },
  ]},
  { medicineId: 'm5', reorderLevel: 25, batches: [
    { batchNo: 'EPO-2210', expiry: '2026-07-25', qty: 8 },
    { batchNo: 'EPO-2288', expiry: '2026-12-05', qty: 30 },
  ]},
  { medicineId: 'm6', reorderLevel: 35, batches: [
    { batchNo: 'TAC-5583', expiry: '2027-09-30', qty: 120 },
  ]},
  { medicineId: 'm7', reorderLevel: 45, batches: [
    { batchNo: 'MTX-3341', expiry: '2026-08-01', qty: 18 },
  ]},
  { medicineId: 'm8', reorderLevel: 40, batches: [
    { batchNo: 'INS-6690', expiry: '2026-10-20', qty: 0 },
  ]},
]

export type StockStatus = 'ok' | 'low' | 'out'

export function stockSummary(rec: StockRecord) {
  const totalQty = rec.batches.reduce((s, b) => s + b.qty, 0)
  const status: StockStatus = totalQty === 0 ? 'out' : totalQty <= rec.reorderLevel ? 'low' : 'ok'
  return { totalQty, status }
}

/** Days until expiry relative to a fixed audit date (stable across renders) */
export const AUDIT_DATE = '2026-07-02'
export function daysToExpiry(expiry: string): number {
  return Math.round((new Date(expiry).getTime() - new Date(AUDIT_DATE).getTime()) / 86_400_000)
}

// ---------- Orders ----------

export interface AdminOrder {
  id: string
  customer: string
  city: string
  createdAt: string
  status: OrderStatus
  itemCount: number
  total: number
  requiresRx: boolean
  coldChain: boolean
}

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: 'ORD-2026-001251', customer: 'Ravi Shankar',   city: 'Chennai',   createdAt: '2026-07-02', status: 'pending_rx',       itemCount: 2, total: 24980, requiresRx: true,  coldChain: false },
  { id: 'ORD-2026-001250', customer: 'Meena Krishnan', city: 'Madurai',   createdAt: '2026-07-02', status: 'pending_rx',       itemCount: 1, total: 58200, requiresRx: true,  coldChain: true },
  { id: 'ORD-2026-001249', customer: 'Arjun Patel',    city: 'Ahmedabad', createdAt: '2026-07-01', status: 'rx_verified',      itemCount: 3, total: 12450, requiresRx: true,  coldChain: false },
  { id: 'ORD-2026-001248', customer: 'Fatima Begum',   city: 'Hyderabad', createdAt: '2026-07-01', status: 'confirmed',        itemCount: 1, total: 8900,  requiresRx: false, coldChain: false },
  { id: 'ORD-2026-001247', customer: 'Suresh Kumar',   city: 'Coimbatore',createdAt: '2026-07-01', status: 'confirmed',        itemCount: 2, total: 31200, requiresRx: true,  coldChain: true },
  { id: 'ORD-2026-001246', customer: 'Priya Nair',     city: 'Kochi',     createdAt: '2026-06-30', status: 'dispatched',       itemCount: 1, total: 4560,  requiresRx: false, coldChain: false },
  { id: 'ORD-2026-001245', customer: 'Amit Verma',     city: 'Delhi',     createdAt: '2026-06-30', status: 'dispatched',       itemCount: 4, total: 18750, requiresRx: true,  coldChain: false },
  { id: 'ORD-2026-001244', customer: 'Lakshmi Rao',    city: 'Bengaluru', createdAt: '2026-06-30', status: 'out_for_delivery', itemCount: 1, total: 62000, requiresRx: true,  coldChain: true },
  { id: 'ORD-2026-001243', customer: 'Karthik Iyer',   city: 'Chennai',   createdAt: '2026-06-29', status: 'delivered',        itemCount: 2, total: 9840,  requiresRx: false, coldChain: false },
  { id: 'ORD-2026-001242', customer: 'Anjali Gupta',   city: 'Mumbai',    createdAt: '2026-06-29', status: 'delivered',        itemCount: 1, total: 15600, requiresRx: true,  coldChain: false },
  { id: 'ORD-2026-001241', customer: 'Mohammed Ali',   city: 'Lucknow',   createdAt: '2026-06-28', status: 'delivered',        itemCount: 3, total: 27300, requiresRx: true,  coldChain: false },
  { id: 'ORD-2026-001240', customer: 'Deepa Menon',    city: 'Trivandrum',createdAt: '2026-06-27', status: 'cancelled',        itemCount: 1, total: 7200,  requiresRx: false, coldChain: false },
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_rx: 'Pending Rx',
  rx_verified: 'Rx Verified',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const PIPELINE_STATUSES: OrderStatus[] = [
  'pending_rx', 'rx_verified', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered',
]
