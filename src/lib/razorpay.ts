'use client'

/** Razorpay browser checkout helper. */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export interface PayOptions {
  orderId: string
  address?: Record<string, string>
  customerName?: string
  customerPhone?: string
}

export interface PayResult {
  ok: boolean
  error?: string
  cancelled?: boolean
  order?: { id: string; number: string; status: string; paymentStatus: string }
}

/**
 * Creates a Razorpay order server-side, opens the checkout popup, then
 * verifies the payment signature server-side. Resolves once done.
 */
export async function payForOrder(opts: PayOptions): Promise<PayResult> {
  const loaded = await loadScript()
  if (!loaded) return { ok: false, error: 'Could not load the payment window. Check your connection.' }

  const createRes = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: opts.orderId, address: opts.address }),
  })
  const created = await createRes.json()
  if (!createRes.ok) return { ok: false, error: created.error || 'Could not start payment' }

  return new Promise<PayResult>(resolve => {
    const rzp = new window.Razorpay!({
      key: created.keyId,
      amount: created.amount,
      currency: created.currency,
      order_id: created.razorpayOrderId,
      name: 'HalfTablet',
      description: `Order ${created.orderNumber}`,
      prefill: {
        name: opts.address?.name || opts.customerName || '',
        contact: opts.address?.phone || opts.customerPhone || '',
      },
      theme: { color: '#0f766e' },
      handler: async (response: Record<string, string>) => {
        const verifyRes = await fetch('/api/payments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: opts.orderId, ...response }),
        })
        const verified = await verifyRes.json()
        resolve(
          verifyRes.ok
            ? { ok: true, order: verified.order }
            : { ok: false, error: verified.error || 'Payment verification failed' }
        )
      },
      modal: {
        ondismiss: () => resolve({ ok: false, cancelled: true }),
      },
    })
    rzp.open()
  })
}
