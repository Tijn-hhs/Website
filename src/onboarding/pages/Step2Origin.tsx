import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, checkboxBase, inputBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig, isStepValid } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step2Origin() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(2)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={2}
        title="Origin and citizenship"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const isValid = isStepValid(2, draft)
  const nextStepId = getNextEnabledStepId(2, draft)
  const prevStepId = getPrevEnabledStepId(2, draft)
  const nationalityUnknown = draft.nationality === 'Unknown'
  const residenceUnknown = draft.residenceCountry === 'Unknown'

  const handleNext = () => {
    if (!isValid) return
    setLastCompletedStep(2)
    navigate(`/onboarding/${nextStepId}`)
  }

  const handleBack = () => navigate(`/onboarding/${prevStepId}`)

  return (
    <OnboardingLayout
      stepId={2}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <div className={cardBase}>
        <label className={labelBase} htmlFor="nationality">
          Nationality
        </label>
        <input
          id="nationality"
          type="text"
          placeholder="e.g., Canadian"
          value={draft.nationality}
          onChange={(event) => updateField('nationality', event.target.value)}
          className={inputBase}
          disabled={nationalityUnknown}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={nationalityUnknown}
            onChange={(event) =>
              updateField('nationality', event.target.checked ? 'Unknown' : '')
            }
          />
          I do not know yet
        </label>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="residenceCountry">
          Current country of residence
        </label>
        <input
          id="residenceCountry"
          type="text"
          placeholder="e.g., Germany"
          value={draft.residenceCountry}
          onChange={(event) => updateField('residenceCountry', event.target.value)}
          className={inputBase}
          disabled={residenceUnknown}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={residenceUnknown}
            onChange={(event) =>
              updateField('residenceCountry', event.target.checked ? 'Unknown' : '')
            }
          />
          I do not know yet
        </label>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="isEuCitizen">
          EU citizenship
        </label>
        <select
          id="isEuCitizen"
          value={draft.isEuCitizen}
          onChange={(event) => updateField('isEuCitizen', event.target.value as 'yes' | 'no' | 'unknown')}
          className={selectBase}
        >
          <option value="unknown">I am not sure yet</option>
          <option value="yes">Yes, I am an EU citizen</option>
          <option value="no">No, I am not an EU citizen</option>
        </select>
      </div>
    </OnboardingLayout>
  )
}
