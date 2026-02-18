import { useState } from 'react'
import { ArrowLeft, CheckCircle } from 'lucide-react'

interface StepIntroModalProps {
  stepTitle: string
  stepDescription: string
  onConfirm: () => Promise<void>
  onBack: () => void
}

export default function StepIntroModal({
  stepTitle,
  stepDescription,
  onConfirm,
  onBack,
}: StepIntroModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Error confirming step start:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <CheckCircle size={48} className="text-blue-600" />
            </div>
          </div>

          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              {stepTitle}
            </h2>
            <p className="text-base text-slate-600">
              {stepDescription}
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900 mb-2">
                What to expect:
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">•</span>
                  <span>Step-by-step guidance and checklists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">•</span>
                  <span>Resources tailored to your situation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">•</span>
                  <span>Track your progress as you go</span>
                </li>
              </ul>
            </div>

            <p className="text-center text-sm text-slate-600">
              Ready to get started with this step?
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Starting...
              </span>
            ) : (
              'Yes, Start This Step'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
