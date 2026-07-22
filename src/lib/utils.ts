import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function calculateSavings(mrp: number, halftabletPrice: number): number {
  return mrp - halftabletPrice
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
