import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import AuthLayout from '../components/AuthLayout'
import { syncOnboardingDraftToProfileIfPresent } from '../onboarding/sync'
import logo from '../assets/Logo_LEAVS.png'

export default function AuthPage() {
  const navigate = useNavigate()
  const hasRedirectedRef = useRef(false)

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('returnTo') || '/dashboard'
  }, [])

  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <img src={logo} alt="Leavs" className="h-9 w-auto mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-slate-900">Welcome to Leavs</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in or create your account to continue</p>
      </div>
      <Authenticator
        components={{
          Header: () => null,
          Footer: () => null,
        }}
      >
        {() => {
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true

            syncOnboardingDraftToProfileIfPresent()
              .catch(() => {
                // ignore sync failure
              })
              .finally(() => {
                navigate(returnTo, { replace: true })
              })
          }

          return (
            <div className="text-center text-sm text-slate-600">
              Signed in successfully. Redirecting…
            </div>
          )
        }}
      </Authenticator>
      <p className="mt-6 text-center text-xs text-slate-400">
        By continuing, you agree to Leavs'{' '}
        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
      </p>
    </AuthLayout>
  )
}