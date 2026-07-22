'use client'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('halftablet-theme', next ? 'dark' : 'light') } catch {}
  }

  // Avoid hydration mismatch — render a stable placeholder until mounted
  if (!mounted) return <span className="w-9 h-9 inline-block" aria-hidden />

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="btn-ghost p-2"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
