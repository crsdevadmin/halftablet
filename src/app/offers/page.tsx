import { Tag, Clock } from 'lucide-react'

const OFFERS = [
  { code: 'TARGET15',  desc: '15% extra off on targeted therapy (TKIs & CDK4/6)', category: 'Targeted Therapy', expiry: '30 Aug 2026', color: 'from-rose-500 to-red-600', saves: '₹1,200 avg' },
  { code: 'CHEMOFREE', desc: 'Free cold-chain delivery on all chemo & biologics', category: 'Chemotherapy', expiry: 'No expiry', color: 'from-blue-500 to-blue-700', saves: '₹99 delivery' },
  { code: 'HORMONE10', desc: '10% off hormonal therapy (letrozole, tamoxifen & more)', category: 'Hormonal Therapy', expiry: '15 Aug 2026', color: 'from-purple-500 to-violet-700', saves: '₹35 avg' },
  { code: 'NEW200',    desc: '₹200 off your first order above ₹999', category: 'All', expiry: '31 Aug 2026', color: 'from-teal-500 to-green-600', saves: '₹200 flat' },
  { code: 'CAREPLUS',  desc: '20% off supportive care — anti-nausea, G-CSF, bone health', category: 'Supportive Care', expiry: 'Ongoing', color: 'from-amber-500 to-orange-600', saves: '₹380 avg' },
  { code: 'PAP2026',   desc: 'Patient Assistance: apply for free cancer medicines', category: 'All Patients', expiry: 'Ongoing', color: 'from-indigo-500 to-blue-600', saves: 'Up to 100%' },
]

export default function OffersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-brand-dark mb-2">Offers & Discounts</h1>
        <p className="text-brand-slate">Save more on specialty medicines with these exclusive deals</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {OFFERS.map(offer => (
          <div key={offer.code} className={`bg-gradient-to-br ${offer.color} rounded-2xl p-6 text-white`}>
            <div className="flex items-center gap-2 mb-1">
              <Tag size={16} />
              <span className="text-xs font-medium opacity-80">{offer.category}</span>
            </div>
            <p className="font-display font-bold text-2xl tracking-wide mb-3">{offer.code}</p>
            <p className="text-sm text-white/90 mb-4 leading-snug">{offer.desc}</p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 text-xs text-white/70">
                <Clock size={11} /> {offer.expiry}
              </div>
              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">Save {offer.saves}</span>
            </div>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors border border-white/30">
              Copy Code
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
