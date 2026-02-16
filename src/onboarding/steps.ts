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
    id: 1,
    title: 'Destination',
    subtitle: 'Where are you heading for your studies?',
    isEnabled: () => true,
    validate: (draft) => {
      if (draft.destinationUnknownCountry) return true
      if (!hasValue(draft.destinationCountry)) return false
      if (!hasValue(draft.destinationCity) && !draft.destinationUnknownCity) return false
      if (!hasValue(draft.destinationUniversity) && !draft.destinationUnknownUniversity) return false
      return true
    },
  },
  {
    id: 2,
    title: 'Origin and citizenship',
    subtitle: 'Tell us about where you are coming from.',
    isEnabled: () => true,
    validate: (draft) => hasValue(draft.nationality),
  },
  {
    id: 3,
    title: 'Program basics',
    subtitle: 'Share the program details you already know.',
    isEnabled: () => true,
    validate: (draft) => draft.degreeType !== '',
  },
  {
    id: 4,
    title: 'Admission status',
    subtitle: 'Where are you in the application journey?',
    isEnabled: () => true,
    validate: (draft) => draft.admissionStatus !== '',
  },
  {
    id: 5,
    title: 'Visa and documents',
    subtitle: 'Needed for non-EU students or if you are unsure.',
    isEnabled: () => true,
    isDisabled: (draft) => draft.isEuCitizen === 'yes',
    validate: () => true,
  },
  {
    id: 6,
    title: 'Budget and funding',
    subtitle: 'Estimate your monthly range and support needs.',
    isEnabled: () => true,
    validate: () => true,
  },
  {
    id: 7,
    title: 'Housing preferences',
    subtitle: 'Let us know what housing feels right.',
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
