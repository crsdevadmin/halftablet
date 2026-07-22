'use client'
import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/Toaster'

/**
 * Elder-friendly mode: larger text, stronger contrast, bigger tap targets.
 * Applied via an `elder` class on <html> (see globals.css), persisted,
 * restored before first paint by the init script in layout.tsx.
 */
export function ElderModeToggle() {
  const [on, setOn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setOn(document.documentElement.classList.contains('elder'))
  }, [])

  const toggle = () => {
    const next = !on
    setOn(next)
    document.documentElement.classList.toggle('elder', next)
    try { localStorage.setItem('halftablet-elder', next ? '1' : '0') } catch {}
    toast(next ? 'Easy-read mode on — larger text everywhere' : 'Easy-read mode off', { kind: 'info' })
  }

  if (!mounted) return <span className="w-9 h-9 inline-block" aria-hidden />

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn off easy-read mode' : 'Turn on easy-read mode: larger text and higher contrast'}
      title="Easy-read mode"
      className="btn-ghost p-2 font-display font-bold text-sm leading-none"
    >
      <span aria-hidden className={on ? 'text-primary' : undefined}>A<span className="text-xs">A</span></span>
    </button>
  )
}
