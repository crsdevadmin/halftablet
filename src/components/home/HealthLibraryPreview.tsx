import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { HEALTH_ARTICLES } from '@/lib/mockData'

export function HealthLibraryPreview() {
  const featured = HEALTH_ARTICLES.slice(0, 3)
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-heading">Health Library</h2>
          <p className="text-brand-slate text-sm mt-1">Expert articles on medicines and conditions</p>
        </div>
        <Link href="/health" className="text-sm text-brand-blue font-semibold hover:underline">View all →</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {featured.map(article => (
          <Link key={article.id} href={`/health/${article.slug}`}
            className="card group overflow-hidden flex flex-col">
            <div className="relative h-44 bg-brand-grey overflow-hidden">
              <Image src={article.imageUrl} alt={article.title} fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
              <span className="absolute top-3 left-3 text-xs font-semibold bg-brand-blue text-white px-2 py-1 rounded-lg">
                {article.category}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-display font-semibold text-brand-dark text-sm leading-snug mb-2
                             group-hover:text-brand-blue transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="text-xs text-brand-slate line-clamp-2 mb-3 flex-1">{article.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-faint mt-auto">
                <span>{article.author}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {article.readTime} min</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
