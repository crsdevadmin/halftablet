'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Medicine } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (medicine: Medicine) => void
  removeItem: (medicineId: string) => void
  updateQuantity: (medicineId: string, quantity: number) => void
  markPrescriptionUploaded: (medicineId: string) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (medicine) => {
        set((state) => {
          const existing = state.items.find(i => i.medicine.id === medicine.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.medicine.id === medicine.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return {
            items: [...state.items, { medicine, quantity: 1, prescriptionUploaded: false }],
          }
        })
      },

      removeItem: (medicineId) => {
        set((state) => ({ items: state.items.filter(i => i.medicine.id !== medicineId) }))
      },

      updateQuantity: (medicineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(medicineId)
          return
        }
        set((state) => ({
          items: state.items.map(i =>
            i.medicine.id === medicineId ? { ...i, quantity } : i
          ),
        }))
      },

      markPrescriptionUploaded: (medicineId) => {
        set((state) => ({
          items: state.items.map(i =>
            i.medicine.id === medicineId ? { ...i, prescriptionUploaded: true } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.medicine.drmedPrice * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'drmed-cart' }
  )
)
