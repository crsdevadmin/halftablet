# DrMed — India's Intelligent Online Pharmacy

A full Next.js 14 web application scaffold for the DrMed online pharmacy platform.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# 3. Run dev server
npm run dev
```

Open http://localhost:3000

## Pages Built

| Route | Page |
|-------|------|
| `/` | Homepage with hero, categories, AI teaser, offers |
| `/medicines` | Medicine catalog with search & filters |
| `/medicines/[id]` | Product detail with tabs (overview, dosage, side effects, storage) |
| `/cart` | Shopping cart with quantity management |
| `/checkout` | 3-step checkout (review → delivery/Rx → payment) |
| `/account` | Patient dashboard with orders, refills, AI reminders |
| `/conditions` | Browse by condition |
| `/health` | Health library articles |
| `/offers` | Deals and discount codes |

## Key Features

- **AI Chat Assistant** — floating widget on every page, calls OpenAI GPT-4o-mini
- **Smart Search** — autocomplete by medicine name, generic name, salt
- **Cart with Zustand** — persisted in localStorage across sessions
- **Prescription Upload UI** — built into checkout flow
- **Responsive** — mobile-first design, works on all screen sizes
- **Design System** — DrMed color palette, Poppins + Inter fonts, Tailwind utilities

## AI Setup

Add your key to `.env.local`:
```
OPENAI_API_KEY=sk-...
```

The AI assistant will fall back gracefully if no key is provided.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand (cart)
- **AI**: OpenAI GPT-4o-mini
- **Icons**: Lucide React
- **Language**: TypeScript

## Next Steps (Phase 1 completion)

- [ ] Connect PostgreSQL database (replace mock data)
- [ ] Add NextAuth.js for real authentication
- [ ] Integrate Razorpay payment gateway
- [ ] Add S3 file upload for prescriptions
- [ ] Add Twilio WhatsApp notifications
- [ ] Deploy to Vercel
