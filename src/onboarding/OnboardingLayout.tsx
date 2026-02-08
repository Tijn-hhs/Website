import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { totalOnboardingSteps } from './steps'

interface OnboardingLayoutProps {
  stepId: number
  title: string
  subtitle: string
  children: ReactNode
  onBack?: () => void
  onNext?: () => void
  nextDisabled?: boolean
  nextLabel?: string
}

export default function OnboardingLayout({
  stepId,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
}: OnboardingLayoutProps) {
  const progressPercent = Math.min(100, Math.round((stepId / totalOnboardingSteps) * 100))

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Step {stepId} of {totalOnboardingSteps}</span>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Save and exit
            </Link>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          </div>

          <div className="mt-6 space-y-6">
            {children}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {onNext ? (
              <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {nextLabel || 'Next'}
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </>
  )
}
