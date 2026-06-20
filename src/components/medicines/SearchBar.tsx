'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Mic, X } from 'lucide-react'
import { MEDICINES } from '@/lib/mockData'
import { cn } from '@/lib/utils'

const QUICK_SEARCHES = ['Imatinib', 'Cancer medicines', 'HIV treatment', 'Kidney care', 'Trastuzumab']

export function SearchBar({ large = false, initialValue = '' }: { large?: boolean; initialValue?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialValue)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = query.length > 1
    ? MEDICINES.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.genericName.toLowerCase().includes(query.toLowerCase()) ||
        m.saltComposition.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/medicines?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSelect = (name: string) => {
    setQuery(name)
    router.push(`/medicines?q=${encodeURIComponent(name)}`)
    setFocused(false)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className={cn(
          'flex items-center bg-white border-2 rounded-xl transition-all duration-200',
          focused ? 'border-brand-blue shadow-lg' : 'border-gray-200',
          large ? 'h-14' : 'h-11'
        )}>
          <Search className={cn('ml-4 text-brand-slate flex-shrink-0', large ? 'w-5 h-5' : 'w-4 h-4')} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search by medicine name, salt name, or condition..."
            className={cn(
              'flex-1 px-3 bg-transparent outline-none text-brand-dark placeholder-brand-slate',
              large ? 'text-base' : 'text-sm'
            )}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-2 text-gray-400 hover:text-brand-slate">
              <X size={16} />
            </button>
          )}
          <button type="button" className="p-2 text-brand-slate hover:text-brand-blue" aria-label="Voice search">
            <Mic size={18} />
          </button>
          <button type="submit"
            className="m-1 bg-brand-orange hover:bg-orange-600 text-white font-semibold
                       px-5 rounded-lg h-10 text-sm transition-colors flex-shrink-0">
            Search
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {focused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-hover border border-gray-100 z-50 animate-slide-up overflow-hidden">
          {suggestions.length > 0 ? (
            <>
              <p className="text-xs text-brand-slate px-4 pt-3 pb-1 font-medium">Medicines</p>
              {suggestions.map(m => (
                <button key={m.id} onMouseDown={() => handleSelect(m.name)}
                  className="w-full text-left px-4 py-2.5 hover:bg-brand-ice flex items-center gap-3 transition-colors">
                  <Search size={14} className="text-brand-slate flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-brand-dark">{m.name}</p>
                    <p className="text-xs text-brand-slate">{m.genericName} · {m.manufacturer}</p>
                  </div>
                </button>
              ))}
            </>
          ) : query.length === 0 ? (
            <>
              <p className="text-xs text-brand-slate px-4 pt-3 pb-1 font-medium">Popular Searches</p>
              {QUICK_SEARCHES.map(s => (
                <button key={s} onMouseDown={() => handleSelect(s)}
                  className="w-full text-left px-4 py-2.5 hover:bg-brand-ice flex items-center gap-3">
                  <Search size={14} className="text-brand-slate" />
                  <span className="text-sm text-brand-dark">{s}</span>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-4 text-sm text-brand-slate">
              No medicines found for &quot;{query}&quot;. Try the{' '}
              <button onMouseDown={() => handleSelect(query)} className="text-brand-blue font-medium underline">
                AI assistant
              </button>{' '}for help.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
