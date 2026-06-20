'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, Search, Bell, Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const itemCount = useCartStore(s => s.itemCount())

  const navLinks = [
    { label: 'Medicines',    href: '/medicines' },
    { label: 'Conditions',   href: '/conditions' },
    { label: 'Consult',      href: '/consult' },
    { label: 'Lab Tests',    href: '/labs' },
    { label: 'Health Library', href: '/health' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 flex-shrink-0">
            <span className="font-display font-bold text-2xl text-brand-blue">Dr</span>
            <span className="font-display font-bold text-2xl text-brand-orange">Med</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="text-sm font-medium text-brand-slate hover:text-brand-blue px-3 py-2 rounded-lg hover:bg-brand-ice transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link href="/medicines" className="hidden sm:flex btn-ghost items-center gap-2 text-sm">
              <Search size={18} />
              <span className="hidden md:block text-brand-slate">Search medicines...</span>
            </Link>

            {/* Notifications */}
            <button className="btn-ghost p-2 hidden sm:block" aria-label="Notifications">
              <Bell size={18} />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative btn-ghost p-2" aria-label="Cart">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs font-bold
                                 w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Sign In */}
            <Link href="/account" className="hidden sm:block btn-secondary text-sm px-4 py-2">
              Sign In
            </Link>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden btn-ghost p-2" aria-label="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-brand-slate hover:text-brand-blue
                           px-3 py-2 rounded-lg hover:bg-brand-ice transition-colors">
                {link.label}
              </Link>
            ))}
            <Link href="/account" onClick={() => setMobileOpen(false)}
              className="block btn-secondary text-center mt-3 text-sm">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
