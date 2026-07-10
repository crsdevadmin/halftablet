import type { Config } from 'tailwindcss'

/**
 * All colors resolve to CSS variables defined in globals.css.
 * `brand.*` names are aliases kept for backward compatibility —
 * existing markup re-themes (including dark mode) automatically.
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:        v('bg'),
        surface:   { DEFAULT: v('surface'), 2: v('surface-2') },
        border:    v('border'),
        fg:        v('fg'),
        muted:     v('muted'),
        faint:     v('faint'),
        primary:   { DEFAULT: v('primary'), soft: v('primary-soft') },
        cta:       v('cta'),
        accent:    v('accent'),
        danger:    v('danger'),
        warning:   v('warning'),
        // Legacy aliases
        brand: {
          blue:   v('primary'),
          teal:   v('accent'),
          orange: v('cta'),
          dark:   v('fg'),
          slate:  v('muted'),
          ice:    v('primary-soft'),
          grey:   v('surface-2'),
          red:    v('danger'),
          amber:  v('warning'),
        },
      },
      ringColor: { DEFAULT: v('ring') },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 3px rgb(16 42 67 / 0.06), 0 1px 2px rgb(16 42 67 / 0.04)',
        hover: '0 8px 24px rgb(16 42 67 / 0.12)',
        ai:    '0 8px 32px rgb(234 88 12 / 0.24)',
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
