import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, inputBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step7Housing() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(7)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={7}
        title="Housing preferences"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const nextStepId = getNextEnabledStepId(7, draft)
  const prevStepId = getPrevEnabledStepId(7, draft)

  const handleNext = () => {
    setLastCompletedStep(7)
    navigate(`/onboarding/${nextStepId}`)
  }

  const handleBack = () => navigate(`/onboarding/${prevStepId}`)

  return (
    <OnboardingLayout
      stepId={7}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
    >
      <div className={cardBase}>
        <label className={labelBase} htmlFor="housingPreference">
          Preferred housing style
        </label>
        <select
          id="housingPreference"
          value={draft.housingPreference}
          onChange={(event) =>
            updateField('housingPreference', event.target.value as typeof draft.housingPreference)
          }
          className={selectBase}
        >
          <option value="unknown">I do not know yet</option>
          <option value="dorm">Dorm or campus housing</option>
          <option value="private">Private apartment</option>
          <option value="roommates">Roommates or shared flat</option>
        </select>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="moveInWindow">
          Preferred move-in month
        </label>
        <input
          id="moveInWindow"
          type="month"
          value={draft.moveInWindow}
          onChange={(event) => updateField('moveInWindow', event.target.value)}
          className={inputBase}
        />
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="housingSupportNeeded">
          Do you want help finding housing?
        </label>
        <select
          id="housingSupportNeeded"
          value={draft.housingSupportNeeded}
          onChange={(event) =>
            updateField('housingSupportNeeded', event.target.value as 'yes' | 'no' | 'unknown')
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
