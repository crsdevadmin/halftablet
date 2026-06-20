import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:    '#1A6FBF',
          teal:    '#00A878',
          orange:  '#FF6B35',
          dark:    '#1C2B3A',
          slate:   '#4A6070',
          ice:     '#E8F4FD',
          grey:    '#F2F5F7',
          red:     '#D7263D',
          amber:   '#FFC300',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 2px 12px rgba(26,111,191,0.08)',
        hover: '0 8px 24px rgba(26,111,191,0.16)',
        ai:    '0 8px 32px rgba(255,107,53,0.24)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
