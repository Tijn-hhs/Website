import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, checkboxBase, inputBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig, isStepValid } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step3Program() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(3)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={3}
        title="Program basics"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const isValid = isStepValid(3, draft)
  const nextStepId = getNextEnabledStepId(3, draft)
  const prevStepId = getPrevEnabledStepId(3, draft)

  const handleNext = () => {
    if (!isValid) return
    setLastCompletedStep(3)
    navigate(`/onboarding/${nextStepId}`)
  }

  const handleBack = () => navigate(`/onboarding/${prevStepId}`)

  return (
    <OnboardingLayout
      stepId={3}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <div className={cardBase}>
        <label className={labelBase} htmlFor="degreeType">
          Degree type
        </label>
        <select
          id="degreeType"
          value={draft.degreeType}
          onChange={(event) =>
            updateField('degreeType', event.target.value as typeof draft.degreeType)
          }
          className={selectBase}
        >
          <option value="">Select degree type</option>
          <option value="bachelor">Bachelor</option>
          <option value="master">Master</option>
          <option value="phd">PhD</option>
          <option value="exchange">Exchange</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="fieldOfStudy">
          Field of study
        </label>
        <input
          id="fieldOfStudy"
          type="text"
          placeholder="e.g., Economics"
          value={draft.fieldOfStudy}
          onChange={(event) => updateField('fieldOfStudy', event.target.value)}
          className={inputBase}
        />
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="programStartMonth">
          Program start month
        </label>
        <input
          id="programStartMonth"
          type="month"
          value={draft.programStartMonth}
          onChange={(event) => updateField('programStartMonth', event.target.value)}
          className={inputBase}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.programStartMonth === ''}
            onChange={(event) =>
              updateField('programStartMonth', event.target.checked ? '' : draft.programStartMonth)
            }
          />
          I do not know yet
        </label>
      </div>
    </OnboardingLayout>
  )
}
