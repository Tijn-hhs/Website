import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, labelBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig, stepIdToRoute } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'
import { saveStepProgress } from '../../lib/api'

export default function Step6Budget() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(6)

  const markDashboardStepComplete = async (stepKey: string) => {
    try {
      await saveStepProgress(stepKey, true)
    } catch (error) {
      console.error(`Failed to mark ${stepKey} as complete:`, error)
    }
  }

  // Auto-complete insurance step when both travel and health insurance are "yes"
  useEffect(() => {
    if (draft.hasTravelInsurance === 'yes' && draft.hasHealthInsurance === 'yes') {
      markDashboardStepComplete('insurance')
    }
  }, [draft.hasTravelInsurance, draft.hasHealthInsurance])

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={6}
        title="Current progress"
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
    const routePath = stepIdToRoute(nextStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const handleBack = () => {
    const routePath = stepIdToRoute(prevStepId)
    navigate(`/onboarding/${routePath}`)
  }

  return (
    <OnboardingLayout
      stepId={6}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
    >
      {/* Codice Fiscale */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you already have your <span className="font-semibold">codice fiscale</span>?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => {
              updateField('hasCodiceFiscale', 'yes')
              markDashboardStepComplete('codice-fiscale')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasCodiceFiscale === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateField('hasCodiceFiscale', 'no')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasCodiceFiscale === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Residence Permit */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you already have your <span className="font-semibold">residence permit</span>?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => {
              updateField('hasResidencePermit', 'yes')
              markDashboardStepComplete('immigration-registration')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasResidencePermit === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateField('hasResidencePermit', 'no')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasResidencePermit === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Housing */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you already have <span className="font-semibold">housing</span>?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => {
              updateField('hasHousing', 'yes')
              markDashboardStepComplete('housing')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasHousing === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateField('hasHousing', 'no')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasHousing === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Bank Account - Need */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you need a <span className="font-semibold">local bank account</span>?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => {
              updateField('needsBankAccount', 'yes')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.needsBankAccount === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              updateField('needsBankAccount', 'no')
              updateField('hasBankAccount', '')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.needsBankAccount === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>

        {/* Bank Account - Already Have (conditional) */}
        {draft.needsBankAccount === 'yes' && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <label className={labelBase}>
              Do you already have one?
            </label>
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={() => {
                  updateField('hasBankAccount', 'yes')
                  markDashboardStepComplete('banking')
                }}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  draft.hasBankAccount === 'yes'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => updateField('hasBankAccount', 'no')}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  draft.hasBankAccount === 'no'
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

      {/* Phone Number - Need */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you need a <span className="font-semibold">local phone number</span>?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => {
              updateField('needsPhoneNumber', 'yes')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.needsPhoneNumber === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              updateField('needsPhoneNumber', 'no')
              updateField('hasPhoneNumber', '')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.needsPhoneNumber === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>

        {/* Phone Number - Already Have (conditional) */}
        {draft.needsPhoneNumber === 'yes' && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <label className={labelBase}>
              Do you already have one?
            </label>
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={() => updateField('hasPhoneNumber', 'yes')}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  draft.hasPhoneNumber === 'yes'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => updateField('hasPhoneNumber', 'no')}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  draft.hasPhoneNumber === 'no'
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

      {/* Travel Insurance */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you already have all your <span className="font-semibold">insurance</span>?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => updateField('hasTravelInsurance', 'yes')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasTravelInsurance === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateField('hasTravelInsurance', 'no')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasTravelInsurance === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Health Insurance */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you already have your <span className="font-semibold">health care</span> covered?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => updateField('hasHealthInsurance', 'yes')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasHealthInsurance === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateField('hasHealthInsurance', 'no')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasHealthInsurance === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </OnboardingLayout>
  )
}
