'use client'
import { useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Mic, X } from 'lucide-react'
import { MEDICINES } from '@/lib/mockData'
import { cn } from '@/lib/utils'

const QUICK_SEARCHES = ['Imatinib', 'Cancer medicines', 'HIV treatment', 'Kidney care', 'Trastuzumab']

interface Props {
  large?: boolean
  initialValue?: string
  /** 'header' renders a compact single-field version for the site header */
  variant?: 'default' | 'header'
}

export function SearchBar({ large = false, initialValue = '', variant = 'default' }: Props) {
  const router = useRouter()
  const listId = useId()
  const [query, setQuery] = useState(initialValue)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const isHeader = variant === 'header'

  const suggestions = query.length > 1
    ? MEDICINES.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.genericName.toLowerCase().includes(query.toLowerCase()) ||
        m.saltComposition.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : []

  // The keyboard-navigable option labels (medicine names or quick searches)
  const options = query.length > 1 ? suggestions.map(m => m.name) : query.length === 0 ? QUICK_SEARCHES : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/medicines?q=${encodeURIComponent(query.trim())}`)
    setFocused(false)
  }

  const handleSelect = (name: string) => {
    setQuery(name)
    router.push(`/medicines?q=${encodeURIComponent(name)}`)
    setFocused(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFocused(false)
      setActiveIndex(-1)
      return
    }
    if (!focused || options.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i <= 0 ? options.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(options[activeIndex])
    }
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} role="search">
        <div className={cn(
          'flex items-center bg-surface-2 border rounded-xl transition-all duration-200',
          focused ? 'border-primary bg-surface shadow-hover' : 'border-border',
          isHeader ? 'h-10' : large ? 'h-14 border-2' : 'h-11 border-2'
        )}>
          <Search className={cn('ml-3.5 text-faint flex-shrink-0', large ? 'w-5 h-5' : 'w-4 h-4')} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={focused && options.length > 0}
            aria-controls={listId}
            aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
            aria-label="Search medicines"
            aria-autocomplete="list"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(-1) }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={isHeader ? 'Search medicines, salts, conditions…' : 'Search by medicine name, salt name, or condition...'}
            className={cn(
              'flex-1 min-w-0 px-3 bg-transparent outline-none text-fg placeholder-faint',
              '[&::-webkit-search-cancel-button]:hidden',
              large ? 'text-base' : 'text-sm'
            )}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setActiveIndex(-1); inputRef.current?.focus() }}
              aria-label="Clear search" className="p-2 text-faint hover:text-muted">
              <X size={16} />
            </button>
          )}
          {!isHeader && (
            <>
              <button type="button" className="p-2 text-muted hover:text-primary" aria-label="Voice search">
                <Mic size={18} />
              </button>
              <button type="submit"
                className="m-1 bg-cta hover:brightness-110 text-white font-semibold
                           px-5 rounded-lg h-10 text-sm transition-all flex-shrink-0">
                Search
              </button>
            </>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {focused && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-hover border border-border z-50 animate-slide-up overflow-hidden"
        >
          {suggestions.length > 0 ? (
            <>
              <p className="text-xs text-muted px-4 pt-3 pb-1 font-medium">Medicines</p>
              {suggestions.map((m, i) => (
                <button key={m.id} id={`${listId}-opt-${i}`} role="option" aria-selected={activeIndex === i}
                  onMouseDown={() => handleSelect(m.name)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors',
                    activeIndex === i ? 'bg-primary-soft' : 'hover:bg-primary-soft'
                  )}>
                  <Search size={14} className="text-faint flex-shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{m.name}</p>
                    <p className="text-xs text-muted truncate">{m.genericName} · {m.manufacturer}</p>
                  </div>
                </button>
              ))}
            </>
          ) : query.length === 0 ? (
            <>
              <p className="text-xs text-muted px-4 pt-3 pb-1 font-medium">Popular Searches</p>
              {QUICK_SEARCHES.map((s, i) => (
                <button key={s} id={`${listId}-opt-${i}`} role="option" aria-selected={activeIndex === i}
                  onMouseDown={() => handleSelect(s)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors',
                    activeIndex === i ? 'bg-primary-soft' : 'hover:bg-primary-soft'
                  )}>
                  <Search size={14} className="text-faint" aria-hidden />
                  <span className="text-sm text-fg">{s}</span>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-4 text-sm text-muted">
              No medicines found for &quot;{query}&quot;. Try the{' '}
              <button onMouseDown={() => handleSelect(query)} className="text-primary font-medium underline">
                AI assistant
              </button>{' '}for help.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
