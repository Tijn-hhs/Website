import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, checkboxBase, inputBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig, isStepValid, stepIdToRoute } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'
import CongratulationsModal from '../../components/CongratulationsModal'

export default function Step3Program() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(3)
  const [showCongratulations, setShowCongratulations] = useState(false)

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
    const routePath = stepIdToRoute(nextStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const handleBack = () => {
    const routePath = stepIdToRoute(prevStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const handleFieldOfStudyUnknown = (checked: boolean) => {
    updateField('fieldOfStudyUnknown', checked)
    if (checked) {
      updateField('fieldOfStudy', '')
    }
  }

  const handleProgramStartMonthUnknown = (checked: boolean) => {
    updateField('programStartMonthUnknown', checked)
    if (checked) {
      updateField('programStartMonth', '')
    }
  }

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
          disabled={draft.fieldOfStudyUnknown}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.fieldOfStudyUnknown}
            onChange={(event) => handleFieldOfStudyUnknown(event.target.checked)}
          />
          I do not know yet
        </label>
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
          disabled={draft.programStartMonthUnknown}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.programStartMonthUnknown}
            onChange={(event) => handleProgramStartMonthUnknown(event.target.checked)}
          />
          I do not know yet
        </label>
      </div>

      <div className={cardBase}>
        <label className={labelBase}>
          Did you apply already to the program?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => {
              updateField('programApplied', 'yes')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.programApplied === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes, I have applied
          </button>
          <button
            type="button"
            onClick={() => {
              updateField('programApplied', 'no')
              updateField('programAccepted', '')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.programApplied === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No, not yet
          </button>
        </div>
        
        {/* Follow-up question if already applied */}
        {draft.programApplied === 'yes' && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <label className={labelBase}>
              Did you already get accepted?
            </label>
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={() => {
                  updateField('programAccepted', 'yes')
                  setShowCongratulations(true)
                }}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  draft.programAccepted === 'yes'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => updateField('programAccepted', 'no')}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  draft.programAccepted === 'no'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Congratulations Modal */}
      <CongratulationsModal 
        isOpen={showCongratulations} 
        onClose={() => setShowCongratulations(false)} 
      />
    </OnboardingLayout>
  )
}
