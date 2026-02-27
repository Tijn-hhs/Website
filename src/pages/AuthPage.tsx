import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signIn,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { syncOnboardingDraftToProfileIfPresent } from '../onboarding/sync'

type Screen = 'signin' | 'signup' | 'confirm' | 'forgot' | 'reset'

function Input({
  label, type = 'text', value, onChange, placeholder, autoComplete,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  placeholder?: string; autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-4 py-2.5 rounded-xl border border-[#EDE9D8] bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8870FF] focus:ring-2 focus:ring-[#8870FF]/20 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 px-4 bg-[#8870FF] hover:bg-[#6a54e0] disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('returnTo') || '/dashboard'
  }, [])

  function clearError() { setError('') }

  function friendlyError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('UserNotFoundException') || msg.includes('Incorrect username or password'))
      return 'Incorrect email or password.'
    if (msg.includes('UserNotConfirmedException'))
      return 'Please confirm your account first. Check your email for a verification code.'
    if (msg.includes('UsernameExistsException'))
      return 'An account with this email already exists.'
    if (msg.includes('InvalidPasswordException'))
      return 'Password must be at least 8 characters and include a number.'
    if (msg.includes('CodeMismatchException'))
      return 'Incorrect code. Please try again.'
    if (msg.includes('ExpiredCodeException'))
      return 'Code has expired. Please request a new one.'
    if (msg.includes('LimitExceededException'))
      return 'Too many attempts. Please wait a moment and try again.'
    if (msg.includes('NotAuthorizedException'))
      return 'Incorrect email or password.'
    return msg
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault(); clearError(); setLoading(true)
    try {
      await signIn({ username: email.trim().toLowerCase(), password })
      await syncOnboardingDraftToProfileIfPresent().catch(() => {})
      navigate(returnTo, { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('UserNotConfirmedException')) {
        await resendSignUpCode({ username: email.trim().toLowerCase() }).catch(() => {})
        setScreen('confirm')
      }
      setError(friendlyError(err))
    } finally { setLoading(false) }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault(); clearError()
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await signUp({ username: email.trim().toLowerCase(), password })
      setScreen('confirm')
    } catch (err) { setError(friendlyError(err)) }
    finally { setLoading(false) }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault(); clearError(); setLoading(true)
    try {
      await confirmSignUp({ username: email.trim().toLowerCase(), confirmationCode: code.trim() })
      await signIn({ username: email.trim().toLowerCase(), password })
      await syncOnboardingDraftToProfileIfPresent().catch(() => {})
      navigate(returnTo, { replace: true })
    } catch (err) { setError(friendlyError(err)) }
    finally { setLoading(false) }
  }

  async function handleResendCode() {
    clearError(); setLoading(true)
    try {
      await resendSignUpCode({ username: email.trim().toLowerCase() })
      setError('') // clear; show subtle success
    } catch (err) { setError(friendlyError(err)) }
    finally { setLoading(false) }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault(); clearError(); setLoading(true)
    try {
      await resetPassword({ username: email.trim().toLowerCase() })
      setScreen('reset')
    } catch (err) { setError(friendlyError(err)) }
    finally { setLoading(false) }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault(); clearError()
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await confirmResetPassword({ username: email.trim().toLowerCase(), confirmationCode: code.trim(), newPassword })
      setScreen('signin')
      setError('')
      setPassword('')
    } catch (err) { setError(friendlyError(err)) }
    finally { setLoading(false) }
  }

  return (
    <AuthLayout>
      {/* Tab row: Sign In / Create Account */}
      {(screen === 'signin' || screen === 'signup') && (
        <div className="flex border-b border-[#EDE9D8] mb-6">
          {(['signin', 'signup'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { setScreen(s); clearError() }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                screen === s
                  ? 'text-slate-900 border-b-2 border-[#8870FF] -mb-px'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
      )}

      {/* ── Sign In ── */}
      {screen === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <SubmitButton loading={loading}>Sign in</SubmitButton>
          <div className="text-center">
            <button type="button" onClick={() => { setScreen('forgot'); clearError() }} className="text-sm text-[#8870FF] hover:text-[#6a54e0] font-medium">
              Forgot your password?
            </button>
          </div>
        </form>
      )}

      {/* ── Sign Up ── */}
      {screen === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" />
          <Input label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat your password" autoComplete="new-password" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </form>
      )}

      {/* ── Confirm (verify email) ── */}
      {screen === 'confirm' && (
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-base font-semibold text-slate-900">Check your email</p>
            <p className="text-sm text-slate-500 mt-1">We sent a 6-digit code to <strong>{email}</strong></p>
          </div>
          <Input label="Verification code" value={code} onChange={setCode} placeholder="123456" autoComplete="one-time-code" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <SubmitButton loading={loading}>Confirm account</SubmitButton>
          <div className="text-center">
            <button type="button" onClick={handleResendCode} disabled={loading} className="text-sm text-[#8870FF] hover:text-[#6a54e0] font-medium">
              Resend code
            </button>
          </div>
        </form>
      )}

      {/* ── Forgot password ── */}
      {screen === 'forgot' && (
        <form onSubmit={handleForgot} className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-base font-semibold text-slate-900">Reset your password</p>
            <p className="text-sm text-slate-500 mt-1">Enter your email and we'll send a reset code.</p>
          </div>
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <SubmitButton loading={loading}>Send reset code</SubmitButton>
          <div className="text-center">
            <button type="button" onClick={() => { setScreen('signin'); clearError() }} className="text-sm text-slate-500 hover:text-slate-700">
              Back to sign in
            </button>
          </div>
        </form>
      )}

      {/* ── Reset password ── */}
      {screen === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-base font-semibold text-slate-900">Set a new password</p>
            <p className="text-sm text-slate-500 mt-1">Enter the code from your email and choose a new password.</p>
          </div>
          <Input label="Verification code" value={code} onChange={setCode} placeholder="123456" autoComplete="one-time-code" />
          <Input label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" autoComplete="new-password" />
          <Input label="Confirm new password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat your password" autoComplete="new-password" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <SubmitButton loading={loading}>Set new password</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}
