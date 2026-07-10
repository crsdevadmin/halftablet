import Image from 'next/image'
import Link from 'next/link'
import { HEALTH_ARTICLES } from '@/lib/mockData'
import { Clock, Search } from 'lucide-react'

const CATEGORIES = ['All', 'Cancer Care', 'Kidney Care', 'HIV/AIDS', 'Hepatitis', 'Heart Health', 'Arthritis', 'Financial Aid']

export default function HealthLibraryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-blue to-blue-800 rounded-3xl p-8 mb-10 text-white text-center">
        <h1 className="font-display font-bold text-4xl mb-3">Health Library</h1>
        <p className="text-blue-200 text-lg mb-6">Expert-reviewed articles on medicines, conditions, and living well</p>
        <div className="max-w-lg mx-auto flex gap-2 bg-surface rounded-xl p-1.5">
          <Search size={18} className="ml-2 text-brand-slate self-center flex-shrink-0" />
          <input type="text" placeholder="Search articles..." className="flex-1 text-sm text-brand-dark outline-none px-2 bg-transparent" />
          <button className="bg-brand-orange text-white text-sm font-semibold px-4 py-2 rounded-lg">Search</button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c, i) => (
          <button key={c} className={`whitespace-nowrap text-sm font-medium px-4 py-2 rounded-full border transition-colors flex-shrink-0
            ${i === 0 ? 'bg-brand-blue text-white border-brand-blue' : 'border-border text-brand-slate hover:border-brand-blue hover:text-brand-blue'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...HEALTH_ARTICLES, ...HEALTH_ARTICLES].slice(0, 6).map((article, i) => (
          <Link key={`${article.id}-${i}`} href={`/health/${article.slug}`}
            className="card group overflow-hidden flex flex-col">
            <div className="relative h-48 bg-brand-grey overflow-hidden">
              <Image src={article.imageUrl} alt={article.title} fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
              <span className="absolute top-3 left-3 text-xs font-semibold bg-brand-blue text-white px-2 py-1 rounded-lg">
                {article.category}
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h2 className="font-display font-semibold text-brand-dark text-base leading-snug mb-2
                             group-hover:text-brand-blue transition-colors line-clamp-2">
                {article.title}
              </h2>
              <p className="text-sm text-brand-slate line-clamp-3 mb-4 flex-1">{article.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-faint border-t border-border pt-3 mt-auto">
                <span className="font-medium text-brand-slate truncate">{article.author}</span>
                <span className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <Clock size={11} /> {article.readTime} min read
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
