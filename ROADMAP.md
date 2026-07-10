# DrMed — Phase-wise Product Roadmap

Positioning: India's specialty-medicine pharmacy (cancer, kidney, HIV, hepatitis, transplant).
Compete on trust and chronic-care experience, not discounts.

---

## Phase 0 — UI Foundation ✅ (done)

- Token-based design system (CSS variables, light/dark mode)
- Reusable component library: Button, Badge, Input, Skeleton, EmptyState, Toaster, QuantityStepper, BottomSheet
- Header with inline search, mobile bottom nav, keyboard/screen-reader accessibility
- URL-synced catalog filters, cart feedback (toasts, undo, steppers)

---

## Phase 1 — Admin Dashboard & Inventory (mock data) · ~1–2 weeks

Goal: operational visibility, still no backend required.

- `/admin` dashboard: revenue, orders, top-selling medicines (charts)
- Stock table: quantity on hand, low-stock alerts, expiry-date warnings
- Batch management UI: batch number, expiry, cold-chain flag per lot
- Order pipeline board: Pending Rx → Rx Verified → Confirmed → Dispatched → Delivered
- Role-gated route (simple auth placeholder until Phase 2)

Exit criteria: pharmacist can see stock and orders at a glance; UI ready to plug into a real DB.

## Phase 2 — Backend Foundation · ~3–4 weeks

Goal: replace all mock data.

- PostgreSQL + Prisma (medicines, batches, orders, users, prescriptions)
- NextAuth.js: phone OTP login, roles (customer / pharmacist / admin)
- Real cart + order creation, server-side stock decrement
- Prescription upload to S3 (or Cloudflare R2) with pharmacist review queue
- Admin dashboard wired to live data

Exit criteria: an order can be placed, stock updates, Rx reviewed — end to end.

## Phase 3 — Payments & Notifications · ~2–3 weeks

- Razorpay: UPI, cards, netbanking, COD flag + reconciliation
- WhatsApp Business API (Gupshup/Twilio): order confirmations, Rx-verified alerts, delivery updates
- Email receipts and invoices (GST-compliant PDF)
- Refund flow

Exit criteria: real money in, customer notified at every order stage.

## Phase 4 — Delivery & Logistics · ~2–3 weeks

- Shiprocket or Delhivery API: auto-create shipments, label printing, live tracking page
- Cold-chain: partner SLA + temperature log shown on the order ("stayed 2–8°C")
- Serviceability check by PIN code at product page and checkout
- Same-day metro option (Dunzo/Porter) where viable

Exit criteria: customer tracks a real parcel inside DrMed, not a courier site.

## Phase 5 — Differentiators (the moat) · ongoing after Phase 2

Ordered by impact:

1. **Patient Assistance Program finder** — wizard matching diagnosis + medicine + income to pharma free/subsidy programs
2. **Refill autopilot** — subscriptions for chronic meds, price-lock, WhatsApp "reply YES to ship"
3. **Elder-friendly mode** — large text, high contrast, simplified layout toggle
4. **"Explain my prescription"** — AI plain-language breakdown, multilingual (Tamil/Hindi/English)
5. **Caregiver mode** — manage a family member's medications, shared alerts
6. **Interaction & duplicate-salt checker** at cart level
7. **Treatment cost planner** — monthly regimen cost, generic substitutes, insurance claim doc bundle

## Phase 6 — Trust & Compliance · parallel to Phases 2–4

- Drug license no. + registered pharmacist displayed site-wide (legally required)
- Named-pharmacist Rx verification timeline visible to the patient
- Batch number + expiry on every order; QR authenticity check where supported
- Verified-purchase-only reviews
- Legal: Schedule H/H1 compliance, no Schedule X online, Telemedicine Practice Guidelines for consults, DPDP Act data privacy
- Multilingual UI (start with Tamil + Hindi)

---

## Suggested sequence

Phase 1 → 2 → 3 → 4 in order; Phase 6 items start alongside Phase 2; Phase 5 features ship one at a time from Phase 2 onward (PAP finder first — it's the headline differentiator).
