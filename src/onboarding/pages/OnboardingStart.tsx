import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { onboardingSteps } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function OnboardingStart() {
  const navigate = useNavigate()
  const { getResumePath, isLoading } = useOnboardingDraft()
  const step = onboardingSteps[0]

  useEffect(() => {
    if (!isLoading) {
      navigate(getResumePath(), { replace: true })
    }
  }, [getResumePath, isLoading, navigate])

  return (
    <OnboardingLayout
      stepId={1}
      title={step.title}
      subtitle="Loading your onboarding progress..."
    >
      <div className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading your draft...</p>
      </div>
    </OnboardingLayout>
  )
}
