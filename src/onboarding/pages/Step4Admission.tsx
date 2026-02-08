import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig, isStepValid } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step4Admission() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(4)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={4}
        title="Admission status"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const isValid = isStepValid(4, draft)
  const nextStepId = getNextEnabledStepId(4, draft)
  const prevStepId = getPrevEnabledStepId(4, draft)

  const handleNext = () => {
    if (!isValid) return
    setLastCompletedStep(4)
    navigate(`/onboarding/${nextStepId}`)
  }

  const handleBack = () => navigate(`/onboarding/${prevStepId}`)

  return (
    <OnboardingLayout
      stepId={4}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <div className={cardBase}>
        <label className={labelBase} htmlFor="admissionStatus">
          Admission status
        </label>
        <select
          id="admissionStatus"
          value={draft.admissionStatus}
          onChange={(event) =>
            updateField('admissionStatus', event.target.value as typeof draft.admissionStatus)
          }
          className={selectBase}
        >
          <option value="">Select status</option>
          <option value="exploring">Exploring options</option>
          <option value="applying">Applying</option>
          <option value="accepted">Accepted</option>
          <option value="enrolled">Enrolled</option>
        </select>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="deadlinesKnown">
          Do you know your key deadlines?
        </label>
        <select
          id="deadlinesKnown"
          value={draft.deadlinesKnown}
          onChange={(event) =>
            updateField('deadlinesKnown', event.target.value as 'yes' | 'no' | 'unknown')
          }
          className={selectBase}
        >
          <option value="unknown">Not sure yet</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </OnboardingLayout>
  )
}
