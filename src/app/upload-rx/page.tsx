import Link from 'next/link'
import { FileText, Search, ShoppingCart, Upload, CheckCircle2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'

export const metadata = { title: 'Upload Prescription — HalfTablet' }

const STEPS = [
  {
    icon: <Search size={20} aria-hidden />,
    title: 'Find your medicines',
    desc: 'Search by medicine name, salt name, or condition and add them to your cart.',
  },
  {
    icon: <ShoppingCart size={20} aria-hidden />,
    title: 'Go to checkout',
    desc: 'Sign in with your mobile number and confirm your delivery details.',
  },
  {
    icon: <Upload size={20} aria-hidden />,
    title: 'Upload your prescription',
    desc: 'At checkout you can upload a photo or PDF of your prescription (JPG, PNG or PDF, max 10MB).',
  },
  {
    icon: <CheckCircle2 size={20} aria-hidden />,
    title: 'Pharmacist verification',
    desc: 'Our licensed pharmacist reviews it within 2–4 hours and your order moves ahead.',
  },
]

export default function UploadRxPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-4">
          <FileText size={26} aria-hidden />
        </div>
        <h1 className="font-display font-bold text-3xl text-fg">Upload Your Prescription</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Prescriptions are uploaded during checkout, so they stay attached to your order and our
          pharmacist can verify them right away. Here&apos;s how it works:
        </p>
      </div>

      <ol className="space-y-4 mb-10">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="font-semibold text-fg text-sm">
                {i + 1}. {s.title}
              </p>
              <p className="text-sm text-muted mt-1">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/medicines" className={buttonVariants('primary', 'lg')}>
          Browse Medicines
        </Link>
        <Link href="/cart" className={buttonVariants('outline', 'lg')}>
          Go to My Cart
        </Link>
      </div>
    </div>
  )
}
