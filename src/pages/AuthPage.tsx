import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import AuthLayout from '../components/AuthLayout'
import { syncOnboardingDraftToProfileIfPresent } from '../onboarding/sync'

export default function AuthPage() {
  const navigate = useNavigate()
  const hasRedirectedRef = useRef(false)

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('returnTo') || '/dashboard'
  }, [])

  return (
    <AuthLayout>
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
    </AuthLayout>
  )
}