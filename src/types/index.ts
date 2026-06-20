export interface Medicine {
  id: string
  name: string
  genericName: string
  manufacturer: string
  category: MedicineCategory
  mrp: number
  drmedPrice: number
  discountPercent: number
  inStock: boolean
  stockLevel: 'high' | 'low' | 'out'
  requiresPrescription: boolean
  imageUrl: string
  description: string
  uses: string[]
  sideEffects: { common: string[]; serious: string[]; emergency: string[] }
  dosage: string
  storage: string
  coldChain: boolean
  saltComposition: string
  rating: number
  reviewCount: number
  tags: string[]
}

export type MedicineCategory =
  | 'cancer'
  | 'kidney'
  | 'hiv'
  | 'hepatitis'
  | 'heart'
  | 'arthritis'
  | 'diabetes'
  | 'transplant'
  | 'osteoporosis'
  | 'general'

export interface CartItem {
  medicine: Medicine
  quantity: number
  prescriptionUploaded: boolean
}

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  items: CartItem[]
  totalAmount: number
  deliveryAddress: Address
  estimatedDelivery: string
  trackingEvents: TrackingEvent[]
}

export type OrderStatus =
  | 'pending_rx'
  | 'rx_verified'
  | 'confirmed'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface TrackingEvent {
  status: string
  timestamp: string
  location: string
}

export interface Address {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  phone: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  medicineCards?: Medicine[]
}

export interface HealthArticle {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  readTime: number
  imageUrl: string
  publishedAt: string
  author: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  conditions: string[]
  addresses: Address[]
}
