export type OnboardingDraft = {
  preferredName: string
  destinationCountry: string
  destinationCity: string
  destinationUniversity: string
  destinationUnknownCountry: boolean
  destinationUnknownCity: boolean
  destinationUnknownUniversity: boolean
  nationality: string
  residenceCountry: string
  isEuCitizen: 'yes' | 'no' | 'unknown'
  degreeType: 'bachelor' | 'master' | 'phd' | 'exchange' | 'other' | ''
  fieldOfStudy: string
  fieldOfStudyUnknown: boolean
  programStartMonth: string
  programStartMonthUnknown: boolean
  programApplied: 'yes' | 'no' | ''
  programAccepted: 'yes' | 'no' | ''
  // Application requirements (only if not applied yet)
  hasGmatOrEntranceTest: 'yes' | 'no' | ''
  gmatScore: string
  hasEnglishTest: 'yes' | 'no' | ''
  englishTestType: string
  englishTestScore: string
  hasRecommendationLetters: 'yes' | 'no' | ''
  hasCv: 'yes' | 'no' | ''
  admissionStatus: 'exploring' | 'applying' | 'accepted' | 'enrolled' | ''
  deadlinesKnown: 'yes' | 'no' | 'unknown'
  passportExpiry: string
  visaType: string
  visaAppointmentNeeded: 'yes' | 'no' | 'unknown'
  hasVisa: 'yes' | 'no' | ''
  // Progress tracking
  hasCodiceFiscale: 'yes' | 'no' | ''
  hasResidencePermit: 'yes' | 'no' | ''
  hasHousing: 'yes' | 'no' | ''
  needsBankAccount: 'yes' | 'no' | ''
  hasBankAccount: 'yes' | 'no' | ''
  needsPhoneNumber: 'yes' | 'no' | ''
  hasPhoneNumber: 'yes' | 'no' | ''
  hasTravelInsurance: 'yes' | 'no' | ''
  hasHealthInsurance: 'yes' | 'no' | ''
  monthlyBudgetRange: 'lt500' | '500-900' | '900-1300' | '1300+' | 'unknown'
  scholarshipNeed: 'yes' | 'no' | 'maybe'
  fundingSource: 'parents' | 'savings' | 'work' | 'scholarship' | 'mixed' | 'unknown'
  housingPreference: 'dorm' | 'private' | 'roommates' | 'unknown'
  moveInWindow: string
  housingSupportNeeded: 'yes' | 'no' | 'unknown'
  lastCompletedStep: number
  checklistItems: Record<number, Record<string, boolean>>
  updatedAt?: string
}
