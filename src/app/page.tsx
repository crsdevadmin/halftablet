import { HeroSection } from '@/components/home/HeroSection'
import { TrustBar } from '@/components/home/TrustBar'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { AITeaser } from '@/components/home/AITeaser'
import { OffersStrip } from '@/components/home/OffersStrip'
import { HealthLibraryPreview } from '@/components/home/HealthLibraryPreview'
import { MedicineCard } from '@/components/medicines/MedicineCard'
import { MEDICINES } from '@/lib/mockData'

export default function HomePage() {
  const featured = MEDICINES.slice(0, 4)
  return (
    <>
      <HeroSection />
      <TrustBar />
      <CategoryGrid />
      <AITeaser />

      {/* Featured medicines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-heading">Featured Medicines</h2>
            <p className="text-brand-slate text-sm mt-1">Top-selling specialty medicines with best discounts</p>
          </div>
          <a href="/medicines" className="text-sm text-brand-blue font-semibold hover:underline">View all →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(m => <MedicineCard key={m.id} medicine={m} />)}
        </div>
      </section>

      <OffersStrip />
      <HealthLibraryPreview />

      {/* Patient Assistance CTA */}
      <section className="bg-brand-teal/10 border-y border-teal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="section-heading text-brand-teal mb-3">Can&apos;t Afford Your Medicine?</h2>
          <p className="text-brand-slate max-w-xl mx-auto mb-6">
            Many pharmaceutical companies offer Patient Assistance Programs — providing medicines free or at highly subsidised rates. Let us guide you.
          </p>
          <a href="/patient-assistance" className="btn-secondary inline-block">
            Learn About Free Medicine Programs
          </a>
        </div>
      </section>
    </>
  )
}
