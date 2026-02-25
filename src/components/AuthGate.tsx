import type { ReactNode } from 'react'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import AuthLayout from './AuthLayout'
import logo from '../assets/Logo_LEAVS.png'

interface AuthGateProps {
  children: ReactNode
}

function AuthGateContent({ children }: { children: ReactNode }) {
  const { user } = useAuthenticator((context) => [context.user])

  // When authenticated, render the protected content without AuthLayout
  if (user) {
    return <div data-testid="auth-gate">{children}</div>
  }

  // When unauthenticated, show the Authenticator inside AuthLayout
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
      />
      <p className="mt-6 text-center text-xs text-slate-400">
        By continuing, you agree to Leavs'{' '}
        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
      </p>
    </AuthLayout>
  )
}

export function AuthGate({ children }: AuthGateProps) {
  return (
    <Authenticator.Provider>
      <AuthGateContent>{children}</AuthGateContent>
    </Authenticator.Provider>
  )
}