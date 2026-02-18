import { fetchMe, saveProfile } from '../lib/api'

const DRAFT_LOCAL_KEY = 'leavs:onboardingDraft'

/**
 * Sync onboarding draft from localStorage to backend profile.
 * Called when user signs in or completes onboarding auth.
 */
export async function syncOnboardingDraftToProfileIfPresent(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false

    const draftJson = window.localStorage.getItem(DRAFT_LOCAL_KEY)
    if (!draftJson) {
      return true // No draft to sync, no error
    }

    // Parse the draft and save individual fields
    const draft = JSON.parse(draftJson)
    await saveProfile({
      preferredName: draft.preferredName,
      destinationCountry: draft.destinationCountry,
      destinationCity: draft.destinationCity,
      destinationUniversity: draft.destinationUniversity,
      destinationUnknownCountry: draft.destinationUnknownCountry,
      destinationUnknownCity: draft.destinationUnknownCity,
      destinationUnknownUniversity: draft.destinationUnknownUniversity,
      nationality: draft.nationality,
      residenceCountry: draft.residenceCountry,
      isEuCitizen: draft.isEuCitizen,
      degreeType: draft.degreeType,
      fieldOfStudy: draft.fieldOfStudy,
      fieldOfStudyUnknown: draft.fieldOfStudyUnknown,
      programStartMonth: draft.programStartMonth,
      programStartMonthUnknown: draft.programStartMonthUnknown,
      programApplied: draft.programApplied,
      programAccepted: draft.programAccepted,
      hasGmatOrEntranceTest: draft.hasGmatOrEntranceTest,
      gmatScore: draft.gmatScore,
      hasEnglishTest: draft.hasEnglishTest,
      englishTestType: draft.englishTestType,
      englishTestScore: draft.englishTestScore,
      hasRecommendationLetters: draft.hasRecommendationLetters,
      hasCv: draft.hasCv,
      admissionStatus: draft.admissionStatus,
      deadlinesKnown: draft.deadlinesKnown,
      passportExpiry: draft.passportExpiry,
      visaType: draft.visaType,
      visaAppointmentNeeded: draft.visaAppointmentNeeded,
      hasVisa: draft.hasVisa,
      hasCodiceFiscale: draft.hasCodiceFiscale,
      hasResidencePermit: draft.hasResidencePermit,
      hasHousing: draft.hasHousing,
      needsBankAccount: draft.needsBankAccount,
      hasBankAccount: draft.hasBankAccount,
      needsPhoneNumber: draft.needsPhoneNumber,
      hasPhoneNumber: draft.hasPhoneNumber,
      hasTravelInsurance: draft.hasTravelInsurance,
      hasHealthInsurance: draft.hasHealthInsurance,
      monthlyBudgetRange: draft.monthlyBudgetRange,
      scholarshipNeed: draft.scholarshipNeed,
      fundingSource: draft.fundingSource,
      housingPreference: draft.housingPreference,
      moveInWindow: draft.moveInWindow,
      housingSupportNeeded: draft.housingSupportNeeded,
      lastCompletedStep: draft.lastCompletedStep,
      checklistItems: draft.checklistItems,
    } as any)

    // Keep draft in localStorage until onboarding is fully complete
    // It will be cleared on Step 8 finish
    return true
  } catch (error) {
    console.error('Error syncing onboarding draft:', error)
    // Fail gracefully; localStorage is fallback
    return false
  }
}

/**
 * Clear the onboarding draft from localStorage.
 */
export function clearOnboardingDraft(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(DRAFT_LOCAL_KEY)
  }
}
