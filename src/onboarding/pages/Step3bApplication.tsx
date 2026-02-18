import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, inputBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig, isStepValid, stepIdToRoute } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step3bApplication() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(3.5)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={3.5}
        title="Application requirements"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const isValid = isStepValid(3.5, draft)
  const nextStepId = getNextEnabledStepId(3.5, draft)
  const prevStepId = getPrevEnabledStepId(3.5, draft)

  const handleNext = () => {
    if (!isValid) return
    setLastCompletedStep(3.5)
    const routePath = stepIdToRoute(nextStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const handleBack = () => {
    const routePath = stepIdToRoute(prevStepId)
    navigate(`/onboarding/${routePath}`)
  }

  return (
    <OnboardingLayout
      stepId={3.5}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      {/* GMAT or Entrance Test */}
      <div className={cardBase}>
        <label className={labelBase}>
          Have you completed the GMAT or entrance test?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => updateField('hasGmatOrEntranceTest', 'yes')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasGmatOrEntranceTest === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              updateField('hasGmatOrEntranceTest', 'no')
              updateField('gmatScore', '')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasGmatOrEntranceTest === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>
        {draft.hasGmatOrEntranceTest === 'yes' && (
          <div className="mt-4">
            <label className={labelBase} htmlFor="gmatScore">
              Score (optional)
            </label>
            <input
              id="gmatScore"
              type="text"
              placeholder="e.g., 680"
              value={draft.gmatScore}
              onChange={(event) => updateField('gmatScore', event.target.value)}
              className={inputBase}
            />
          </div>
        )}
      </div>

      {/* English Test */}
      <div className={cardBase}>
        <label className={labelBase}>
          Have you completed an English proficiency test?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => updateField('hasEnglishTest', 'yes')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasEnglishTest === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              updateField('hasEnglishTest', 'no')
              updateField('englishTestType', '')
              updateField('englishTestScore', '')
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasEnglishTest === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>
        {draft.hasEnglishTest === 'yes' && (
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelBase} htmlFor="englishTestType">
                Test type
              </label>
              <select
                id="englishTestType"
                value={draft.englishTestType}
                onChange={(event) => updateField('englishTestType', event.target.value)}
                className={selectBase}
              >
                <option value="">Select test type…</option>
                <option value="TOEFL">TOEFL</option>
                <option value="IELTS">IELTS</option>
                <option value="Cambridge">Cambridge English</option>
                <option value="Duolingo">Duolingo English Test</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelBase} htmlFor="englishTestScore">
                Score (optional)
              </label>
              <input
                id="englishTestScore"
                type="text"
                placeholder="e.g., 105"
                value={draft.englishTestScore}
                onChange={(event) => updateField('englishTestScore', event.target.value)}
                className={inputBase}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recommendation Letters */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you have your recommendation letters ready?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => updateField('hasRecommendationLetters', 'yes')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasRecommendationLetters === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateField('hasRecommendationLetters', 'no')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasRecommendationLetters === 'no'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* CV/Resume */}
      <div className={cardBase}>
        <label className={labelBase}>
          Do you have your CV/resume ready?
        </label>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => updateField('hasCv', 'yes')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasCv === 'yes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateField('hasCv', 'no')}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              draft.hasCv === 'no'
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
