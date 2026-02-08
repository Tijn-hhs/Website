import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step6Budget() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(6)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={6}
        title="Budget and funding"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const nextStepId = getNextEnabledStepId(6, draft)
  const prevStepId = getPrevEnabledStepId(6, draft)

  const handleNext = () => {
    setLastCompletedStep(6)
    navigate(`/onboarding/${nextStepId}`)
  }

  const handleBack = () => navigate(`/onboarding/${prevStepId}`)

  return (
    <OnboardingLayout
      stepId={6}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
    >
      <div className={cardBase}>
        <label className={labelBase} htmlFor="monthlyBudgetRange">
          Monthly budget range
        </label>
        <select
          id="monthlyBudgetRange"
          value={draft.monthlyBudgetRange}
          onChange={(event) =>
            updateField('monthlyBudgetRange', event.target.value as typeof draft.monthlyBudgetRange)
          }
          className={selectBase}
        >
          <option value="unknown">I do not know yet</option>
          <option value="lt500">Below 500</option>
          <option value="500-900">500 to 900</option>
          <option value="900-1300">900 to 1300</option>
          <option value="1300+">1300+</option>
        </select>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="scholarshipNeed">
          Do you need a scholarship?
        </label>
        <select
          id="scholarshipNeed"
          value={draft.scholarshipNeed}
          onChange={(event) =>
            updateField('scholarshipNeed', event.target.value as 'yes' | 'no' | 'maybe')
          }
          className={selectBase}
        >
          <option value="maybe">Maybe</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="fundingSource">
          Primary funding source
        </label>
        <select
          id="fundingSource"
          value={draft.fundingSource}
          onChange={(event) =>
            updateField('fundingSource', event.target.value as typeof draft.fundingSource)
          }
          className={selectBase}
        >
          <option value="unknown">I do not know yet</option>
          <option value="parents">Parents or family</option>
          <option value="savings">Savings</option>
          <option value="work">Work income</option>
          <option value="scholarship">Scholarship</option>
          <option value="mixed">Mixed sources</option>
        </select>
      </div>
    </OnboardingLayout>
  )
}
