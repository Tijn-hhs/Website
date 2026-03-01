import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, labelBase } from '../ui'
import {
  getNextEnabledStepId,
  getPrevEnabledStepId,
  getStepConfig,
  isStepEnabled,
  isStepDisabled,
  stepIdToRoute,
} from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step5Visa() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(5)
  const stepDisabled = isStepDisabled(5, draft)

  useEffect(() => {
    if (!isLoading && !isStepEnabled(5, draft)) {
      const nextStepId = getNextEnabledStepId(5, draft)
      const routePath = stepIdToRoute(nextStepId)
      navigate(`/onboarding/${routePath}`, { replace: true })
    }
  }, [draft, isLoading, navigate])

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={5}
        title="Visa and documents"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const nextStepId = getNextEnabledStepId(5, draft)
  const prevStepId = getPrevEnabledStepId(5, draft)

  const handleNext = () => {
    if (!stepDisabled) {
      setLastCompletedStep(5)
    }
    const routePath = stepIdToRoute(nextStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const handleBack = () => {
    const routePath = stepIdToRoute(prevStepId)
    navigate(`/onboarding/${routePath}`)
  }

  if (stepDisabled) {
    return (
      <OnboardingLayout
        stepId={5}
        title={step.title}
        subtitle={step.subtitle}
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Next"
        nextDisabled={true}
      >
        <div className="bg-[#F0EDFF] border border-[#D9D3FB] rounded-2xl p-5">
          <p className="text-sm text-[#5b3fd4] font-medium">
            This step is not needed for EU citizens.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Since you indicated you're an EU citizen, you don't need to fill in visa information. You can skip ahead to the next step.
          </p>
        </div>
      </OnboardingLayout>
    )
  }

  const countryName = draft.destinationCountry || 'the country'

  return (
    <OnboardingLayout
      stepId={5}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel="Next"
    >
      <div className={cardBase}>
        <label className={labelBase}>
          Do you already have a visa for {countryName}?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => updateField('hasVisa', 'yes')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasVisa === 'yes'
                ? 'bg-[#8870FF] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-[#F0EDFF] hover:text-[#8870FF]'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateField('hasVisa', 'no')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasVisa === 'no'
                ? 'bg-[#8870FF] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-[#F0EDFF] hover:text-[#8870FF]'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </OnboardingLayout>
  )
}
