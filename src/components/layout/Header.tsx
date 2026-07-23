'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, Search, Menu, X, User, LogOut } from 'lucide-react'
import { SearchBar } from '@/components/medicines/SearchBar'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { ElderModeToggle } from '@/components/layout/ElderModeToggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Medicines',      href: '/medicines' },
  { label: 'Conditions',     href: '/conditions' },
  { label: 'Health Library', href: '/health' },
  { label: 'Offers',         href: '/offers' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const itemCount = useCartStore(s => s.itemCount())
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => setHydrated(true), [])

  // Close mobile menu on route change and on Escape
  useEffect(() => setMobileOpen(false), [pathname])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 flex-shrink-0" aria-label="HalfTablet home">
            <span className="font-display font-bold text-2xl text-primary">Dr</span>
            <span className="font-display font-bold text-2xl text-cta">Med</span>
          </Link>

          {/* Inline search — the #1 pharmacy task, always one click away */}
          <div className="hidden md:block flex-1 max-w-xl mx-2">
            <SearchBar variant="header" />
          </div>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-0.5 ml-auto">
            {navLinks.map(link => {
              const active = pathname?.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap',
                    active
                      ? 'text-primary bg-primary-soft'
                      : 'text-muted hover:text-primary hover:bg-primary-soft'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto lg:ml-2">
            {/* Mobile search shortcut */}
            <Link href="/medicines" className="md:hidden btn-ghost p-2" aria-label="Search medicines">
              <Search size={20} />
            </Link>

            <ElderModeToggle />
            <ThemeToggle />

            <Link href="/cart" className="relative btn-ghost p-2" aria-label={`Cart, ${itemCount} items`}>
              <ShoppingCart size={20} />
              {hydrated && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cta text-white text-xs font-bold
                                 w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {session?.user ? (
              <div className="hidden sm:flex items-center gap-1">
                {(session.user.role === 'ADMIN' || session.user.role === 'PHARMACIST') && (
                  <Link href="/admin" className="btn-secondary text-sm px-3 py-2 rounded-xl">
                    Pharmacy Desk
                  </Link>
                )}
                <Link href="/account" className="btn-ghost flex items-center gap-1.5 text-sm px-3 py-2">
                  <User size={16} aria-hidden />
                  <span className="max-w-[100px] truncate">{session.user.name}</span>
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost p-2" aria-label="Sign out" title="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex btn-secondary text-sm px-4 py-2 rounded-xl">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden btn-ghost p-2"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div id="mobile-nav" className="lg:hidden bg-surface border-t border-border animate-fade-in">
          <nav aria-label="Mobile" className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-muted hover:text-primary
                           px-3 py-2.5 rounded-lg hover:bg-primary-soft transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'PHARMACIST') && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-semibold text-primary px-3 py-2.5 rounded-lg hover:bg-primary-soft transition-colors"
              >
                Pharmacy Desk →
              </Link>
            )}
            {session?.user ? (
              <button
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}
                className="block w-full btn-secondary text-center mt-3 text-sm"
              >
                Sign Out ({session.user.name})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block btn-secondary text-center mt-3 text-sm"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
