import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { AIChat } from '@/components/ai/AIChat'
import { Toaster } from '@/components/ui/Toaster'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: { default: 'HalfTablet — India\'s Intelligent Online Pharmacy', template: '%s | HalfTablet' },
  description: 'Buy specialty medicines for cancer, kidney, HIV, hepatitis & more. Up to 85% off. AI-powered search. Pan-India delivery.',
  keywords: ['online pharmacy india', 'cancer medicine', 'specialty pharmacy', 'buy medicine online'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'HalfTablet',
  },
}

// Applies saved/system theme before first paint — prevents dark-mode flash
const themeInit = `
try {
  var t = localStorage.getItem('halftablet-theme');
  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  if (localStorage.getItem('halftablet-elder') === '1') {
    document.documentElement.classList.add('elder');
  }
} catch (e) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100]
                     focus:bg-surface focus:text-primary focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-hover"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          {/* pb-16 clears the mobile bottom nav */}
          <main id="main" className="min-h-screen pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <AIChat />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
