export type OnboardingDraft = {
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
  programStartMonth: string
  admissionStatus: 'exploring' | 'applying' | 'accepted' | 'enrolled' | ''
  deadlinesKnown: 'yes' | 'no' | 'unknown'
  passportExpiry: string
  visaType: string
  visaAppointmentNeeded: 'yes' | 'no' | 'unknown'
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
