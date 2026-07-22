'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Smartphone, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account'

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not send OTP')
        return
      }
      if (data.debugOtp) {
        setOtp(data.debugOtp)
        toast(`Test mode — your OTP is ${data.debugOtp}`, { kind: 'info' })
      } else {
        toast('OTP sent — check the dev server console', { kind: 'info' })
      }
      setStep('otp')
    } catch {
      setError('Network error. Is the dev server running?')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { phone, otp, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('Invalid or expired OTP')
      return
    }
    toast('Signed in successfully', { kind: 'success' })
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <p className="font-display font-bold text-3xl">
          <span className="text-primary">Dr</span><span className="text-cta">Med</span>
        </p>
        <h1 className="font-display font-bold text-xl text-fg mt-4">Sign in with your phone</h1>
        <p className="text-sm text-muted mt-1">
          {step === 'phone' ? "We'll send a one-time password" : `OTP sent to ${phone}`}
        </p>
      </div>

      <div className="card p-6">
        {step === 'phone' ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <Input
              label="Mobile number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="10-digit number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              icon={<Smartphone size={16} />}
              error={error || undefined}
              autoFocus
            />
            <Button type="submit" size="lg" className="w-full" loading={loading} disabled={phone.length !== 10}>
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <Input
              label="One-time password"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              icon={<KeyRound size={16} />}
              error={error || undefined}
              hint="Dev mode: the OTP is printed in your terminal"
              autoFocus
            />
            <Button type="submit" size="lg" className="w-full" loading={loading} disabled={otp.length !== 6}>
              Verify & Sign In
            </Button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setError('') }}
              className="w-full text-center text-sm text-primary font-medium hover:underline"
            >
              Change number
            </button>
          </form>
        )}
      </div>

      <p className="text-xs text-faint text-center mt-6">
        By signing in you agree to our terms. Demo users: 9000000001 (admin), 9000000002 (pharmacist).
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
