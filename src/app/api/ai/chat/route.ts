import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { MEDICINES } from '@/lib/mockData'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are DrMed AI, the helpful assistant for DrMed — India's intelligent online pharmacy specialising in specialty medicines for cancer, kidney disease, HIV/AIDS, hepatitis, heart conditions, arthritis, diabetes, and transplant care.

You help patients:
1. Find medicines by name, salt name, or condition
2. Understand dosage and side effects in plain English (not medical jargon)
3. Find cheaper generic alternatives to branded medicines
4. Learn about Patient Assistance Programs (free/subsidised medicines from manufacturers)
5. Track their orders
6. Decide when to upload a prescription

STRICT RULES:
- NEVER diagnose a condition or recommend a specific medicine to treat a new condition
- NEVER tell someone to change or stop their prescribed medication
- ALWAYS add "Please confirm with your doctor or pharmacist" for clinical questions
- If someone describes emergency symptoms (chest pain, difficulty breathing, stroke), immediately say: "This sounds like a medical emergency. Please call 112 or go to the nearest hospital immediately."
- Keep responses concise and friendly — patients are often unwell or stressed
- When mentioning prices, use Indian Rupees (₹)
- If you are unsure about something, say so and offer to connect them with a pharmacist

Available medicine catalog context:
${MEDICINES.slice(0, 5).map(m => `- ${m.name} (${m.genericName}): ₹${m.drmedPrice} (${m.discountPercent}% off MRP ₹${m.mrp}), ${m.requiresPrescription ? 'Rx required' : 'No Rx needed'}`).join('\n')}

You can also tell users that DrMed carries 5,000+ specialty medicines with up to 85% discount.`

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Find relevant medicines to attach as cards
    const query = message.toLowerCase()
    const matchedMedicines = MEDICINES.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.genericName.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      m.tags.some(t => query.includes(t.toLowerCase()))
    ).slice(0, 3)

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...((history || []).slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))),
      { role: 'user' as const, content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 400,
      temperature: 0.6,
    })

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again."

    return NextResponse.json({
      reply,
      medicines: matchedMedicines.length > 0 ? matchedMedicines : undefined,
    })
  } catch (error: unknown) {
    console.error('AI chat error:', error)
    const isApiKeyMissing = !process.env.OPENAI_API_KEY
    return NextResponse.json({
      reply: isApiKeyMissing
        ? "AI assistant is not configured yet. Add your OPENAI_API_KEY to .env.local to enable it. For now, you can browse medicines directly or call us at 1800-XXX-XXXX."
        : "I'm having trouble right now. Please try again in a moment.",
    }, { status: isApiKeyMissing ? 200 : 500 })
  }
}
