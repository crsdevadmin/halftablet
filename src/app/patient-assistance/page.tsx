'use client'
import { useState } from 'react'
import Link from 'next/link'
import { HeartHandshake, ChevronLeft, FileText, Landmark, HandHeart, Pill, CheckCircle2, RotateCcw } from 'lucide-react'
import { CONDITIONS } from '@/lib/mockData'
import { MedicineCategory } from '@/types'
import {
  matchPrograms, PROGRAM_TYPE_LABELS,
  type IncomeBand, type ProgramType, type AssistanceProgram,
} from '@/lib/papData'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const TYPE_ICON: Record<ProgramType, React.ReactNode> = {
  pharma: <Pill size={16} aria-hidden />,
  government: <Landmark size={16} aria-hidden />,
  ngo: <HandHeart size={16} aria-hidden />,
}

const INCOME_OPTIONS: { value: IncomeBand; label: string; hint: string }[] = [
  { value: 'below-3l', label: 'Below ₹3 lakh', hint: 'Qualifies for the most programs' },
  { value: '3l-8l', label: '₹3 – 8 lakh', hint: 'Many pharma & NGO programs available' },
  { value: 'above-8l', label: 'Above ₹8 lakh', hint: 'Generic-substitution savings still apply' },
]

function ProgramCard({ program }: { program: AssistanceProgram }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-fg">{program.name}</h3>
          <p className="text-xs text-muted mt-0.5">{program.sponsor}</p>
        </div>
        <Badge variant={program.type === 'government' ? 'cold' : program.type === 'pharma' ? 'success' : 'rx'}>
          {TYPE_ICON[program.type]} {PROGRAM_TYPE_LABELS[program.type]}
        </Badge>
      </div>
      <p className="text-sm text-fg mt-3">{program.benefit}</p>
      {open && (
        <div className="mt-4 space-y-3 animate-fade-in">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Documents needed</p>
            <ul className="space-y-1">
              {program.documents.map(d => (
                <li key={d} className="text-sm text-fg flex items-start gap-2">
                  <FileText size={13} className="text-faint mt-0.5 flex-shrink-0" aria-hidden /> {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">How to apply</p>
            <p className="text-sm text-fg">{program.howToApply}</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 mt-4">
        <Button size="sm" variant="outline" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          {open ? 'Hide details' : 'View details'}
        </Button>
        <button data-ai-open="true" className="text-sm text-primary font-semibold hover:underline">
          Get help applying
        </button>
      </div>
    </div>
  )
}

export default function PatientAssistancePage() {
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState<MedicineCategory | ''>('')
  const [incomeBand, setIncomeBand] = useState<IncomeBand | null>(null)
  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null)

  const results = step === 3 && incomeBand !== null && hasInsurance !== null
    ? matchPrograms({ category, incomeBand, hasInsurance })
    : []

  const reset = () => {
    setStep(0)
    setCategory('')
    setIncomeBand(null)
    setHasInsurance(null)
  }

  const optionBtn = (active: boolean) =>
    cn(
      'w-full text-left p-4 rounded-xl border-2 transition-all',
      active ? 'border-primary bg-primary-soft' : 'border-border hover:border-primary/50'
    )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HeartHandshake size={28} className="text-accent" aria-hidden />
        </div>
        <h1 className="font-display font-bold text-3xl text-fg">Can&apos;t afford your medicine?</h1>
        <p className="text-muted mt-2 max-w-md mx-auto">
          Answer 3 questions and we&apos;ll match you with assistance programs — many provide medicines free or heavily subsidised.
        </p>
      </div>

      {/* Progress */}
      {step < 3 && (
        <div className="flex items-center gap-2 mb-6" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map(i => (
            <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-surface-2')} />
          ))}
        </div>
      )}

      {/* Step 0: condition */}
      {step === 0 && (
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-display font-semibold text-lg text-fg">Which condition is the medicine for?</h2>
          <div className="grid grid-cols-2 gap-3">
            {CONDITIONS.map(c => (
              <button key={c.id} onClick={() => { setCategory(c.id as MedicineCategory); setStep(1) }}
                className={optionBtn(category === c.id)}>
                <span className="text-xl" aria-hidden>{c.icon}</span>
                <span className="block text-sm font-semibold text-fg mt-1">{c.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => { setCategory(''); setStep(1) }} className="text-sm text-primary font-medium hover:underline">
            My condition isn&apos;t listed →
          </button>
        </div>
      )}

      {/* Step 1: income */}
      {step === 1 && (
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-display font-semibold text-lg text-fg">Annual family income?</h2>
          <p className="text-sm text-muted">Programs use income bands to decide eligibility. This stays on your device.</p>
          {INCOME_OPTIONS.map(o => (
            <button key={o.value} onClick={() => { setIncomeBand(o.value); setStep(2) }}
              className={optionBtn(incomeBand === o.value)}>
              <span className="block text-sm font-semibold text-fg">{o.label}</span>
              <span className="block text-xs text-muted mt-0.5">{o.hint}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: insurance */}
      {step === 2 && (
        <div className="space-y-3 animate-fade-in">
          <h2 className="font-display font-semibold text-lg text-fg">Do you have health insurance?</h2>
          <p className="text-sm text-muted">Including employer cover or government schemes you&apos;re already enrolled in.</p>
          {[[false, 'No insurance'], [true, 'Yes, I have insurance']].map(([val, label]) => (
            <button key={String(val)} onClick={() => { setHasInsurance(val as boolean); setStep(3) }}
              className={optionBtn(hasInsurance === val)}>
              <span className="text-sm font-semibold text-fg">{label as string}</span>
            </button>
          ))}
        </div>
      )}

      {/* Back link for steps 1–2 */}
      {step > 0 && step < 3 && (
        <button onClick={() => setStep(s => s - 1)} className="mt-5 text-sm text-muted hover:text-primary inline-flex items-center gap-1">
          <ChevronLeft size={14} aria-hidden /> Back
        </button>
      )}

      {/* Step 3: results */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-display font-semibold text-lg text-fg inline-flex items-center gap-2">
              <CheckCircle2 size={20} className="text-accent" aria-hidden />
              {results.length} program{results.length === 1 ? '' : 's'} match your situation
            </h2>
            <button onClick={reset} className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
              <RotateCcw size={13} aria-hidden /> Start over
            </button>
          </div>

          {results.map(p => <ProgramCard key={p.id} program={p} />)}

          {results.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-sm text-muted">
                No direct matches — but generic substitutes can still cut costs by 50–90%.{' '}
                <Link href="/medicines" className="text-primary font-semibold hover:underline">Browse medicines</Link>
              </p>
            </div>
          )}

          <p className="text-xs text-faint pt-2">
            Program details are indicative and change over time — always verify eligibility with the program directly.
            HalfTablet patient support can guide you through any application free of charge.
          </p>
        </div>
      )}
    </div>
  )
}
