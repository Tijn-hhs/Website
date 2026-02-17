import { ReactNode } from 'react'

interface BrandedAuthShellProps {
  children: ReactNode
}

export default function BrandedAuthShell({ children }: BrandedAuthShellProps) {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-blue-50 to-purple-50 flex flex-col items-center justify-center px-4 py-16">
      {/* Header with logo */}
      <div className="mb-8 flex items-center gap-2">
        <img
          src="/assets/Logo.png"
          alt="Leavs Logo"
          className="h-8 w-8 object-contain"
        />
        <span className="text-lg font-semibold text-slate-900">Leavs</span>
      </div>

      {/* Branded card container */}
      <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-8">
        {/* Headline and subheadline */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-600">
            Sign in to continue your journey
          </p>
        </div>

        {/* Authenticator component renders here */}
        {children}
      </div>

      {/* Footer text */}
      <div className="mt-8 text-center text-xs text-slate-500 max-w-md">
        <p>
          By signing in, you agree to Leavs'{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
