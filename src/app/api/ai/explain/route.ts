import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MEDICINES } from '@/lib/mockData'

const LANGUAGES: Record<string, string> = {
  english: 'simple English',
  tamil: 'Tamil (தமிழ்)',
  hindi: 'Hindi (हिन्दी)',
}

/**
 * POST { prescriptionId, language: 'english' | 'tamil' | 'hindi' }
 * Plain-language explanation of the patient's selected medicines.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured' }, { status: 503 })

  const body = await req.json().catch(() => null)
  const prescriptionId = String(body?.prescriptionId ?? '')
  const language = LANGUAGES[String(body?.language ?? 'english')] ?? LANGUAGES.english

  const rx = await prisma.prescription.findUnique({ where: { id: prescriptionId } })
  if (!rx || rx.userId !== session.user.id) {
    return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
  }

  const requested = (rx.requestedItems as { medicineId: string }[] | null) ?? []
  const suggested = (rx.aiSuggestions as { id: string | null; name: string; note?: string }[] | null) ?? []
  const ids = requested.length > 0 ? requested.map(i => i.medicineId) : suggested.filter(s => s.id).map(s => s.id as string)
  const meds = MEDICINES.filter(m => ids.includes(m.id))
  if (meds.length === 0) {
    return NextResponse.json({ error: 'No medicines selected yet for this prescription' }, { status: 400 })
  }

  const medContext = meds
    .map(m => {
      const note = suggested.find(s => s.id === m.id)?.note
      return `- ${m.name} (${m.genericName})${note ? ` — prescribed: ${note}` : ''}
  Uses: ${JSON.stringify(m.uses)}
  Dosage guidance: ${m.dosage}
  Side effects: ${JSON.stringify(m.sideEffects)}
  Storage: ${m.storage}`
    })
    .join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      system: `You explain medicines to patients of an Indian specialty pharmacy in ${language}. Patients are often unwell, elderly, or stressed — be warm, clear, and brief. Use short sections per medicine: what it is for, how to take it, common side effects to expect, and when to call a doctor. NEVER change or question the prescribed regimen. End with one line reminding them to follow their doctor's advice. Plain text only, no markdown symbols like # or *.`,
      messages: [
        {
          role: 'user',
          content: `Explain these medicines from my prescription:\n${medContext}`,
        },
      ],
    }),
  })

  if (!res.ok) return NextResponse.json({ error: 'AI is temporarily unavailable' }, { status: 502 })
  const data = await res.json()
  const explanation: string = data.content?.[0]?.text ?? ''
  return NextResponse.json({ explanation })
}
