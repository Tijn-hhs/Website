import type { ReactNode } from 'react'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import AuthLayout from './AuthLayout'

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
      <Authenticator
        components={{
          Header: () => null,
          Footer: () => null,
        }}
      />
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