import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchMe } from '../lib/api'
import { isSignedIn } from '../lib/auth'
import { isOnboardingCompleted } from '../onboarding/isOnboardingCompleted'

interface OnboardingGateProps {
  children: ReactNode
}

export default function OnboardingGate({ children }: OnboardingGateProps) {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'blocked'>('loading')

  useEffect(() => {
    let mounted = true

    const checkOnboarding = async () => {
      try {
        const signedIn = await isSignedIn()
        if (!signedIn) {
          if (mounted) setStatus('allowed')
          return
        }

        const me = await fetchMe()
        const completed = isOnboardingCompleted(me.profile)
        if (mounted) {
          setStatus(completed ? 'blocked' : 'allowed')
        }
      } catch {
        if (mounted) setStatus('allowed')
      }
    }

    checkOnboarding()

    return () => {
      mounted = false
    }
  }, [])

  if (status === 'loading') return null
  if (status === 'blocked') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
