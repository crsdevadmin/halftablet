import { SearchBar } from '@/components/medicines/SearchBar'
import { Upload, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6">
              🇮🇳 India&apos;s Intelligent Online Pharmacy
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-4">
              Your Medicine.<br />
              <span className="text-orange-400">Delivered with Care.</span>
            </h1>
            <p className="text-teal-100 text-lg mb-8 leading-relaxed">
              5,000+ specialty medicines for cancer, kidney, HIV & more.
              Up to <strong className="text-white">85% off</strong> with AI-powered search.
              Pan-India delivery.
            </p>

            {/* Search */}
            <div className="bg-surface rounded-2xl p-2 mb-6">
              <SearchBar large />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/upload-rx"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30
                           text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all">
                <Upload size={16} /> Upload Prescription
              </Link>
              <button
                data-ai-open="true"
                className="flex items-center gap-2 bg-cta hover:brightness-110
                           text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all shadow-ai">
                <MessageCircle size={16} /> Ask HalfTablet AI
              </button>
            </div>
          </div>

          {/* Right — AI chat preview */}
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/20 pb-4">
                <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <p className="font-semibold text-sm">HalfTablet AI</p>
                  <p className="text-xs text-blue-200">● Online · Replies instantly</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl rounded-tl-none p-3 text-sm text-blue-50 max-w-xs">
                Hi! I&apos;m your HalfTablet assistant. What medicine or condition can I help you with today?
              </div>
              <div className="flex justify-end">
                <div className="bg-brand-orange/90 rounded-xl rounded-tr-none p-3 text-sm text-white max-w-xs">
                  I need Imatinib for CML. What&apos;s the best price?
                </div>
              </div>
              <div className="bg-white/10 rounded-xl rounded-tl-none p-3 text-sm text-blue-50 max-w-xs">
                Imatinib 400mg is available at <strong className="text-white">₹2,700</strong> (85% off MRP of ₹18,000). Prescription required. Want me to add it to cart?
              </div>
              <div className="flex gap-2 flex-wrap">
                {['Add to Cart', 'Side effects?', 'Cheaper option?'].map(q => (
                  <span key={q} className="text-xs bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/20 pt-10">
          {[
            { value: '5,000+', label: 'Specialty Medicines' },
            { value: '85%', label: 'Max Discount' },
            { value: '2,000+', label: 'Cities Served' },
            { value: '50,000+', label: 'Happy Patients' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-bold text-3xl text-brand-orange">{stat.value}</p>
              <p className="text-sm text-blue-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
