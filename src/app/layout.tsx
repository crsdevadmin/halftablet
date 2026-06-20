import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AIChat } from '@/components/ai/AIChat'

export const metadata: Metadata = {
  title: { default: 'DrMed — India\'s Intelligent Online Pharmacy', template: '%s | DrMed' },
  description: 'Buy specialty medicines for cancer, kidney, HIV, hepatitis & more. Up to 85% off. AI-powered search. Pan-India delivery.',
  keywords: ['online pharmacy india', 'cancer medicine', 'specialty pharmacy', 'buy medicine online'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'DrMed',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <AIChat />
      </body>
    </html>
  )
}
