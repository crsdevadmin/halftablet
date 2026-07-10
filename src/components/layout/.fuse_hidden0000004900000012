'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Pill, ShoppingCart, HeartPulse, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Home',       href: '/',           icon: Home },
  { label: 'Medicines',  href: '/medicines',  icon: Pill },
  { label: 'Conditions', href: '/conditions', icon: HeartPulse },
  { label: 'Cart',       href: '/cart',       icon: ShoppingCart },
  { label: 'Account',    href: '/account',    icon: User },
]

/** Thumb-friendly fixed navigation for mobile — hidden on md+. */
export function BottomNav() {
  const pathname = usePathname()
  const itemCount = useCartStore(s => s.itemCount())
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur border-t border-border
                 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted hover:text-primary'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label === 'Cart' && hydrated && itemCount > 0 && (
                <span className="absolute top-0.5 right-[calc(50%-18px)] bg-cta text-white text-[10px] font-bold
                                 w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
