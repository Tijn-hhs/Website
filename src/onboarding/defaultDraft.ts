import { OnboardingDraft } from './types'

export function createDefaultDraft(): OnboardingDraft {
  return {
    destinationCountry: '',
    destinationCity: '',
    destinationUniversity: '',
    destinationUnknownCountry: false,
    destinationUnknownCity: false,
    destinationUnknownUniversity: false,
    nationality: '',
    residenceCountry: '',
    isEuCitizen: 'unknown',
    degreeType: '',
    fieldOfStudy: '',
    programStartMonth: '',
    admissionStatus: '',
    deadlinesKnown: 'unknown',
    passportExpiry: '',
    visaType: '',
    visaAppointmentNeeded: 'unknown',
    monthlyBudgetRange: 'unknown',
    scholarshipNeed: 'maybe',
    fundingSource: 'unknown',
    housingPreference: 'unknown',
    moveInWindow: '',
    housingSupportNeeded: 'unknown',
    lastCompletedStep: 0,
    checklistItems: {},
    updatedAt: undefined,
  }
}
