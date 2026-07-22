import Link from 'next/link'
import { CONDITIONS } from '@/lib/mockData'

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="section-heading">Browse by Condition</h2>
        <p className="text-brand-slate mt-2 text-sm">Find medicines for your specific health condition</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CONDITIONS.map(c => (
          <Link key={c.id} href={`/medicines?category=${c.id}`}
            className="card p-5 flex flex-col items-center gap-3 group cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
              {c.icon}
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-brand-dark text-sm group-hover:text-brand-blue transition-colors">
                {c.label}
              </p>
              <p className="text-xs text-brand-slate mt-0.5">{c.count}+ medicines</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
