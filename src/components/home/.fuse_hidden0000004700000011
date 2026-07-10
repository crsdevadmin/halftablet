export function TrustBar() {
  const items = [
    { icon: '✅', title: '100% Genuine', desc: 'Sourced from licensed distributors' },
    { icon: '❄️', title: 'Cold-Chain Ready', desc: 'Temperature-controlled delivery' },
    { icon: '👨‍⚕️', title: 'Licensed Pharmacists', desc: 'Expert prescription review' },
    { icon: '💊', title: 'Up to 85% Off', desc: 'Guaranteed lowest price' },
    { icon: '🚚', title: 'Pan-India Delivery', desc: '2,000+ cities covered' },
  ]
  return (
    <section className="bg-brand-ice border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map(item => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="font-semibold text-brand-dark text-sm">{item.title}</p>
                <p className="text-xs text-brand-slate">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
