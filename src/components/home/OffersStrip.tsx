import Link from 'next/link'
import { Tag } from 'lucide-react'

const OFFERS = [
  { code: 'CANCER15', desc: '15% extra off on all cancer medicines', expiry: '30 Jun', color: 'from-rose-500 to-red-600' },
  { code: 'KIDNEY10', desc: '10% off kidney care + free delivery', expiry: '25 Jun', color: 'from-blue-500 to-blue-700' },
  { code: 'HIV85',    desc: 'Flat 85% off on HIV/AIDS medicines', expiry: 'No expiry', color: 'from-purple-500 to-violet-700' },
  { code: 'NEW200',   desc: '₹200 off your first order above ₹999', expiry: '31 Jul', color: 'from-teal-500 to-green-600' },
]

export function OffersStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-heading">Today&apos;s Offers</h2>
        <Link href="/offers" className="text-sm text-brand-blue font-semibold hover:underline">View all →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OFFERS.map(offer => (
          <div key={offer.code} className={`bg-gradient-to-br ${offer.color} rounded-xl p-5 text-white`}>
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} />
              <span className="font-display font-bold text-lg tracking-wide">{offer.code}</span>
            </div>
            <p className="text-sm text-white/90 mb-3 leading-snug">{offer.desc}</p>
            <p className="text-xs text-white/70">Expires: {offer.expiry}</p>
            <button className="mt-3 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
              Copy Code
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
