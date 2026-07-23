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
  {
    a: 'imatinib',
    b: 'tacrolimus',
    severity: 'serious',
    note: 'Imatinib can raise tacrolimus blood levels. Your doctor may need to monitor levels closely.',
  },
  {
    a: 'amlodipine',
    b: 'tacrolimus',
    severity: 'caution',
    note: 'Amlodipine may increase tacrolimus levels. Blood level monitoring is advisable.',
  },
  {
    a: 'methotrexate',
    b: 'tenofovir',
    severity: 'caution',
    note: 'Both medicines can affect the kidneys. Kidney function should be monitored when used together.',
  },
  {
    a: 'imatinib',
    b: 'methotrexate',
    severity: 'caution',
    note: 'Combined use may increase side effects on blood counts. Regular blood tests are advisable.',
  },
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
