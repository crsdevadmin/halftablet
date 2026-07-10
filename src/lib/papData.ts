import { MedicineCategory } from '@/types'

/**
 * Patient Assistance Program directory (demo data, Phase 5).
 * Modeled on the kinds of programs that exist in India — pharma access
 * programs, government schemes, and NGO funds. Details here are
 * illustrative: the production version needs a verified, regularly
 * audited directory.
 */

export type IncomeBand = 'below-3l' | '3l-8l' | 'above-8l'
export type ProgramType = 'pharma' | 'government' | 'ngo'

export interface AssistanceProgram {
  id: string
  name: string
  sponsor: string
  type: ProgramType
  /** Conditions covered; empty = all */
  categories: MedicineCategory[]
  /** Highest income band that qualifies */
  maxIncomeBand: IncomeBand
  /** Whether having insurance disqualifies */
  excludesInsured: boolean
  benefit: string
  documents: string[]
  howToApply: string
}

export const PROGRAMS: AssistanceProgram[] = [
  {
    id: 'pharma-onco-access',
    name: 'Oncology Patient Access Program',
    sponsor: 'Pharma manufacturer programs (e.g. for imatinib, trastuzumab)',
    type: 'pharma',
    categories: ['cancer'],
    maxIncomeBand: '3l-8l',
    excludesInsured: false,
    benefit: 'Free or heavily subsidised medicine for the full treatment duration, based on income assessment',
    documents: ['Prescription from an oncologist', 'Income certificate or ITR', 'Aadhaar', 'Biopsy/diagnosis report'],
    howToApply: 'Applications go through your treating oncologist or the program\'s partner NGO. DrMed patient support can initiate this with you.',
  },
  {
    id: 'pharma-hep-access',
    name: 'Hepatitis Treatment Access Program',
    sponsor: 'Pharma manufacturer programs (e.g. for sofosbuvir-based regimens)',
    type: 'pharma',
    categories: ['hepatitis'],
    maxIncomeBand: '3l-8l',
    excludesInsured: false,
    benefit: 'Subsidised generic pricing and, for eligible patients, free courses',
    documents: ['Prescription', 'Viral load report', 'Income proof', 'Aadhaar'],
    howToApply: 'Through the manufacturer\'s patient support line or DrMed patient support.',
  },
  {
    id: 'govt-pmjay',
    name: 'Ayushman Bharat PM-JAY',
    sponsor: 'Government of India',
    type: 'government',
    categories: [],
    maxIncomeBand: 'below-3l',
    excludesInsured: true,
    benefit: '₹5 lakh per family per year covering hospitalisation, including many cancer treatments and dialysis',
    documents: ['Aadhaar', 'Ration card / SECC listing', 'Mobile number'],
    howToApply: 'Check eligibility at pmjay.gov.in or any empanelled hospital\'s Ayushman Mitra desk.',
  },
  {
    id: 'govt-janaushadhi',
    name: 'PM Bhartiya Janaushadhi Pariyojana',
    sponsor: 'Government of India',
    type: 'government',
    categories: [],
    maxIncomeBand: 'above-8l',
    excludesInsured: false,
    benefit: 'Generic medicines at 50–90% below branded prices from 10,000+ Janaushadhi Kendras',
    documents: ['Just your prescription'],
    howToApply: 'Visit any Janaushadhi Kendra — find the nearest at janaushadhi.gov.in.',
  },
  {
    id: 'govt-cm-fund',
    name: 'State CM Relief Fund (medical assistance)',
    sponsor: 'State governments',
    type: 'government',
    categories: ['cancer', 'kidney', 'heart', 'transplant'],
    maxIncomeBand: 'below-3l',
    excludesInsured: false,
    benefit: 'One-time grants (typically ₹50,000–₹3,00,000) for life-threatening conditions',
    documents: ['Treatment estimate from hospital', 'Income certificate', 'Aadhaar', 'Application via MLA/collector office'],
    howToApply: 'Apply through your district collector\'s office or your state\'s online portal.',
  },
  {
    id: 'ngo-dialysis',
    name: 'NGO Dialysis Support Funds',
    sponsor: 'NGO networks (state-specific)',
    type: 'ngo',
    categories: ['kidney'],
    maxIncomeBand: '3l-8l',
    excludesInsured: false,
    benefit: 'Subsidised dialysis sessions and EPO injections at partner centres',
    documents: ['Nephrologist prescription', 'Income proof'],
    howToApply: 'DrMed patient support can connect you to partner NGOs in your state.',
  },
  {
    id: 'govt-art',
    name: 'National AIDS Control Programme (ART centres)',
    sponsor: 'Government of India — NACO',
    type: 'government',
    categories: ['hiv'],
    maxIncomeBand: 'above-8l',
    excludesInsured: false,
    benefit: 'Free antiretroviral therapy for all, regardless of income, at 700+ ART centres',
    documents: ['ID proof', 'HIV diagnosis report'],
    howToApply: 'Register at your nearest ART centre — no income criteria.',
  },
  {
    id: 'ngo-cancer-fund',
    name: 'Cancer Patient Aid Funds',
    sponsor: 'NGO networks (e.g. patient aid associations)',
    type: 'ngo',
    categories: ['cancer'],
    maxIncomeBand: 'below-3l',
    excludesInsured: false,
    benefit: 'Financial aid for chemotherapy cycles, travel, and nutrition support',
    documents: ['Diagnosis report', 'Income certificate', 'Treatment plan'],
    howToApply: 'Apply directly or via your hospital\'s medical social worker.',
  },
]

export interface MatchInput {
  category: MedicineCategory | ''
  incomeBand: IncomeBand
  hasInsurance: boolean
}

const bandRank: Record<IncomeBand, number> = { 'below-3l': 0, '3l-8l': 1, 'above-8l': 2 }

export function matchPrograms({ category, incomeBand, hasInsurance }: MatchInput): AssistanceProgram[] {
  return PROGRAMS.filter(p => {
    if (p.categories.length > 0 && category && !p.categories.includes(category)) return false
    if (p.categories.length > 0 && !category) return false
    if (bandRank[incomeBand] > bandRank[p.maxIncomeBand]) return false
    if (p.excludesInsured && hasInsurance) return false
    return true
  }).sort((a, b) => {
    // Condition-specific programs first, then pharma > government > ngo
    const spec = (p: AssistanceProgram) => (p.categories.length > 0 ? 0 : 1)
    return spec(a) - spec(b)
  })
}

export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  pharma: 'Pharma Program',
  government: 'Government Scheme',
  ngo: 'NGO Fund',
}
