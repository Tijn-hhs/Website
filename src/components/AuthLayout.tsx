import type { ReactNode } from 'react'
import Header from './Header'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Shared layout for all authentication screens.
 * - Header
 * - Gradient background
 * - Single centered card
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-blue-50 to-purple-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-4">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}