export interface UserProfile {
  onboardingDraftJson?: string
  firstName?: string
  lastName?: string
  nationality?: string
  residenceCountry?: string
  dateOfBirth?: string
  destinationCountry?: string
  destinationCity?: string
  universityName?: string
  programName?: string
  studyLevel?: string
  startDate?: string
  admissionStatus?: string
  isEuCitizen?: string
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
  monthlyBudgetRange?: string
  scholarshipNeed?: string
  fundingSource?: string
  housingPreference?: string
  housingSupportNeeded?: string
  // Cost of Living detailed breakdown
  housingType?: string
  rentCost?: number
  utilitiesCost?: number
  internetCost?: number
  mobileCost?: number
  transportCost?: number
  groceriesCost?: number
  diningOutCost?: number
  entertainmentCost?: number
  clothingCost?: number
  personalCareCost?: number
  booksCost?: number
}

export interface StepProgress {
  stepKey: string
  completed: boolean
  completedAt?: string
  updatedAt?: string
  started?: boolean
  startedAt?: string
}

export interface UserData {
  profile: UserProfile
  progress: StepProgress[]
}
