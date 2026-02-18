import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { totalOnboardingSteps } from './steps'
import { isSignedIn } from '../lib/auth'

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
  const navigate = useNavigate()
  const [isLoadingExit, setIsLoadingExit] = useState(false)
  const progressPercent = Math.min(100, Math.round((stepId / totalOnboardingSteps) * 100))

  const handleSaveAndExit = async () => {
    setIsLoadingExit(true)
    try {
      const signed = await isSignedIn()
      if (signed) {
        navigate('/dashboard')
      } else {
        navigate(`/auth?returnTo=/dashboard`)
      }
    } finally {
      setIsLoadingExit(false)
    }
  }

  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-blue-50 to-white pb-32 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Step {stepId} of {totalOnboardingSteps}</span>
            <button
              onClick={handleSaveAndExit}
              disabled={isLoadingExit}
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingExit ? 'Loading...' : 'Save and exit'}
            </button>
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

          <div className="mt-12 space-y-6">
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
