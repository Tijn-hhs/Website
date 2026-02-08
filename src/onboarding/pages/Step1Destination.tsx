import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, checkboxBase, inputBase, labelBase } from '../ui'
import { getNextEnabledStepId, getStepConfig, isStepValid } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step1Destination() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(1)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={1}
        title="Destination"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const isValid = isStepValid(1, draft)
  const nextStepId = getNextEnabledStepId(1, draft)

  const handleNext = () => {
    if (!isValid) return
    setLastCompletedStep(1)
    navigate(`/onboarding/${nextStepId}`)
  }

  const handleUnknownCountry = (checked: boolean) => {
    updateField('destinationUnknownCountry', checked)
    if (checked) {
      updateField('destinationCountry', '')
      updateField('destinationUnknownCity', true)
      updateField('destinationCity', '')
      updateField('destinationUnknownUniversity', true)
      updateField('destinationUniversity', '')
    }
  }

  const handleUnknownCity = (checked: boolean) => {
    updateField('destinationUnknownCity', checked)
    if (checked) {
      updateField('destinationCity', '')
    }
  }

  const handleUnknownUniversity = (checked: boolean) => {
    updateField('destinationUnknownUniversity', checked)
    if (checked) {
      updateField('destinationUniversity', '')
    }
  }

  return (
    <OnboardingLayout
      stepId={1}
      title={step.title}
      subtitle={step.subtitle}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationCountry">
          Destination country
        </label>
        <input
          id="destinationCountry"
          type="text"
          placeholder="e.g., Italy"
          value={draft.destinationCountry}
          onChange={(event) => updateField('destinationCountry', event.target.value)}
          className={inputBase}
          disabled={draft.destinationUnknownCountry}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.destinationUnknownCountry}
            onChange={(event) => handleUnknownCountry(event.target.checked)}
          />
          I do not know the country yet
        </label>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationCity">
          Destination city
        </label>
        <input
          id="destinationCity"
          type="text"
          placeholder="e.g., Milan"
          value={draft.destinationCity}
          onChange={(event) => updateField('destinationCity', event.target.value)}
          className={inputBase}
          disabled={draft.destinationUnknownCountry || draft.destinationUnknownCity}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.destinationUnknownCity}
            onChange={(event) => handleUnknownCity(event.target.checked)}
            disabled={draft.destinationUnknownCountry}
          />
          I do not know the city yet
        </label>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationUniversity">
          Destination university
        </label>
        <input
          id="destinationUniversity"
          type="text"
          placeholder="e.g., Bocconi University"
          value={draft.destinationUniversity}
          onChange={(event) => updateField('destinationUniversity', event.target.value)}
          className={inputBase}
          disabled={draft.destinationUnknownCountry || draft.destinationUnknownUniversity}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.destinationUnknownUniversity}
            onChange={(event) => handleUnknownUniversity(event.target.checked)}
            disabled={draft.destinationUnknownCountry}
          />
          I do not know the university yet
        </label>
      </div>
    </OnboardingLayout>
  )
}
