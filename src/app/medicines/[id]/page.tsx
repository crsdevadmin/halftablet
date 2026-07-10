'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ShoppingCart, Star, Snowflake, FileText, MessageCircle, ChevronRight, AlertTriangle, CheckCircle, AlertOctagon, Package } from 'lucide-react'
import { MEDICINES } from '@/lib/mockData'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { MedicineCard } from '@/components/medicines/MedicineCard'

const TABS = ['Overview', 'Dosage & Usage', 'Side Effects', 'Storage', 'Reviews']

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState('Overview')
  const [qty, setQty] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  const medicine = MEDICINES.find(m => m.id === id)

  if (!medicine) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-4xl mb-4">💊</p>
      <h1 className="font-display font-bold text-2xl mb-2">Medicine not found</h1>
      <Link href="/medicines" className="btn-primary inline-block mt-4">Browse Medicines</Link>
    </div>
  )

  const similar = MEDICINES.filter(m => m.category === medicine.category && m.id !== medicine.id).slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-slate mb-6">
        <Link href="/" className="hover:text-brand-blue">Home</Link>
        <ChevronRight size={14} />
        <Link href="/medicines" className="hover:text-brand-blue">Medicines</Link>
        <ChevronRight size={14} />
        <span className="text-brand-dark font-medium truncate">{medicine.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="relative bg-brand-grey rounded-2xl overflow-hidden h-80 lg:h-96">
          <Image src={medicine.imageUrl} alt={medicine.name} fill className="object-cover" sizes="600px" />
          <span className="absolute top-4 left-4 badge-discount text-sm px-3 py-1">
            {medicine.discountPercent}% OFF
          </span>
          {medicine.coldChain && (
            <span className="absolute top-4 right-4 badge-cold">
              <Snowflake size={12} /> Cold Chain Required
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">{medicine.category}</span>
          <h1 className="font-display font-bold text-3xl text-brand-dark leading-tight">{medicine.name}</h1>
          <p className="text-brand-slate">{medicine.genericName} · {medicine.manufacturer}</p>
          <p className="text-xs text-faint">Salt: {medicine.saltComposition}</p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={16} className={s <= Math.round(medicine.rating) ? 'fill-amber-400 text-amber-400' : 'text-faint'} />
            ))}
            <span className="font-semibold text-sm">{medicine.rating}</span>
            <span className="text-brand-slate text-sm">({medicine.reviewCount} reviews)</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {medicine.requiresPrescription && <span className="badge-rx"><FileText size={12} /> Prescription Required</span>}
            {medicine.coldChain && <span className="badge-cold"><Snowflake size={12} /> Cold-Chain Delivery</span>}
            <span className={`text-sm font-semibold ${medicine.inStock ? 'text-accent' : 'text-danger'}`}>
              {medicine.inStock ? '● In Stock' : '● Out of Stock'}
            </span>
          </div>

          {/* Price block */}
          <div className="bg-brand-ice rounded-xl p-5">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-display font-bold text-4xl text-brand-blue">{formatPrice(medicine.drmedPrice)}</span>
              <span className="text-lg text-brand-slate line-through">{formatPrice(medicine.mrp)}</span>
            </div>
            <p className="text-brand-teal font-semibold text-sm">
              You save {formatPrice(medicine.mrp - medicine.drmedPrice)} ({medicine.discountPercent}% off)
            </p>
          </div>

          {/* Prescription upload notice */}
          {medicine.requiresPrescription && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <FileText size={18} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Prescription Required</p>
                <p className="text-xs text-amber-700 mt-0.5">You can upload it at checkout. Our pharmacist will verify within 2–4 hours.</p>
              </div>
            </div>
          )}

          {/* Quantity + Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-12 text-brand-dark hover:bg-brand-ice transition-colors font-bold text-lg">−</button>
              <span className="w-10 text-center font-semibold text-brand-dark">{qty}</span>
              <button onClick={() => setQty(q => q + 1)}
                className="w-10 h-12 text-brand-dark hover:bg-brand-ice transition-colors font-bold text-lg">+</button>
            </div>
            <button
              onClick={() => { for(let i=0;i<qty;i++) addItem(medicine) }}
              disabled={!medicine.inStock}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              {medicine.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          {/* AI ask */}
          <button data-ai-open="true"
            className="w-full flex items-center justify-center gap-2 border-2 border-brand-orange text-brand-orange
                       hover:bg-brand-orange hover:text-white font-semibold py-3 rounded-xl text-sm transition-all">
            <MessageCircle size={16} /> Ask DrMed AI About This Medicine
          </button>

          {/* Delivery */}
          <div className="flex items-center gap-2 text-sm text-brand-slate">
            <Package size={16} className="text-brand-teal" />
            <span>Metro: <strong className="text-brand-dark">1-day delivery</strong> · Tier 1: 1–2 days · Tier 2/3: 2–3 days</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-slate hover:text-brand-dark'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-12">
        {tab === 'Overview' && (
          <div className="space-y-4">
            <p className="text-brand-dark leading-relaxed">{medicine.description}</p>
            <div>
              <h3 className="font-semibold text-brand-dark mb-2">What it treats</h3>
              <ul className="space-y-1">
                {medicine.uses.map(u => (
                  <li key={u} className="flex items-start gap-2 text-sm text-brand-slate">
                    <CheckCircle size={14} className="text-brand-teal flex-shrink-0 mt-0.5" /> {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === 'Dosage & Usage' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-brand-blue mb-1">Dosage Instructions</p>
              <p className="text-sm text-brand-dark">{medicine.dosage}</p>
            </div>
            <p className="text-xs text-brand-slate italic">
              ⚠️ Always follow your doctor&apos;s prescription. Do not self-medicate or change your dose without medical advice.
            </p>
          </div>
        )}
        {tab === 'Side Effects' && (
          <div className="space-y-5">
            {[
              { level: 'Common', icon: <AlertTriangle size={16} className="text-amber-500" />, bg: 'bg-amber-50', items: medicine.sideEffects.common },
              { level: 'Serious', icon: <AlertTriangle size={16} className="text-orange-500" />, bg: 'bg-orange-50', items: medicine.sideEffects.serious },
              { level: 'Emergency — Call 112', icon: <AlertOctagon size={16} className="text-danger" />, bg: 'bg-red-50', items: medicine.sideEffects.emergency },
            ].map(({ level, icon, bg, items }) => (
              <div key={level} className={`${bg} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  {icon}
                  <p className="font-semibold text-sm text-brand-dark">{level} Side Effects</p>
                </div>
                <ul className="space-y-1">
                  {items.map(s => <li key={s} className="text-sm text-brand-slate flex items-start gap-1.5">· {s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        {tab === 'Storage' && (
          <div className="space-y-3">
            <p className="text-sm text-brand-dark">{medicine.storage}</p>
            {medicine.coldChain && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <Snowflake size={18} className="text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-brand-blue">Cold-Chain Required</p>
                  <p className="text-xs text-blue-700 mt-1">This medicine requires temperature-controlled storage (2–8°C). DrMed uses certified cold-chain packaging and real-time temperature monitoring for delivery.</p>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'Reviews' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-display font-bold text-5xl text-brand-dark">{medicine.rating}</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= Math.round(medicine.rating) ? 'fill-amber-400 text-amber-400' : 'text-faint'} />)}
                </div>
                <p className="text-xs text-brand-slate mt-1">{medicine.reviewCount} reviews</p>
              </div>
            </div>
            <p className="text-sm text-brand-slate italic">Patient reviews are moderated by our pharmacist team for accuracy and safety.</p>
          </div>
        )}
      </div>

      {/* Similar medicines */}
      {similar.length > 0 && (
        <section>
          <h2 className="section-heading mb-6">Similar Medicines</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {similar.map(m => <MedicineCard key={m.id} medicine={m} />)}
          </div>
        </section>
      )}
    </div>
  )
}
