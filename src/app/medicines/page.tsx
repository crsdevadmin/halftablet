'use client'
import { useMemo, useState, Suspense, useCallback } from 'react'
import { SearchBar } from '@/components/medicines/SearchBar'
import { MedicineCard } from '@/components/medicines/MedicineCard'
import { MEDICINES, CONDITIONS } from '@/lib/mockData'
import { MedicineCategory } from '@/types'
import { SlidersHorizontal, X, SearchX } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { cn } from '@/lib/utils'

type RxFilter = 'all' | 'rx' | 'otc'

function FilterPanel({
  category, setCategory,
  rxFilter, setRxFilter,
  minDiscount, setMinDiscount,
  activeCount, clearFilters,
}: {
  category: MedicineCategory | ''
  setCategory: (c: MedicineCategory | '') => void
  rxFilter: RxFilter
  setRxFilter: (f: RxFilter) => void
  minDiscount: number
  setMinDiscount: (d: number) => void
  activeCount: number
  clearFilters: () => void
}) {
  const option = (active: boolean) =>
    cn(
      'w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2',
      active ? 'bg-primary text-white' : 'hover:bg-primary-soft text-fg'
    )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-fg text-sm">Filters</h3>
        {activeCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-cta hover:underline">Clear all</button>
        )}
      </div>

      <div className="mb-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Condition</p>
        <div className="space-y-1">
          <button onClick={() => setCategory('')} className={option(!category)}>
            All Conditions
          </button>
          {CONDITIONS.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id as MedicineCategory)}
              className={option(category === c.id)}>
              <span aria-hidden>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Prescription</p>
        {([['all', 'All'], ['rx', 'Rx Required'], ['otc', 'No Rx Needed']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setRxFilter(val)} className={cn(option(rxFilter === val), 'mb-1')}>
            {label}
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Min. Discount</p>
        {[0, 50, 60, 70, 80].map(d => (
          <button key={d} onClick={() => setMinDiscount(d)} className={cn(option(minDiscount === d), 'mb-1')}>
            {d === 0 ? 'Any discount' : `${d}% or more`}
          </button>
        ))}
      </div>
    </div>
  )
}

function CatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(false)

  // URL is the single source of truth — filters survive reload and can be shared
  const query = searchParams.get('q') || ''
  const category = (searchParams.get('category') as MedicineCategory) || ''
  const rxFilter = (searchParams.get('rx') as RxFilter) || 'all'
  const minDiscount = Number(searchParams.get('disc')) || 0

  const setParams = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) p.set(key, value)
      else p.delete(key)
    }
    router.replace(`/medicines${p.size ? `?${p}` : ''}`, { scroll: false })
  }, [router, searchParams])

  const setCategory = (c: MedicineCategory | '') => setParams({ category: c })
  const setRxFilter = (f: RxFilter) => setParams({ rx: f === 'all' ? '' : f })
  const setMinDiscount = (d: number) => setParams({ disc: d > 0 ? String(d) : '' })
  const clearFilters = () => setParams({ category: '', rx: '', disc: '' })

  const filtered = useMemo(() => {
    return MEDICINES.filter(m => {
      if (query && !m.name.toLowerCase().includes(query.toLowerCase()) &&
          !m.genericName.toLowerCase().includes(query.toLowerCase()) &&
          !m.saltComposition.toLowerCase().includes(query.toLowerCase())) return false
      if (category && m.category !== category) return false
      if (rxFilter === 'rx' && !m.requiresPrescription) return false
      if (rxFilter === 'otc' && m.requiresPrescription) return false
      if (minDiscount > 0 && m.discountPercent < minDiscount) return false
      return true
    })
  }, [query, category, rxFilter, minDiscount])

  const activeFilters = [category, rxFilter !== 'all' ? rxFilter : '', minDiscount > 0 ? `${minDiscount}%+` : ''].filter(Boolean)

  const filterProps = {
    category, setCategory,
    rxFilter, setRxFilter,
    minDiscount, setMinDiscount,
    activeCount: activeFilters.length,
    clearFilters,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-fg mb-2">Medicine Catalog</h1>
        <p className="text-muted">5,000+ specialty medicines with up to 85% off</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar initialValue={query} />
      </div>

      <div className="flex gap-8">
        {/* Filter sidebar — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="card p-4 sticky top-20">
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter toggle + active chips */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSheetOpen(true)}
              className="lg:hidden"
            >
              <SlidersHorizontal size={15} aria-hidden /> Filters
              {activeFilters.length > 0 && (
                <span className="bg-cta text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </Button>
            {activeFilters.map(f => (
              <span key={f} className="flex items-center gap-1 text-xs bg-primary-soft text-primary font-medium px-3 py-1 rounded-full border border-primary/20">
                {f}
                <button onClick={clearFilters} aria-label={`Remove filter ${f}`}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <p className="text-sm text-muted ml-auto" aria-live="polite">
              {filtered.length} medicine{filtered.length === 1 ? '' : 's'} found
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<SearchX size={56} strokeWidth={1.2} />}
                title="No medicines found"
                description="Try a different search term or condition, or ask our AI assistant for help."
                action={
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
                    <Button size="sm" data-ai-open="true">Ask HalfTablet AI</Button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
              {filtered.map(m => <MedicineCard key={m.id} medicine={m} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter bottom-sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <Button size="lg" className="w-full" onClick={() => setSheetOpen(false)}>
            Show {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </Button>
        }
      >
        <FilterPanel {...filterProps} />
      </BottomSheet>
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
