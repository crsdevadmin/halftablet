'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Boxes, ClipboardList, FileText, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Overview',      href: '/admin',               icon: LayoutDashboard },
  { label: 'Prescriptions', href: '/admin/prescriptions', icon: FileText },
  { label: 'Orders',        href: '/admin/orders',        icon: ClipboardList },
  { label: 'Inventory',     href: '/admin/inventory',     icon: Boxes },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Admin" className="flex lg:flex-col gap-1 overflow-x-auto">
      {links.map(({ label, href, icon: Icon }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              active ? 'bg-primary text-white' : 'text-muted hover:text-primary hover:bg-primary-soft'
            )}
          >
            <Icon size={17} aria-hidden /> {label}
          </Link>
        )
      })}
      <Link
        href="/"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-primary hover:bg-primary-soft whitespace-nowrap lg:mt-auto"
      >
        <ArrowLeft size={17} aria-hidden /> Back to store
      </Link>
    </nav>
  )
}
