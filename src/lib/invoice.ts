import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * GST-compliant invoice PDF for an order.
 * Medicines are taxed at 12% GST (6% CGST + 6% SGST) and the delivery fee at
 * 18%, both treated as inclusive of tax (prices shown to the patient don't
 * change). Amounts are in paise-free integer rupees, rendered as "Rs.".
 *
 * TODO before real sales: replace SELLER with your registered details.
 */
const SELLER = {
  name: 'HalfTablet Pharmacy Pvt Ltd',
  address: 'No. 1, Anna Salai, Chennai, Tamil Nadu 600002',
  gstin: '33AAAAA0000A1Z5 (placeholder — replace)',
  dlNo: 'TN-CHE-XXXXX (placeholder — replace)',
  email: 'care@halftablet.in',
}

const GST_MED = 0.12
const GST_DELIVERY = 0.18

export interface InvoiceItem {
  name: string
  quantity: number
  unitPrice: number
}

export interface InvoiceData {
  number: string
  createdAt: Date
  customerName: string
  customerPhone: string
  address: Record<string, unknown>
  items: InvoiceItem[]
  deliveryFee: number
  total: number
}

const fmt = (n: number) => `Rs. ${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export async function buildInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  let page = doc.addPage([595, 842]) // A4
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const teal = rgb(0.05, 0.45, 0.42)
  const gray = rgb(0.4, 0.4, 0.4)
  const black = rgb(0.1, 0.1, 0.1)
  let y = 800

  const text = (
    str: string,
    x: number,
    opts: { size?: number; font?: typeof font; color?: typeof black } = {}
  ) => {
    page.drawText(str, { x, y, size: opts.size ?? 10, font: opts.font ?? font, color: opts.color ?? black })
  }
  const line = () => {
    page.drawLine({ start: { x: 40, y: y + 4 }, end: { x: 555, y: y + 4 }, thickness: 0.5, color: gray })
  }

  // Header
  text('HalfTablet', 40, { size: 22, font: bold, color: teal })
  text('TAX INVOICE', 440, { size: 14, font: bold })
  y -= 18
  text('Specialty medicines, honestly priced', 40, { size: 9, color: gray })
  y -= 30

  // Seller / invoice meta
  text(SELLER.name, 40, { font: bold })
  text(`Invoice No: ${data.number}`, 380, { font: bold })
  y -= 14
  text(SELLER.address, 40, { size: 9, color: gray })
  text(
    `Date: ${data.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    380,
    { size: 9 }
  )
  y -= 14
  text(`GSTIN: ${SELLER.gstin}`, 40, { size: 9, color: gray })
  y -= 14
  text(`Drug Licence: ${SELLER.dlNo}`, 40, { size: 9, color: gray })
  y -= 26

  // Buyer
  const a = data.address as Record<string, string>
  text('Billed to:', 40, { size: 9, color: gray })
  y -= 14
  text(a?.name || data.customerName || 'Customer', 40, { font: bold })
  y -= 13
  text(`Phone: ${a?.phone || data.customerPhone}`, 40, { size: 9 })
  y -= 13
  const addrLine = [a?.line1, a?.line2, a?.city, a?.state, a?.pincode].filter(Boolean).join(', ')
  if (addrLine) {
    text(addrLine.slice(0, 95), 40, { size: 9 })
    y -= 13
  }
  y -= 12

  // Table header
  line()
  y -= 14
  text('#', 40, { font: bold, size: 9 })
  text('Item', 60, { font: bold, size: 9 })
  text('Qty', 320, { font: bold, size: 9 })
  text('Rate (incl. GST)', 355, { font: bold, size: 9 })
  text('Taxable', 445, { font: bold, size: 9 })
  text('Amount', 505, { font: bold, size: 9 })
  y -= 6
  line()
  y -= 16

  let taxableTotal = 0
  let gstTotal = 0

  data.items.forEach((item, i) => {
    if (y < 140) {
      page = doc.addPage([595, 842])
      y = 800
    }
    const amount = item.unitPrice * item.quantity
    const taxable = amount / (1 + GST_MED)
    const gst = amount - taxable
    taxableTotal += taxable
    gstTotal += gst
    text(String(i + 1), 40, { size: 9 })
    text(item.name.slice(0, 48), 60, { size: 9 })
    text(String(item.quantity), 320, { size: 9 })
    text(fmt(item.unitPrice), 355, { size: 9 })
    text(fmt(Math.round(taxable * 100) / 100), 445, { size: 9 })
    text(fmt(amount), 505, { size: 9 })
    y -= 16
  })

  if (data.deliveryFee > 0) {
    const taxable = data.deliveryFee / (1 + GST_DELIVERY)
    taxableTotal += taxable
    gstTotal += data.deliveryFee - taxable
    text(String(data.items.length + 1), 40, { size: 9 })
    text('Delivery charges', 60, { size: 9 })
    text('1', 320, { size: 9 })
    text(fmt(data.deliveryFee), 355, { size: 9 })
    text(fmt(Math.round(taxable * 100) / 100), 445, { size: 9 })
    text(fmt(data.deliveryFee), 505, { size: 9 })
    y -= 16
  }

  y -= 4
  line()
  y -= 18

  // Totals
  const cgst = gstTotal / 2
  text('Taxable value:', 380, { size: 9 })
  text(fmt(Math.round(taxableTotal * 100) / 100), 495, { size: 9 })
  y -= 14
  text('CGST:', 380, { size: 9 })
  text(fmt(Math.round(cgst * 100) / 100), 495, { size: 9 })
  y -= 14
  text('SGST:', 380, { size: 9 })
  text(fmt(Math.round(cgst * 100) / 100), 495, { size: 9 })
  y -= 16
  text('Grand Total:', 380, { font: bold, size: 11 })
  text(fmt(data.total), 495, { font: bold, size: 11 })
  y -= 30

  text('Medicines taxed at 12% GST (inclusive); delivery at 18% GST (inclusive).', 40, { size: 8, color: gray })
  y -= 12
  text('This is a computer-generated invoice and does not require a signature.', 40, { size: 8, color: gray })
  y -= 12
  text(`Questions? ${SELLER.email}`, 40, { size: 8, color: gray })

  return doc.save()
}
