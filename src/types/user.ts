export interface UserProfile {
  firstName?: string
  lastName?: string
  nationality?: string
  dateOfBirth?: string
  destinationCountry?: string
  destinationCity?: string
  universityName?: string
  programName?: string
  studyLevel?: string
  startDate?: string
  admissionStatus?: string
  visaType?: string
  passportExpiry?: string
  visaAppointmentDate?: string
  travelDate?: string
  flightsBooked?: boolean
  packingNotes?: string
  registrationStatus?: string
  residencePermitNeeded?: boolean
  accommodationType?: string
  housingBudget?: string
  leaseStart?: string
  bankAccountNeeded?: boolean
  insuranceProvider?: string
  legalDocsReady?: boolean
  healthCoverage?: string
  doctorPreference?: string
  arrivalDate?: string
  localTransport?: string
  dailyLifeNotes?: string
  monthlyBudget?: string
  budgetCurrency?: string
  budgetingNotes?: string
  communityInterest?: string
  supportNeeds?: string
}

export interface StepProgress {
  stepKey: string
  completed: boolean
  completedAt?: string
  updatedAt?: string
}

export interface UserData {
  profile: UserProfile
  progress: StepProgress[]
}
