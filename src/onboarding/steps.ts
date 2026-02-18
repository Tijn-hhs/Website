import { OnboardingDraft } from './types'

export type StepConfig = {
  id: number
  title: string
  subtitle: string
  isEnabled: (draft: OnboardingDraft) => boolean
  isDisabled?: (draft: OnboardingDraft) => boolean
  validate: (draft: OnboardingDraft) => boolean
}

const hasValue = (value: string) => value.trim().length > 0

export const onboardingSteps: StepConfig[] = [
  {
    id: 0,
    title: 'Welcome to Leavs',
    subtitle: 'Let\'s get to know you!',
    isEnabled: () => true,
    validate: (draft) => hasValue(draft.preferredName),
  },
  {
    id: 1,
    title: 'Destination',
    subtitle: 'Where are you heading for your studies?',
    isEnabled: () => true,
    validate: (draft) => {
      // Country and city are locked to Italy and Milan
      // University selection is now required
      return hasValue(draft.destinationUniversity)
    },
  },
  {
    id: 2,
    title: 'Origin and citizenship',
    subtitle: 'Tell us about where you are coming from.',
    isEnabled: () => true,
    validate: (draft) => {
      return hasValue(draft.nationality) && 
             hasValue(draft.residenceCountry) && 
             (draft.isEuCitizen === 'yes' || draft.isEuCitizen === 'no')
    },
  },
  {
    id: 3,
    title: 'Program basics',
    subtitle: 'Share the program details you already know.',
    isEnabled: () => true,
    validate: (draft) => {
      if (draft.degreeType === '' || draft.programApplied === '') return false
      // If they've applied, they must answer if they got accepted
      if (draft.programApplied === 'yes' && draft.programAccepted === '') return false
      return true
    },
  },
  {
    id: 3.5,
    title: 'Application requirements',
    subtitle: 'Let us know about your application progress.',
    isEnabled: (draft) => draft.programApplied === 'no',
    validate: (draft) => {
      // Require answers for GMAT, English test, recommendation letters, and CV
      return draft.hasGmatOrEntranceTest !== '' && 
             draft.hasEnglishTest !== '' &&
             draft.hasRecommendationLetters !== '' &&
             draft.hasCv !== ''
    },
  },
  {
    id: 5,
    title: 'Visa and documents',
    subtitle: 'Needed for non-EU students or if you are unsure.',
    isEnabled: (draft) => draft.isEuCitizen !== 'yes',
    validate: () => true,
  },
  {
    id: 6,
    title: 'Current progress',
    subtitle: 'Where are you in the process right now?',
    isEnabled: () => true,
    validate: () => true,
  },
  {
    id: 8,
    title: 'Review and finish',
    subtitle: 'Confirm your details before saving.',
    isEnabled: () => true,
    validate: () => true,
  },
]

export const totalOnboardingSteps = onboardingSteps.length

export function getStepConfig(stepId: number): StepConfig | undefined {
  return onboardingSteps.find((step) => step.id === stepId)
}

export function isStepEnabled(stepId: number, draft: OnboardingDraft): boolean {
  const step = getStepConfig(stepId)
  return step ? step.isEnabled(draft) : false
}

export function isStepDisabled(stepId: number, draft: OnboardingDraft): boolean {
  const step = getStepConfig(stepId)
  return step && step.isDisabled ? step.isDisabled(draft) : false
}

export function isStepValid(stepId: number, draft: OnboardingDraft): boolean {
  const step = getStepConfig(stepId)
  return step ? step.validate(draft) : false
}

export function getNextEnabledStepId(currentId: number, draft: OnboardingDraft): number {
  const enabledSteps = onboardingSteps.filter((step) => step.isEnabled(draft))
  const currentIndex = enabledSteps.findIndex((step) => step.id === currentId)
  return enabledSteps[currentIndex + 1]?.id ?? currentId
}

export function getPrevEnabledStepId(currentId: number, draft: OnboardingDraft): number {
  const enabledSteps = onboardingSteps.filter((step) => step.isEnabled(draft))
  const currentIndex = enabledSteps.findIndex((step) => step.id === currentId)
  return enabledSteps[currentIndex - 1]?.id ?? currentId
}

// Helper function to convert step ID to route path
export function stepIdToRoute(stepId: number): string {
  if (stepId === 3.5) return '3b'
  return stepId.toString()
}
