import Link from 'next/link'

const links = {
  Medicines: [
    { label: 'Cancer Medicines', href: '/medicines?category=cancer' },
    { label: 'Kidney Care', href: '/medicines?category=kidney' },
    { label: 'HIV/AIDS', href: '/medicines?category=hiv' },
    { label: 'Hepatitis', href: '/medicines?category=hepatitis' },
    { label: 'All Medicines', href: '/medicines' },
  ],
  Services: [
    { label: 'Patient Assistance', href: '/patient-assistance' },
    { label: 'Doctor Consult', href: '/consult' },
    { label: 'Lab Tests', href: '/labs' },
    { label: 'Offers & Discounts', href: '/offers' },
    { label: 'Upload Prescription', href: '/upload-rx' },
  ],
  Company: [
    { label: 'About HalfTablet', href: '/about' },
    { label: 'Health Library', href: '/health' },
    { label: 'News', href: '/news' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Return Policy', href: '/returns' },
    { label: 'Shipping Policy', href: '/shipping' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-brand-dark text-faint mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1 mb-4">
              <span className="font-display font-bold text-2xl text-white">Dr</span>
              <span className="font-display font-bold text-2xl text-brand-orange">Med</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              India&apos;s intelligent online pharmacy. 5,000+ specialty medicines. Up to 85% off. AI-powered search.
            </p>
            <div className="space-y-1 text-xs">
              <p>📍 Chennai, Tamil Nadu, India</p>
              <p>📞 1800-XXX-XXXX (Toll Free)</p>
              <p>✉️ care@halftablet.in</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href}
                      className="text-sm hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="flex flex-wrap gap-6 justify-center text-xs text-muted">
            {['✓ CDSCO Licensed', '✓ ISO 9001:2015', '✓ Cold-Chain Certified', '✓ 100% Genuine Medicines', '✓ DPDP Compliant'].map(b => (
              <span key={b} className="font-medium">{b}</span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted">
          <p>© 2026 HalfTablet Pharmacy Pvt. Ltd. All rights reserved.</p>
          <p className="text-center">
            Medicines shown are for informational purposes. Always consult a doctor before taking any medication.
          </p>
        </div>
      </div>
    </footer>
  )
}
