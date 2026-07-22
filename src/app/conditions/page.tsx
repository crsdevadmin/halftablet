import Link from 'next/link'
import { CONDITIONS } from '@/lib/mockData'

export default function ConditionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-4xl text-brand-dark mb-3">Browse by Condition</h1>
        <p className="text-brand-slate text-lg">Find specialty medicines for your specific health condition</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {CONDITIONS.map(c => (
          <Link key={c.id} href={`/medicines?category=${c.id}`}
            className="card p-6 flex flex-col items-center gap-4 group hover:-translate-y-1 transition-all duration-200 text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform`}>
              {c.icon}
            </div>
            <div>
              <p className="font-display font-bold text-brand-dark group-hover:text-brand-blue transition-colors">{c.label}</p>
              <p className="text-sm text-brand-slate mt-1">{c.count}+ medicines</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
