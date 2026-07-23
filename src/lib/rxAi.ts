import { MEDICINES } from '@/lib/mockData'

/**
 * AI-assisted prescription reading (Claude vision).
 * Given the uploaded Rx image/PDF, returns the medicines it mentions,
 * matched to our catalog where possible. Suggestions only — a licensed
 * pharmacist always verifies before an order is prepared.
 */
export interface RxSuggestion {
  id: string | null // catalog medicine id (m1, m2, …) or null if not in catalog
  name: string // medicine name as written / matched
  note?: string // dosage or instructions, if legible
}

export async function extractMedicinesFromRx(
  data: Buffer,
  contentType: string
): Promise<RxSuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return []

  const catalog = MEDICINES.map(m => `${m.id} | ${m.name} | ${m.genericName}`).join('\n')
  const source = {
    type: 'base64',
    media_type: contentType,
    data: data.toString('base64'),
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            contentType === 'application/pdf'
              ? { type: 'document', source }
              : { type: 'image', source },
            {
              type: 'text',
              text: `Read this medical prescription carefully and list every medicine it prescribes.

Match each medicine to this pharmacy catalog when possible (id | brand name | generic name):
${catalog}

Respond with ONLY a JSON array, no other text, like:
[{"id":"m1","name":"Medicine Name","note":"1 tablet twice daily"}]

Rules:
- "id" = the catalog id if the medicine (by brand or generic/salt name) matches a catalog entry, otherwise null
- "name" = the medicine name as written in the prescription (or the catalog name if matched)
- "note" = dosage/instructions if legible, otherwise omit
- If the image is not a prescription or no medicines are legible, respond with []`,
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) return []

  const dataJson = await res.json()
  const text: string = dataJson.content?.[0]?.text ?? ''
  const jsonText = text.replace(/```json|```/g, '').trim()
  const start = jsonText.indexOf('[')
  const end = jsonText.lastIndexOf(']')
  if (start === -1 || end === -1) return []

  try {
    const parsed = JSON.parse(jsonText.slice(start, end + 1))
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(x => x && typeof x.name === 'string')
      .slice(0, 15)
      .map(x => {
        const name = String(x.name).slice(0, 120)
        let id: string | null =
          typeof x.id === 'string' && MEDICINES.some(m => m.id === x.id) ? x.id : null
        // Fallback: match by name if the model didn't return a catalog id
        if (!id) {
          const q = name.toLowerCase()
          const hit = MEDICINES.find(m => {
            const brand = m.name.toLowerCase()
            const generic = m.genericName.toLowerCase()
            // strip strength ("imatinib 400mg" → "imatinib") for looser matching
            const base = brand.replace(/\s*\d+.*$/, '')
            return (
              q.includes(base) || brand.includes(q) || q.includes(generic) || generic.includes(q)
            )
          })
          if (hit) id = hit.id
        }
        return {
          id,
          name,
          ...(typeof x.note === 'string' ? { note: x.note.slice(0, 200) } : {}),
        }
      })
  } catch {
    return []
  }
}
