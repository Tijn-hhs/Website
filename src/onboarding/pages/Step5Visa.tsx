import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, inputBase, labelBase, selectBase } from '../ui'
import {
  getNextEnabledStepId,
  getPrevEnabledStepId,
  getStepConfig,
  isStepEnabled,
} from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step5Visa() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(5)

  useEffect(() => {
    if (!isLoading && !isStepEnabled(5, draft)) {
      const nextStepId = getNextEnabledStepId(5, draft)
      navigate(`/onboarding/${nextStepId}`, { replace: true })
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
    setLastCompletedStep(5)
    navigate(`/onboarding/${nextStepId}`)
  }

  const handleBack = () => navigate(`/onboarding/${prevStepId}`)

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
        <label className={labelBase} htmlFor="passportExpiry">
          Passport expiry date (if applicable)
        </label>
        <input
          id="passportExpiry"
          type="date"
          value={draft.passportExpiry}
          onChange={(event) => updateField('passportExpiry', event.target.value)}
          className={inputBase}
        />
        <p className="mt-2 text-xs text-slate-500">Leave blank if you do not know yet.</p>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="visaType">
          Visa type
        </label>
        <select
          id="visaType"
          value={draft.visaType}
          onChange={(event) => updateField('visaType', event.target.value)}
          className={selectBase}
        >
          <option value="">I do not know yet</option>
          <option value="student">Student visa</option>
          <option value="research">Research visa</option>
          <option value="exchange">Exchange visa</option>
          <option value="none">Not required</option>
        </select>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="visaAppointmentNeeded">
          Will you need a visa appointment?
        </label>
        <select
          id="visaAppointmentNeeded"
          value={draft.visaAppointmentNeeded}
          onChange={(event) =>
            updateField('visaAppointmentNeeded', event.target.value as 'yes' | 'no' | 'unknown')
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
