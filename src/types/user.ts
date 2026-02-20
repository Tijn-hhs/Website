export interface UserProfile {
  // Personal information
  preferredName?: string
  nationality?: string
  residenceCountry?: string
  // Destination
  destinationCountry?: string
  destinationCity?: string
  destinationUniversity?: string
  destinationUnknownCountry?: boolean
  destinationUnknownCity?: boolean
  destinationUnknownUniversity?: boolean
  // Program details
  degreeType?: string
  fieldOfStudy?: string
  fieldOfStudyUnknown?: boolean
  programStartMonth?: string
  programStartMonthUnknown?: boolean
  // Application status
  programApplied?: string
  programAccepted?: string
  admissionStatus?: string
  deadlinesKnown?: string
  // Test scores
  hasGmatOrEntranceTest?: string
  gmatScore?: string
  hasEnglishTest?: string
  englishTestType?: string
  englishTestScore?: string
  hasRecommendationLetters?: string
  hasCv?: string
  // Visa and travel
  isEuCitizen?: string
  hasVisa?: string
  visaType?: string
  passportExpiry?: string
  visaAppointmentNeeded?: string
  // Immigration
  hasCodiceFiscale?: string
  hasResidencePermit?: string
  // Housing
  hasHousing?: string
  housingPreference?: string
  housingBudget?: string
  moveInWindow?: string
  housingSupportNeeded?: string
  // Banking and phone
  needsBankAccount?: string
  hasBankAccount?: string
  needsPhoneNumber?: string
  hasPhoneNumber?: string
  // Insurance and health
  hasTravelInsurance?: string
  hasHealthInsurance?: string
  // Budget and finance
  monthlyBudgetRange?: string
  scholarshipNeed?: string
  fundingSource?: string
  lastCompletedStep?: number
  checklistItems?: Record<number, Record<string, boolean>>
  documentChecklist?: Record<string, boolean>
  // University application details
  targetApplicationRound?: string
  specificProgramName?: string
  bocconiTestStatus?: string
  previousDegreeLanguage?: string
  // Before departure
  flightBooked?: string
  departureDate?: string
  hasEhic?: string
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
