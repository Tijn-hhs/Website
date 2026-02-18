import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getStepConfig, isStepValid, stepIdToRoute } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

// Mock city -> universities mapping (Milan only)
const UNIVERSITIES_BY_CITY: Record<string, string[]> = {
  Milan: ['Bocconi University', 'Politecnico di Milano', 'Università degli Studi di Milano'],
}

export default function Step1Destination() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(1)

  // Automatically set Italy and Milan
  useEffect(() => {
    if (!isLoading) {
      if (draft.destinationCountry !== 'Italy') {
        updateField('destinationCountry', 'Italy')
      }
      if (draft.destinationCity !== 'Milan') {
        updateField('destinationCity', 'Milan')
      }
    }
  }, [isLoading, draft.destinationCountry, draft.destinationCity, updateField])

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
    const routePath = stepIdToRoute(nextStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const availableUniversities = UNIVERSITIES_BY_CITY['Milan'] || []

  return (
    <OnboardingLayout
      stepId={1}
      title={step.title}
      subtitle={step.subtitle}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      {/* Restriction Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          📍 <strong>Note:</strong> For now, we are restricted to Milan. We're expanding to more cities soon!
        </p>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationCountry">
          Destination country
        </label>
        <select
          id="destinationCountry"
          value="Italy"
          className={selectBase}
          disabled={true}
        >
          <option value="Italy">Italy</option>
        </select>
        <p className="mt-2 text-xs text-slate-400">Currently locked to Italy</p>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationCity">
          Destination city
        </label>
        <select
          id="destinationCity"
          value="Milan"
          className={selectBase}
          disabled={true}
        >
          <option value="Milan">Milan</option>
        </select>
        <p className="mt-2 text-xs text-slate-400">Currently locked to Milan</p>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationUniversity">
          Destination university
        </label>
        <select
          id="destinationUniversity"
          value={draft.destinationUniversity}
          onChange={(event) => updateField('destinationUniversity', event.target.value)}
          className={selectBase}
        >
          <option value="">Select a university…</option>
          {availableUniversities.map((uni) => (
            <option key={uni} value={uni}>
              {uni}
            </option>
          ))}
        </select>
      </div>
    </OnboardingLayout>
  )
}
