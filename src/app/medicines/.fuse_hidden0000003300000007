'use client'
import { useState, useMemo } from 'react'
import { SearchBar } from '@/components/medicines/SearchBar'
import { MedicineCard } from '@/components/medicines/MedicineCard'
import { MEDICINES, CONDITIONS } from '@/lib/mockData'
import { MedicineCategory } from '@/types'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CatalogContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const initialCat = (searchParams.get('category') as MedicineCategory) || ''

  const [query, setQuery] = useState(initialQ)
  const [category, setCategory] = useState<MedicineCategory | ''>(initialCat)
  const [rxFilter, setRxFilter] = useState<'all' | 'rx' | 'otc'>('all')
  const [maxDiscount, setMaxDiscount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return MEDICINES.filter(m => {
      if (query && !m.name.toLowerCase().includes(query.toLowerCase()) &&
          !m.genericName.toLowerCase().includes(query.toLowerCase()) &&
          !m.saltComposition.toLowerCase().includes(query.toLowerCase())) return false
      if (category && m.category !== category) return false
      if (rxFilter === 'rx' && !m.requiresPrescription) return false
      if (rxFilter === 'otc' && m.requiresPrescription) return false
      if (maxDiscount > 0 && m.discountPercent < maxDiscount) return false
      return true
    })
  }, [query, category, rxFilter, maxDiscount])

  const clearFilters = () => {
    setCategory('')
    setRxFilter('all')
    setMaxDiscount(0)
  }

  const activeFilters = [category, rxFilter !== 'all' ? rxFilter : '', maxDiscount > 0 ? `${maxDiscount}%+` : ''].filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-brand-dark mb-2">Medicine Catalog</h1>
        <p className="text-brand-slate">5,000+ specialty medicines with up to 85% off</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar initialValue={initialQ} />
      </div>

      <div className="flex gap-8">
        {/* Filter sidebar — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0 space-y-6">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brand-dark text-sm">Filters</h3>
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="text-xs text-brand-orange hover:underline">Clear all</button>
              )}
            </div>

            {/* Category */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-brand-slate uppercase tracking-wide mb-2">Condition</p>
              <div className="space-y-1">
                <button onClick={() => setCategory('')}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!category ? 'bg-brand-blue text-white' : 'hover:bg-brand-ice text-brand-dark'}`}>
                  All Conditions
                </button>
                {CONDITIONS.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id as MedicineCategory)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${category === c.id ? 'bg-brand-blue text-white' : 'hover:bg-brand-ice text-brand-dark'}`}>
                    <span>{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rx filter */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-brand-slate uppercase tracking-wide mb-2">Prescription</p>
              {[['all', 'All'], ['rx', 'Rx Required'], ['otc', 'No Rx Needed']].map(([val, label]) => (
                <button key={val} onClick={() => setRxFilter(val as 'all' | 'rx' | 'otc')}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors mb-1 ${rxFilter === val ? 'bg-brand-blue text-white' : 'hover:bg-brand-ice text-brand-dark'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Discount */}
            <div>
              <p className="text-xs font-semibold text-brand-slate uppercase tracking-wide mb-2">Min. Discount</p>
              {[0, 50, 60, 70, 80].map(d => (
                <button key={d} onClick={() => setMaxDiscount(d)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors mb-1 ${maxDiscount === d ? 'bg-brand-blue text-white' : 'hover:bg-brand-ice text-brand-dark'}`}>
                  {d === 0 ? 'Any discount' : `${d}% or more`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter toggle + active chips */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <button onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 text-sm btn-outline py-2 px-4">
              <SlidersHorizontal size={15} /> Filters
              {activeFilters.length > 0 && (
                <span className="bg-brand-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
            {activeFilters.map(f => (
              <span key={f} className="flex items-center gap-1 text-xs bg-brand-ice text-brand-blue font-medium px-3 py-1 rounded-full border border-blue-100">
                {f} <X size={11} className="cursor-pointer" onClick={clearFilters} />
              </span>
            ))}
            <p className="text-sm text-brand-slate ml-auto">{filtered.length} medicines found</p>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="font-display font-bold text-brand-dark mb-2">No medicines found</h3>
              <p className="text-brand-slate text-sm mb-4">Try a different search or ask our AI assistant for help.</p>
              <button data-ai-open="true" className="btn-primary text-sm">Ask DrMed AI</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(m => <MedicineCard key={m.id} medicine={m} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MedicinesPage() {
  return (
    <Suspense>
      <CatalogContent />
    </Suspense>
  )
}
