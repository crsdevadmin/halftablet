'use client'
import { MessageCircle, Zap, ShieldCheck, Globe } from 'lucide-react'

export function AITeaser() {
  const features = [
    { icon: <Zap size={18} className="text-brand-orange" />, text: 'Instant medicine search & price comparison' },
    { icon: <ShieldCheck size={18} className="text-brand-teal" />, text: 'Safe dosage & side-effect information' },
    { icon: <Globe size={18} className="text-brand-blue" />, text: 'Patient Assistance Program guidance' },
    { icon: <MessageCircle size={18} className="text-purple-500" />, text: 'Available in English & Hindi, 24/7' },
  ]
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-gradient-to-br from-brand-dark to-blue-900 rounded-3xl p-8 md:p-12 text-white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-brand-orange/20 text-brand-orange text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              AI-Powered
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 leading-snug">
              Meet Your DrMed<br />
              <span className="text-brand-orange">AI Assistant</span>
            </h2>
            <p className="text-blue-200 text-base mb-6 leading-relaxed">
              Confused about your medicine? Can&apos;t find what you need? Our AI assistant guides you
              every step — like having a knowledgeable friend available 24/7.
            </p>
            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {f.icon}
                  </span>
                  <span className="text-sm text-blue-100">{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              data-ai-open="true"
              className="btn-primary inline-flex items-center gap-2">
              <MessageCircle size={18} /> Try DrMed AI Now
            </button>
          </div>

          {/* Mini chat preview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-sm">
            {[
              { role: 'ai',   text: 'How can I help you today?' },
              { role: 'user', text: 'What is the cheapest alternative to Herceptin?' },
              { role: 'ai',   text: 'Trastuzumab biosimilar (same active ingredient) is available at ₹22,500 — 70% off brand price. Equally effective with the same safety profile.' },
              { role: 'user', text: 'Do I need a prescription?' },
              { role: 'ai',   text: 'Yes, a valid oncologist prescription is required. You can upload it directly during checkout. Want me to add it to your cart?' },
            ].map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-orange text-white rounded-tr-none'
                    : 'bg-white/10 text-blue-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
