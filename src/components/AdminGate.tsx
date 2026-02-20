import { type ReactNode, useEffect, useState } from 'react'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import { checkAdminStatus, type AdminStatus } from '../lib/adminAuth'
import { ShieldAlert, Loader2 } from 'lucide-react'

interface AdminGateProps {
  children: ReactNode
}

function AdminGateContent({ children }: { children: ReactNode }) {
  const { user } = useAuthenticator((ctx) => [ctx.user])
  const [status, setStatus] = useState<AdminStatus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setStatus(null)
      return
    }
    setLoading(true)
    checkAdminStatus()
      .then(setStatus)
      .finally(() => setLoading(false))
  }, [user])

  // Not signed in — show the Amplify Authenticator
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-900/40 border border-red-700 mb-4">
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Access</h1>
          <p className="text-gray-400 mt-1 text-sm">Sign in with an authorised account to continue.</p>
        </div>
        <div className="w-full max-w-sm">
          <Authenticator
            components={{ Header: () => null, Footer: () => null }}
          />
        </div>
      </div>
    )
  }

  // Checking admin status
  if (loading || !status) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  // Signed in but not an admin
  if (!status.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-900/40 border border-red-700 mb-4">
          <ShieldAlert className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 text-sm max-w-xs">
          Your account ({status.email}) does not have admin privileges.
          Contact your administrator to request access.
        </p>
      </div>
    )
  }

  // Admin confirmed — render the protected page
  return <>{children}</>
}

export function AdminGate({ children }: AdminGateProps) {
  return (
    <Authenticator.Provider>
      <AdminGateContent>{children}</AdminGateContent>
    </Authenticator.Provider>
  )
}
