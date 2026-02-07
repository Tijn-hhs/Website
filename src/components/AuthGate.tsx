import { ReactNode } from 'react'
import { Authenticator } from '@aws-amplify/ui-react'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  return (
    <Authenticator>
      {() => (
        <div data-testid="auth-gate">
          {children}
        </div>
      )}
    </Authenticator>
  )
}
