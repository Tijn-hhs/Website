import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from 'aws-amplify/auth'
import { fetchMe } from '../lib/api'
import { isOnboardingCompleted } from '../onboarding/isOnboardingCompleted'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [status, setStatus] = useState<'loading' | 'signed-in' | 'needs-onboarding' | 'signed-out'>('loading')
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || location.pathname === '/my-situation'

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        await getCurrentUser()
        // Only check onboarding for dashboard routes, not admin/blog/etc.
        if (isDashboardRoute) {
          const me = await fetchMe().catch(() => null)
          const completed = me ? isOnboardingCompleted(me.profile) : false
          if (mounted) setStatus(completed ? 'signed-in' : 'needs-onboarding')
        } else {
          if (mounted) setStatus('signed-in')
        }
      } catch {
        if (mounted) setStatus('signed-out')
      }
    }
    check()
    return () => { mounted = false }
  }, [isDashboardRoute])

  if (status === 'loading') return null

  if (status === 'signed-out') {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?returnTo=${returnTo}`} replace />
  }

  if (status === 'needs-onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <div data-testid="auth-gate">{children}</div>
}