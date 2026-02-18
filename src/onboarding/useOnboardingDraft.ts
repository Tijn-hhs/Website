import { useCallback, useEffect, useRef, useState } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { fetchMe, saveProfile } from '../lib/api'
import { UserProfile } from '../types/user'
import { createDefaultDraft } from './defaultDraft'
import { OnboardingDraft } from './types'

const LOCAL_KEY = 'leavs:onboardingDraft'
const SAVE_DEBOUNCE_MS = 600

const parseDraft = (value: string | null): OnboardingDraft | null => {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<OnboardingDraft>
    return { ...createDefaultDraft(), ...parsed }
  } catch {
    return null
  }
}

const getUpdatedAt = (draft: OnboardingDraft | null) => {
  if (!draft?.updatedAt) return 0
  const timestamp = Date.parse(draft.updatedAt)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const pickLatestDraft = (
  primary: OnboardingDraft | null,
  secondary: OnboardingDraft | null
): OnboardingDraft | null => {
  if (primary && secondary) {
    const primaryTime = getUpdatedAt(primary)
    const secondaryTime = getUpdatedAt(secondary)
    if (primaryTime && secondaryTime) {
      return primaryTime >= secondaryTime ? primary : secondary
    }
    return primary
  }
  return primary || secondary
}

/**
 * Check if user is currently authenticated.
 */
async function isUserAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser()
    return true
  } catch {
    return false
  }
}

export function useOnboardingDraft() {
  const [draft, setDraft] = useState<OnboardingDraft>(() => createDefaultDraft())
  const [isLoading, setIsLoading] = useState(true)
  const profileRef = useRef<UserProfile | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persistDraft = useCallback((nextDraft: OnboardingDraft) => {
    // Always save to localStorage immediately
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(nextDraft))
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
    }

    // Debounce backend save, but only if user is authenticated
    saveTimeoutRef.current = window.setTimeout(async () => {
      const isAuthenticated = await isUserAuthenticated()
      
      if (isAuthenticated) {
        // Save each onboarding field individually to the profile
        await saveProfile({
          preferredName: nextDraft.preferredName,
          destinationCountry: nextDraft.destinationCountry,
          destinationCity: nextDraft.destinationCity,
          destinationUniversity: nextDraft.destinationUniversity,
          destinationUnknownCountry: nextDraft.destinationUnknownCountry,
          destinationUnknownCity: nextDraft.destinationUnknownCity,
          destinationUnknownUniversity: nextDraft.destinationUnknownUniversity,
          nationality: nextDraft.nationality,
          residenceCountry: nextDraft.residenceCountry,
          isEuCitizen: nextDraft.isEuCitizen,
          degreeType: nextDraft.degreeType,
          fieldOfStudy: nextDraft.fieldOfStudy,
          fieldOfStudyUnknown: nextDraft.fieldOfStudyUnknown,
          programStartMonth: nextDraft.programStartMonth,
          programStartMonthUnknown: nextDraft.programStartMonthUnknown,
          programApplied: nextDraft.programApplied,
          programAccepted: nextDraft.programAccepted,
          hasGmatOrEntranceTest: nextDraft.hasGmatOrEntranceTest,
          gmatScore: nextDraft.gmatScore,
          hasEnglishTest: nextDraft.hasEnglishTest,
          englishTestType: nextDraft.englishTestType,
          englishTestScore: nextDraft.englishTestScore,
          hasRecommendationLetters: nextDraft.hasRecommendationLetters,
          hasCv: nextDraft.hasCv,
          admissionStatus: nextDraft.admissionStatus,
          deadlinesKnown: nextDraft.deadlinesKnown,
          passportExpiry: nextDraft.passportExpiry,
          visaType: nextDraft.visaType,
          visaAppointmentNeeded: nextDraft.visaAppointmentNeeded,
          hasVisa: nextDraft.hasVisa,
          hasCodiceFiscale: nextDraft.hasCodiceFiscale,
          hasResidencePermit: nextDraft.hasResidencePermit,
          hasHousing: nextDraft.hasHousing,
          needsBankAccount: nextDraft.needsBankAccount,
          hasBankAccount: nextDraft.hasBankAccount,
          needsPhoneNumber: nextDraft.needsPhoneNumber,
          hasPhoneNumber: nextDraft.hasPhoneNumber,
          hasTravelInsurance: nextDraft.hasTravelInsurance,
          hasHealthInsurance: nextDraft.hasHealthInsurance,
          monthlyBudgetRange: nextDraft.monthlyBudgetRange,
          scholarshipNeed: nextDraft.scholarshipNeed,
          fundingSource: nextDraft.fundingSource,
          housingPreference: nextDraft.housingPreference,
          moveInWindow: nextDraft.moveInWindow,
          housingSupportNeeded: nextDraft.housingSupportNeeded,
          lastCompletedStep: nextDraft.lastCompletedStep,
          checklistItems: nextDraft.checklistItems,
        } as UserProfile)
      }
      // If not authenticated, data stays in localStorage
    }, SAVE_DEBOUNCE_MS) as unknown as ReturnType<typeof setTimeout>
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadDraft = async () => {
      const defaultDraft = createDefaultDraft()
      const localDraft =
        typeof window !== 'undefined' ? parseDraft(window.localStorage.getItem(LOCAL_KEY)) : null

      const isAuthenticated = await isUserAuthenticated()

      try {
        if (isAuthenticated) {
          // User is logged in - read from individual profile fields
          const data = await fetchMe()
          const profile = data.profile || {}
          profileRef.current = profile

          // Build draft from individual profile fields
          const profileDraft: OnboardingDraft = {
            preferredName: profile.preferredName || '',
            destinationCountry: profile.destinationCountry || '',
            destinationCity: profile.destinationCity || '',
            destinationUniversity: profile.destinationUniversity || '',
            destinationUnknownCountry: profile.destinationUnknownCountry || false,
            destinationUnknownCity: profile.destinationUnknownCity || false,
            destinationUnknownUniversity: profile.destinationUnknownUniversity || false,
            nationality: profile.nationality || '',
            residenceCountry: profile.residenceCountry || '',
            isEuCitizen: (profile.isEuCitizen as 'yes' | 'no' | 'unknown') || 'unknown',
            degreeType: (profile.degreeType as any) || '',
            fieldOfStudy: profile.fieldOfStudy || '',
            fieldOfStudyUnknown: profile.fieldOfStudyUnknown || false,
            programStartMonth: profile.programStartMonth || '',
            programStartMonthUnknown: profile.programStartMonthUnknown || false,
            programApplied: (profile.programApplied as any) || '',
            programAccepted: (profile.programAccepted as any) || '',
            hasGmatOrEntranceTest: (profile.hasGmatOrEntranceTest as any) || '',
            gmatScore: profile.gmatScore || '',
            hasEnglishTest: (profile.hasEnglishTest as any) || '',
            englishTestType: profile.englishTestType || '',
            englishTestScore: profile.englishTestScore || '',
            hasRecommendationLetters: (profile.hasRecommendationLetters as any) || '',
            hasCv: (profile.hasCv as any) || '',
            admissionStatus: (profile.admissionStatus as any) || '',
            deadlinesKnown: (profile.deadlinesKnown as any) || 'unknown',
            passportExpiry: profile.passportExpiry || '',
            visaType: profile.visaType || '',
            visaAppointmentNeeded: (profile.visaAppointmentNeeded as any) || 'unknown',
            hasVisa: (profile.hasVisa as any) || '',
            hasCodiceFiscale: (profile.hasCodiceFiscale as any) || '',
            hasResidencePermit: (profile.hasResidencePermit as any) || '',
            hasHousing: (profile.hasHousing as any) || '',
            needsBankAccount: (profile.needsBankAccount as any) || '',
            hasBankAccount: (profile.hasBankAccount as any) || '',
            needsPhoneNumber: (profile.needsPhoneNumber as any) || '',
            hasPhoneNumber: (profile.hasPhoneNumber as any) || '',
            hasTravelInsurance: (profile.hasTravelInsurance as any) || '',
            hasHealthInsurance: (profile.hasHealthInsurance as any) || '',
            monthlyBudgetRange: (profile.monthlyBudgetRange as any) || 'unknown',
            scholarshipNeed: (profile.scholarshipNeed as any) || 'maybe',
            fundingSource: (profile.fundingSource as any) || 'unknown',
            housingPreference: (profile.housingPreference as any) || 'unknown',
            moveInWindow: profile.moveInWindow || '',
            housingSupportNeeded: (profile.housingSupportNeeded as any) || 'unknown',
            lastCompletedStep: profile.lastCompletedStep || 0,
            checklistItems: profile.checklistItems || {},
          }

          const mergedDraft = pickLatestDraft(profileDraft, localDraft) || defaultDraft

          if (isMounted) {
            setDraft({ ...defaultDraft, ...mergedDraft })
          }
        } else {
          // User is not logged in - use localStorage only
          const fallbackDraft = localDraft || defaultDraft
          if (isMounted) {
            setDraft({ ...defaultDraft, ...fallbackDraft })
          }
        }
      } catch (error) {
        // On error, use localStorage as fallback
        const fallbackDraft = localDraft || defaultDraft
        if (isMounted) {
          setDraft({ ...defaultDraft, ...fallbackDraft })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDraft()

    return () => {
      isMounted = false
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const updateField = useCallback(
    <Key extends keyof OnboardingDraft>(key: Key, value: OnboardingDraft[Key]) => {
      setDraft((prevDraft) => {
        const updatedDraft = {
          ...prevDraft,
          [key]: value,
          updatedAt: new Date().toISOString(),
        }
        persistDraft(updatedDraft)
        return updatedDraft
      })
    },
    [persistDraft]
  )

  const setLastCompletedStep = useCallback(
    (stepNumber: number) => {
      setDraft((prevDraft) => {
        const updatedDraft = {
          ...prevDraft,
          lastCompletedStep: Math.max(prevDraft.lastCompletedStep || 0, stepNumber),
          updatedAt: new Date().toISOString(),
        }
        persistDraft(updatedDraft)
        return updatedDraft
      })
    },
    [persistDraft]
  )

  const getResumePath = useCallback(() => {
    if (!draft.lastCompletedStep || draft.lastCompletedStep < 1) {
      return '/onboarding/0'
    }
    if (draft.lastCompletedStep >= 8) {
      return '/onboarding/8'
    }
    return `/onboarding/${draft.lastCompletedStep + 1}`
  }, [draft.lastCompletedStep])

  const clearLocalDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_KEY)
    }
  }, [])

  return {
    draft,
    isLoading,
    updateField,
    setLastCompletedStep,
    getResumePath,
    clearLocalDraft,
  }
}
