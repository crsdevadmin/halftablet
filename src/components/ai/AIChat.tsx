'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react'
import { ChatMessage, Medicine } from '@/types'
import { MedicineCard } from '@/components/medicines/MedicineCard'
import { cn } from '@/lib/utils'

let msgId = 0
const uid = () => String(++msgId)

const QUICK_REPLIES = [
  'Find a medicine',
  'Side effects of my medicine',
  'Cheaper alternative',
  'Where is my order?',
  'Upload prescription',
  'Talk to pharmacist',
]

export function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'assistant',
      content: "Hi! I'm DrMed AI 👋\n\nI can help you find medicines, check prices, understand side effects, or track your order.\n\nWhat can I help you with today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Listen for hero CTA click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-ai-open="true"]')) setOpen(true)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages.slice(-6) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        medicineCards: data.medicines || [],
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment, or call us at 1800-XXX-XXXX.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMessages([{
      id: uid(), role: 'assistant',
      content: "Hi again! How can I help you?",
      timestamp: new Date(),
    }])
  }

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open DrMed AI"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-orange text-white rounded-full
                     shadow-ai flex items-center justify-center ai-bubble hover:scale-110 transition-transform">
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-80px)]
                        flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 animate-slide-up overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-brand-blue to-blue-700 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-xl flex-shrink-0">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-white text-sm">DrMed AI</p>
              <p className="text-blue-200 text-xs">● Online · Replies instantly</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} className="p-1.5 text-blue-200 hover:text-white transition-colors" aria-label="Reset chat">
                <RotateCcw size={15} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 text-blue-200 hover:text-white transition-colors" aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-grey">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div className="max-w-[85%] space-y-2">
                  <div className={cn(
                    'px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white rounded-tr-none'
                      : 'bg-white text-brand-dark rounded-tl-none shadow-sm'
                  )}>
                    {msg.content}
                  </div>
                  {/* Medicine cards */}
                  {msg.medicineCards && msg.medicineCards.length > 0 && (
                    <div className="grid gap-2">
                      {msg.medicineCards.slice(0, 2).map(m => (
                        <div key={m.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-xs">
                          <p className="font-semibold text-brand-dark">{m.name}</p>
                          <p className="text-brand-slate">{m.genericName}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-brand-blue">₹{m.drmedPrice.toLocaleString('en-IN')}</span>
                            <span className="badge-discount">{m.discountPercent}% off</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Feedback */}
                  {msg.role === 'assistant' && msg.id !== messages[0]?.id && (
                    <div className="flex gap-2 ml-1">
                      <button className="text-gray-300 hover:text-brand-teal transition-colors"><ThumbsUp size={12} /></button>
                      <button className="text-gray-300 hover:text-red-400 transition-colors"><ThumbsDown size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 bg-brand-slate rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100 bg-white">
              {QUICK_REPLIES.slice(0, 4).map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-xs bg-brand-ice text-brand-blue font-medium px-3 py-1.5 rounded-full
                             hover:bg-blue-100 transition-colors border border-blue-100">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 bg-brand-grey rounded-xl px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                placeholder="Ask about any medicine or condition..."
                className="flex-1 bg-transparent text-sm text-brand-dark placeholder-brand-slate outline-none"
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-brand-orange hover:bg-orange-600 disabled:opacity-40 text-white
                           rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              DrMed AI provides information only — not medical advice.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
