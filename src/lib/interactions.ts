import type { Medicine } from '@/types'

/**
 * Cart-level medication safety checks:
 *  1. Duplicate salts — two products containing the same active ingredient
 *  2. Known drug–drug interactions between active ingredients
 *
 * The interaction list is a curated starter set for the current catalog.
 * It is a safety net, not a clinical decision tool — warnings always tell
 * the patient to consult the pharmacist, and the pharmacist reviews every
 * Rx order anyway.
 */

export interface SafetyWarning {
  kind: 'duplicate' | 'interaction'
  severity: 'caution' | 'serious'
  title: string
  detail: string
}

/** First word of the salt composition ≈ active ingredient key */
export function saltKey(m: Medicine): string {
  return m.saltComposition.trim().split(/\s+/)[0].toLowerCase()
}

interface InteractionRule {
  a: string
  b: string
  severity: 'caution' | 'serious'
  note: string
}

const INTERACTIONS: InteractionRule[] = [
  // Same-class duplicates a doctor would rarely prescribe together
  { a: 'palbociclib', b: 'ribociclib', severity: 'serious', note: 'These are both CDK4/6 inhibitors — they are not taken together.' },
  { a: 'letrozole', b: 'anastrozole', severity: 'serious', note: 'These are both aromatase inhibitors — only one is used at a time.' },
  { a: 'gefitinib', b: 'erlotinib', severity: 'serious', note: 'These are both EGFR inhibitors — only one is used at a time.' },
  { a: 'nivolumab', b: 'pembrolizumab', severity: 'serious', note: 'These are both PD-1 immunotherapies — they are not combined.' },
  { a: 'abiraterone', b: 'enzalutamide', severity: 'caution', note: 'These prostate cancer medicines are usually used one after the other, not together.' },
  { a: 'letrozole', b: 'tamoxifen', severity: 'caution', note: 'Taking these together can reduce effectiveness — they are normally used in sequence.' },
  // True interactions within the catalog
  { a: 'capecitabine', b: 'methotrexate', severity: 'caution', note: 'Combined use increases effects on blood counts. Regular blood tests are advisable.' },
  { a: 'methotrexate', b: 'hydroxyurea', severity: 'caution', note: 'Both can lower blood counts — combined use needs close monitoring.' },
  { a: 'lenalidomide', b: 'pomalidomide', severity: 'serious', note: 'These are related immunomodulators — only one is used at a time.' },
]

export function checkCartSafety(medicines: Medicine[]): SafetyWarning[] {
  const warnings: SafetyWarning[] = []

  // 1. Duplicate salts
  const bySalt = new Map<string, Medicine[]>()
  for (const m of medicines) {
    const key = saltKey(m)
    bySalt.set(key, [...(bySalt.get(key) ?? []), m])
  }
  for (const [, group] of bySalt) {
    if (group.length > 1) {
      warnings.push({
        kind: 'duplicate',
        severity: 'serious',
        title: `Duplicate medicine: ${group.map(m => m.name).join(' and ')}`,
        detail:
          'These products contain the same active ingredient. Taking both can cause an overdose — please keep only one, or check with our pharmacist.',
      })
    }
  }

  // 2. Known interactions
  const keys = medicines.map(m => ({ key: saltKey(m), name: m.name }))
  for (const rule of INTERACTIONS) {
    const first = keys.find(k => k.key === rule.a)
    const second = keys.find(k => k.key === rule.b)
    if (first && second) {
      warnings.push({
        kind: 'interaction',
        severity: rule.severity,
        title: `${first.name} + ${second.name}`,
        detail: `${rule.note} Please confirm this combination with your doctor or our pharmacist.`,
      })
    }
  }

  return warnings
}
