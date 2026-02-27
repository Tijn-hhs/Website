import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from 'aws-amplify/auth'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [status, setStatus] = useState<'loading' | 'signed-in' | 'signed-out'>('loading')
  const location = useLocation()

  useEffect(() => {
    getCurrentUser()
      .then(() => setStatus('signed-in'))
      .catch(() => setStatus('signed-out'))
  }, [])

  if (status === 'loading') return null

  if (status === 'signed-out') {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?returnTo=${returnTo}`} replace />
  }

  return <div data-testid="auth-gate">{children}</div>
}