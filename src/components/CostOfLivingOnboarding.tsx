import { useState, useEffect } from 'react'
import CostSlider from './CostSlider'
import { getCityConfig } from '../lib/cityConfig'
import type { CostSliderConfig } from '../lib/cityConfig'

const ONBOARDING_STORAGE_KEY = 'cost-of-living-onboarding-completed'

interface OnboardingStep {
  id: string
  title: string
  description: string
  type: 'slider' | 'housing-selection' | 'summary'
}

interface BudgetValues {
  housingType: string
  rentCost: number
  utilitiesCost: number
  internetCost: number
  mobileCost: number
  transportCost: number
  groceriesCost: number
  diningOutCost: number
  entertainmentCost: number
  clothingCost: number
  personalCareCost: number
  booksCost: number
}

interface CostOfLivingOnboardingProps {
  city: string
  initialValues: BudgetValues
  onUpdate: (values: Partial<BudgetValues>) => void
  onComplete: () => void
  onExit?: () => void
}

export default function CostOfLivingOnboarding({
  city,
  initialValues,
  onUpdate,
  onComplete,
  onExit,
}: CostOfLivingOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [values, setValues] = useState(initialValues)
  
  const cityConfig = getCityConfig(city)
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    // Save the original overflow value
    const originalOverflow = document.body.style.overflow
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden'
    
    // Restore original overflow when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])
  
  if (!cityConfig) {
    return null
  }

  // Tutorial tour state
  const [tourStep, setTourStep] = useState(0)
  const [showTour, setShowTour] = useState(true)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const tourSteps = [
    {
      title: 'Welcome to Your Budget Builder! 👋',
      description: 'We\'ll guide you through each expense category. Let me show you how it works.',
      position: 'center',
      target: undefined,
    },
    {
      title: 'Set Your Budget with Sliders 🎯',
      description: 'For each expense, drag the slider to match your expected spending. The range shows low budget (frugal) to high budget (comfortable).',
      target: 'slider',
      position: 'top',
    },
    {
      title: 'Enter Custom Amounts ✏️',
      description: 'Click on any amount to type in a custom value. Perfect for exact budgeting!',
      target: 'slider',
      position: 'top',
    },
    {
      title: 'Navigate Through the Steps ➡️',
      description: 'Use Next to continue or Back to review. Your progress is automatically saved as you go!',
      target: 'buttons',
      position: 'top',
    },
  ]

  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1)
    } else {
      setShowTour(false)
    }
  }

  const handleTourSkip = () => {
    setShowTour(false)
  }

  const handleExit = () => {
    setShowExitConfirm(true)
  }

  const handleExitConfirm = () => {
    // Close everything without saving step as started
    if (onExit) {
      onExit()
    } else {
      onComplete()
    }
  }

  const handleExitCancel = () => {
    setShowExitConfirm(false)
  }

  // Only show tour on first step
  const shouldShowTour = showTour && currentStep === 0

  // Define all steps
  const steps: OnboardingStep[] = [
    { id: 'housing', title: 'Housing Type & Rent', description: "Let's start with your housing. Select your accommodation type and adjust your monthly rent.", type: 'housing-selection' },
    { id: 'utilities', title: 'Utilities', description: 'How much do you spend on gas, water, and electricity (your share)?', type: 'slider' },
    { id: 'internet', title: 'Internet', description: 'What\'s your monthly internet cost?', type: 'slider' },
    { id: 'mobile', title: 'Mobile Phone', description: 'How much do you spend on your mobile phone plan?', type: 'slider' },
    { id: 'transport', title: 'Public Transport', description: 'What do you expect to spend on public transportation?', type: 'slider' },
    { id: 'groceries', title: 'Groceries', description: 'How much will you spend on groceries each month?', type: 'slider' },
    { id: 'diningOut', title: 'Dining Out', description: 'How often do you eat at restaurants or order takeout?', type: 'slider' },
    { id: 'entertainment', title: 'Entertainment', description: 'Budget for movies, events, hobbies, and fun activities.', type: 'slider' },
    { id: 'clothing', title: 'Clothing & Shopping', description: 'How much do you plan to spend on clothes and shopping?', type: 'slider' },
    { id: 'personalCare', title: 'Personal Care', description: 'Budget for toiletries, haircuts, and personal care products.', type: 'slider' },
    { id: 'books', title: 'Books & Supplies', description: 'How much will you spend on textbooks and study materials?', type: 'slider' },
    { id: 'summary', title: 'Budget Summary', description: 'Here\'s your complete monthly budget breakdown.', type: 'summary' },
  ]

  const currentStepData = steps[currentStep]
  const totalSteps = steps.length
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  // Get dynamic rent config based on selected housing type
  const getRentConfig = (): CostSliderConfig => {
    const housingTypeConfig = cityConfig.housingTypes.find(ht => ht.id === values.housingType)
    if (housingTypeConfig) {
      return {
        min: housingTypeConfig.min,
        max: housingTypeConfig.max,
        default: housingTypeConfig.default,
        step: 10,
        label: cityConfig.rent.label,
        description: cityConfig.rent.description,
      }
    }
    return cityConfig.rent
  }

  const handleValueChange = (key: string, value: number | string) => {
    const newValues = { ...values, [key]: value }
    setValues(newValues)
    onUpdate({ [key]: value })
  }

  const handleNext = () => {
    if (isLastStep) {
      // Mark onboarding as complete
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
      }
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Update rent when housing type changes
  useEffect(() => {
    if (currentStepData.id === 'housing') {
      const housingTypeConfig = cityConfig.housingTypes.find(ht => ht.id === values.housingType)
      if (housingTypeConfig && values.rentCost !== housingTypeConfig.default) {
        const newRent = housingTypeConfig.default
        setValues(prev => ({ ...prev, rentCost: newRent }))
        onUpdate({ rentCost: newRent })
      }
    }
  }, [values.housingType, currentStepData.id])

  const calculateTotal = () => {
    return (
      values.rentCost +
      values.utilitiesCost +
      values.internetCost +
      values.mobileCost +
      values.transportCost +
      values.groceriesCost +
      values.diningOutCost +
      values.entertainmentCost +
      values.clothingCost +
      values.personalCareCost +
      values.booksCost
    )
  }

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'housing':
        return (
          <div className="space-y-6">
            {/* Housing type selection */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Select Your Housing Type
              </p>
              <div className="grid grid-cols-1 gap-2">
                {cityConfig.housingTypes.map((option) => (
                  <label
                    key={option.id}
                    className={`
                      flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        values.housingType === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="housingType"
                      value={option.id}
                      checked={values.housingType === option.id}
                      onChange={(e) => handleValueChange('housingType', e.target.value)}
                      className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900">
                          {option.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          €{option.min}-{option.max}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Rent slider */}
            <div className={`pt-4 border-t border-slate-200 p-4 rounded-lg transition-all ${getHighlightClass('slider')}`}>
              <CostSlider
                config={getRentConfig()}
                value={values.rentCost}
                onChange={(val) => handleValueChange('rentCost', val)}
                id="onboarding-rent-slider"
              />
            </div>
          </div>
        )

      case 'utilities':
        return (
          <CostSlider
            config={cityConfig.utilities}
            value={values.utilitiesCost}
            onChange={(val) => handleValueChange('utilitiesCost', val)}
            id="onboarding-utilities-slider"
          />
        )

      case 'internet':
        return (
          <CostSlider
            config={cityConfig.internet}
            value={values.internetCost}
            onChange={(val) => handleValueChange('internetCost', val)}
            id="onboarding-internet-slider"
          />
        )

      case 'mobile':
        return (
          <CostSlider
            config={cityConfig.mobile}
            value={values.mobileCost}
            onChange={(val) => handleValueChange('mobileCost', val)}
            id="onboarding-mobile-slider"
          />
        )

      case 'transport':
        return (
          <CostSlider
            config={cityConfig.transport}
            value={values.transportCost}
            onChange={(val) => handleValueChange('transportCost', val)}
            id="onboarding-transport-slider"
          />
        )

      case 'groceries':
        return (
          <CostSlider
            config={cityConfig.groceries}
            value={values.groceriesCost}
            onChange={(val) => handleValueChange('groceriesCost', val)}
            id="onboarding-groceries-slider"
          />
        )

      case 'diningOut':
        return (
          <CostSlider
            config={cityConfig.diningOut}
            value={values.diningOutCost}
            onChange={(val) => handleValueChange('diningOutCost', val)}
            id="onboarding-diningout-slider"
          />
        )

      case 'entertainment':
        return (
          <CostSlider
            config={cityConfig.entertainment}
            value={values.entertainmentCost}
            onChange={(val) => handleValueChange('entertainmentCost', val)}
            id="onboarding-entertainment-slider"
          />
        )

      case 'clothing':
        return (
          <CostSlider
            config={cityConfig.clothing}
            value={values.clothingCost}
            onChange={(val) => handleValueChange('clothingCost', val)}
            id="onboarding-clothing-slider"
          />
        )

      case 'personalCare':
        return (
          <CostSlider
            config={cityConfig.personalCare}
            value={values.personalCareCost}
            onChange={(val) => handleValueChange('personalCareCost', val)}
            id="onboarding-personalcare-slider"
          />
        )

      case 'books':
        return (
          <CostSlider
            config={cityConfig.books}
            value={values.booksCost}
            onChange={(val) => handleValueChange('booksCost', val)}
            id="onboarding-books-slider"
          />
        )

      case 'summary':
        const total = calculateTotal()
        const fixedTotal = values.rentCost + values.utilitiesCost + values.internetCost + values.mobileCost + values.transportCost
        const variableTotal = values.groceriesCost + values.diningOutCost + values.entertainmentCost + values.clothingCost + values.personalCareCost + values.booksCost
        
        return (
          <div className="space-y-6">
            {/* Total at top */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <p className="text-sm font-medium opacity-90">Your Total Monthly Budget</p>
              <p className="text-4xl font-bold mt-2">€{total.toLocaleString()}</p>
              <p className="text-sm mt-2 opacity-75">for {city}</p>
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Fixed Costs (€{fixedTotal.toLocaleString()}/month)</h3>
                <div className="space-y-2 bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Rent</span>
                    <span className="font-medium text-slate-900">€{values.rentCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Utilities</span>
                    <span className="font-medium text-slate-900">€{values.utilitiesCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Internet</span>
                    <span className="font-medium text-slate-900">€{values.internetCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Mobile</span>
                    <span className="font-medium text-slate-900">€{values.mobileCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Transport</span>
                    <span className="font-medium text-slate-900">€{values.transportCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Variable Costs (€{variableTotal.toLocaleString()}/month)</h3>
                <div className="space-y-2 bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Groceries</span>
                    <span className="font-medium text-slate-900">€{values.groceriesCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Dining Out</span>
                    <span className="font-medium text-slate-900">€{values.diningOutCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Entertainment</span>
                    <span className="font-medium text-slate-900">€{values.entertainmentCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Clothing</span>
                    <span className="font-medium text-slate-900">€{values.clothingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Personal Care</span>
                    <span className="font-medium text-slate-900">€{values.personalCareCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Books & Supplies</span>
                    <span className="font-medium text-slate-900">€{values.booksCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Great job!</span> You can always adjust these values later from the main Cost of Living page.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderTourTooltip = () => {
    if (!shouldShowTour) return null

    const currentTourStep = tourSteps[tourStep]
    const isCenter = currentTourStep.position === 'center'

    return (
      <>
        {/* Overlay - but allow interaction with highlighted elements */}
        <div className="absolute inset-0 bg-black/60 z-10" style={{ pointerEvents: isCenter ? 'auto' : 'none' }} />
        
        {/* Tooltip */}
        <div
          className={`absolute z-20 ${
            isCenter
              ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              : currentTourStep.target === 'slider'
              ? 'top-[25%] left-1/2 transform -translate-x-1/2'
              : 'top-[50%] left-1/2 transform -translate-x-1/2'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="relative">
            {/* Arrow pointing down for slider, up for buttons */}
            {!isCenter && currentTourStep.target === 'slider' && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white"></div>
              </div>
            )}
            {!isCenter && currentTourStep.target === 'buttons' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white"></div>
              </div>
            )}

            {/* Tooltip content */}
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md border-2 border-blue-500">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{tourStep + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">
                    {currentTourStep.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {currentTourStep.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleTourSkip}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Skip tour
                </button>
                <div className="flex items-center gap-2">
                  {/* Progress dots */}
                  <div className="flex gap-1.5">
                    {tourSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === tourStep
                            ? 'w-6 bg-blue-600'
                            : 'w-1.5 bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleTourNext}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                  >
                    {tourStep === tourSteps.length - 1 ? "Got it!" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No separate highlight boxes - they'll be part of the content */}
      </>
    )
  }

  // Helper to determine if content should be highlighted
  const getHighlightClass = (targetId: string) => {
    if (!shouldShowTour) return ''
    const currentTourStep = tourSteps[tourStep]
    if (currentTourStep.target === targetId) {
      return 'relative z-[25] rounded-xl shadow-2xl ring-4 ring-blue-500 ring-offset-2 animate-pulse'
    }
    return shouldShowTour && currentTourStep.target && currentTourStep.target !== targetId ? 'opacity-30' : ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Exit Budget Builder?</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Are you sure you want to quit? Your progress won't be saved and you'll need to start over next time.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleExitCancel}
                    className="flex-1 px-4 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExitConfirm}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                  >
                    Yes, Exit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Tour overlay */}
        {renderTourTooltip()}
        
        {/* Header */}
        <div className="border-b border-slate-200 p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{currentStepData.title}</h2>
                <p className="text-sm text-slate-600 mt-0.5">Step {currentStep + 1} of {totalSteps}</p>
              </div>
            </div>
            
            {/* Exit button */}
            <button
              onClick={handleExit}
              className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all"
              aria-label="Exit onboarding"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-slate-700 mb-6">{currentStepData.description}</p>
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className={`border-t border-slate-200 p-6 flex justify-between items-center bg-slate-50 ${getHighlightClass('buttons')}`}>
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all
              ${isFirstStep 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
              }
            `}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
          >
            {isLastStep ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function shouldShowOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true'
}
