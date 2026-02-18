import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, labelBase } from '../ui'
import { getNextEnabledStepId, getStepConfig, isStepValid, stepIdToRoute } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

export default function Step0Welcome() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasTyped, setHasTyped] = useState(false)
  const [showInfoScreen, setShowInfoScreen] = useState(false)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={0}
        title="Welcome to Leavs"
        subtitle="Loading..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const isValid = isStepValid(0, draft)
  const nextStepId = getNextEnabledStepId(0, draft)

  const handleNext = () => {
    if (!isValid) return
    // Show info screen instead of navigating immediately
    setShowInfoScreen(true)
  }

  const handleProceed = () => {
    setLastCompletedStep(0)
    const routePath = stepIdToRoute(nextStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const handleNameChange = (value: string) => {
    updateField('preferredName', value)
    
    if (value.trim().length > 0 && !hasTyped) {
      setHasTyped(true)
      setShowWelcome(true)
    } else if (value.trim().length === 0) {
      setShowWelcome(false)
      setHasTyped(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !showInfoScreen) {
      handleNext()
    }
  }

  // Show information screen before starting onboarding
  if (showInfoScreen) {
    return (
      <OnboardingLayout
        stepId={0}
        title="Let's get started"
        subtitle="Understanding your journey"
        onNext={handleProceed}
        nextDisabled={false}
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📋</div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">
            Before we begin...
          </h3>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            To know how we can help you, we need to know what your situation is. 
            We're going to ask a couple of questions. Please fill these out as carefully as possible.
          </p>
          <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Don't worry - you can always come back and update your answers later. 
                This helps us personalize your experience and show you the most relevant information.
              </span>
            </p>
          </div>
        </div>

      </OnboardingLayout>
    )
  }

  // Initial welcome and name collection screen
  return (
    <OnboardingLayout
      stepId={0}
      title={step.title}
      subtitle={step.subtitle}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      {/* Welcome Card */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">👋</div>

        <p className="text-lg text-slate-600">
          Your personal guide for studying abroad in Milan
        </p>
      </div>

      {/* Name Input */}
      <div className={`${cardBase} transition-all duration-300`}>
        <label className={labelBase} htmlFor="preferredName">
          How can we call you? ✨
        </label>
        <input
          id="preferredName"
          type="text"
          value={draft.preferredName}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your first name..."
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          autoFocus
        />
        <p className="mt-2 text-xs text-slate-500">
          💡 Press Enter to continue once you've entered your name
        </p>
      </div>

      {/* Welcome Message - Animated */}
      {showWelcome && draft.preferredName.trim() && (
        <div 
          className="animate-fade-in-up bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Hello, {draft.preferredName}!
            </h3>
            <p className="text-lg text-slate-700 leading-relaxed">
              We're going to help you make your relocation journey as easy as possible!!
            </p>
            <div className="mt-4 flex justify-center gap-2 text-2xl">
              <span>🎓</span>
              <span>✈️</span>
              <span>🏠</span>
              <span>🇮🇹</span>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animation styles */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </OnboardingLayout>
  )
}
