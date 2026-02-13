import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase } from '../ui'
import { getPrevEnabledStepId, getStepConfig } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'
import { fetchMe, saveProfile } from '../../lib/api'
import { UserProfile } from '../../types/user'
import { isSignedIn } from '../../lib/auth'
import { clearOnboardingDraft, syncOnboardingDraftToProfileIfPresent } from '../sync'

const formatValue = (value: string | boolean | undefined) => {
  if (value === undefined || value === '') return 'Not specified'
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return value
}

const formatMonthToDate = (value: string) => (value ? `${value}-01` : '')

const cleanProfile = (profile: UserProfile): UserProfile => {
  const cleaned: Partial<UserProfile> = {}
  Object.entries(profile).forEach(([key, value]) => {
    // Keep non-empty values, including false and 0
    if (value !== undefined && value !== '' && value !== null) {
      cleaned[key as keyof UserProfile] = value as any
    }
  })
  return cleaned as UserProfile
}

export default function Step8ReviewFinish() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, clearLocalDraft } = useOnboardingDraft()
  const step = getStepConfig(8)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [userSignedIn, setUserSignedIn] = useState(false)
  const hasCheckedAuthRef = useRef(false)

  const prevStepId = useMemo(() => getPrevEnabledStepId(8, draft), [draft])

  // Check auth status on mount
  useEffect(() => {
    if (!hasCheckedAuthRef.current) {
      hasCheckedAuthRef.current = true
      isSignedIn().then(setUserSignedIn)
    }
  }, [])

  const handleBack = () => navigate(`/onboarding/${prevStepId}`)

  const handleFinish = async () => {
    setIsSaving(true)
    setSaveError(null)
    setLastCompletedStep(8)

    try {
      // Log draft state first
      console.log('[Onboarding] handleFinish - Draft state:', {
        destinationCountry: draft.destinationCountry,
        destinationCity: draft.destinationCity,
        destinationUniversity: draft.destinationUniversity,
        nationality: draft.nationality,
        degreeType: draft.degreeType,
        fieldOfStudy: draft.fieldOfStudy,
        programStartMonth: draft.programStartMonth,
      })

      // Fetch current profile (for userId and other required fields)
      console.log('[Onboarding] Fetching current profile...')
      const data = await fetchMe()
      const profile = data.profile || {}
      
      console.log('[Onboarding] Current backend profile keys:', Object.keys(profile).length)

      // Build the update with ONLY the fields we want to send
      // Don't spread the entire profile - only send onboarding data
      // NOTE: Do NOT send userId or updatedAt - backend handles these
      const profileToSave: Partial<UserProfile> = {}

      // Explicitly set each field from draft - ONLY if it has a value
      if (draft.destinationCountry && !draft.destinationUnknownCountry) {
        profileToSave.destinationCountry = draft.destinationCountry
      }
      if (draft.destinationCity && !draft.destinationUnknownCity) {
        profileToSave.destinationCity = draft.destinationCity
      }
      if (draft.destinationUniversity && !draft.destinationUnknownUniversity) {
        profileToSave.universityName = draft.destinationUniversity
      }
      if (draft.nationality) {
        profileToSave.nationality = draft.nationality
      }
      if (draft.residenceCountry) {
        profileToSave.residenceCountry = draft.residenceCountry
      }
      if (draft.degreeType) {
        profileToSave.studyLevel = draft.degreeType
      }
      if (draft.fieldOfStudy) {
        profileToSave.programName = draft.fieldOfStudy
      }
      if (draft.programStartMonth) {
        profileToSave.startDate = formatMonthToDate(draft.programStartMonth)
      }
      if (draft.admissionStatus) {
        const mappedStatus = mapAdmissionStatus(draft.admissionStatus)
        if (mappedStatus) {
          profileToSave.admissionStatus = mappedStatus
        }
      }
      if (draft.passportExpiry) {
        profileToSave.passportExpiry = draft.passportExpiry
      }
      if (draft.visaType) {
        profileToSave.visaType = draft.visaType
      }
      if (draft.monthlyBudgetRange) {
        const mappedBudget = mapBudgetRange(draft.monthlyBudgetRange)
        if (mappedBudget) {
          profileToSave.monthlyBudget = mappedBudget
        }
      }
      if (draft.housingPreference) {
        const mappedHousing = mapHousingPreference(draft.housingPreference)
        if (mappedHousing) {
          profileToSave.accommodationType = mappedHousing
        }
      }
      if (draft.moveInWindow) {
        profileToSave.leaseStart = formatMonthToDate(draft.moveInWindow)
      }

      // Clear draft JSON field
      profileToSave.onboardingDraftJson = ''

      const cleanedProfile = profileToSave as UserProfile

      console.log('[Onboarding] Profile to save:', {
        destinationCountry: cleanedProfile.destinationCountry,
        destinationCity: cleanedProfile.destinationCity,
        universityName: cleanedProfile.universityName,
        nationality: cleanedProfile.nationality,
        studyLevel: cleanedProfile.studyLevel,
        programName: cleanedProfile.programName,
        startDate: cleanedProfile.startDate,
        admissionStatus: cleanedProfile.admissionStatus,
        passportExpiry: cleanedProfile.passportExpiry,
        visaType: cleanedProfile.visaType,
        monthlyBudget: cleanedProfile.monthlyBudget,
        accommodationType: cleanedProfile.accommodationType,
        leaseStart: cleanedProfile.leaseStart,
        allKeys: Object.keys(cleanedProfile),
      })

       // Delete onboardingDraftJson if empty to avoid backend issues
       if (cleanedProfile.onboardingDraftJson === '') {
         delete cleanedProfile.onboardingDraftJson
       }

       // Save to backend
       console.log('[Onboarding] Calling saveProfile...')
       console.log('[Onboarding] Final payload to send:', {
         keys: Object.keys(cleanedProfile),
         values: cleanedProfile,
       })
       await saveProfile(cleanedProfile as UserProfile)
      
      console.log('[Onboarding] saveProfile succeeded')
      
      // Verify the save by re-fetching
      console.log('[Onboarding] Verifying save by re-fetching profile...')
      const verifyData = await fetchMe()
      const verifiedProfile = verifyData.profile || {}
      
      console.log('[Onboarding] Verification - saved data retrieved:', {
        destinationCountry: verifiedProfile.destinationCountry,
        destinationCity: verifiedProfile.destinationCity,
        universityName: verifiedProfile.universityName,
        nationality: verifiedProfile.nationality,
        studyLevel: verifiedProfile.studyLevel,
        programName: verifiedProfile.programName,
        startDate: verifiedProfile.startDate,
        admissionStatus: verifiedProfile.admissionStatus,
        passportExpiry: verifiedProfile.passportExpiry,
        visaType: verifiedProfile.visaType,
        monthlyBudget: verifiedProfile.monthlyBudget,
        accommodationType: verifiedProfile.accommodationType,
        leaseStart: verifiedProfile.leaseStart,
      })

      clearLocalDraft()
      clearOnboardingDraft()
      
      console.log('[Onboarding] Navigating to dashboard...')
      navigate('/dashboard')
    } catch (error) {
      console.error('[Onboarding] Error during finish:', error)
      console.error('[Onboarding] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setSaveError(`Could not save your profile: ${errorMsg}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={8}
        title="Review and finish"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      stepId={8}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={userSignedIn ? handleFinish : undefined}
      nextLabel={isSaving ? 'Saving...' : 'Finish onboarding'}
      nextDisabled={isSaving || !userSignedIn}
    >
      {!userSignedIn && (
        <div className={cardBase}>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Create an account to save your progress</h2>
          <p className="text-sm text-slate-600 mb-4">
            Sign up or sign in to save your onboarding progress to your profile.
          </p>
          <div className="rounded-lg border border-slate-200 p-4">
            <Authenticator>
              {() => {
                // After successful authentication, sync the draft and update state
                syncOnboardingDraftToProfileIfPresent()
                  .catch(() => {
                    // Sync failed, but user is signed in - proceed anyway
                  })
                
                setUserSignedIn(true)
                return <div className="text-sm text-green-600">Successfully signed in!</div>
              }}
            </Authenticator>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={cardBase}>
          <h2 className="text-sm font-semibold text-slate-800">Destination</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Country: {formatValue(draft.destinationUnknownCountry ? 'Unknown' : draft.destinationCountry)}</p>
            <p>City: {formatValue(draft.destinationUnknownCity ? 'Unknown' : draft.destinationCity)}</p>
            <p>University: {formatValue(draft.destinationUnknownUniversity ? 'Unknown' : draft.destinationUniversity)}</p>
          </div>
        </div>

        <div className={cardBase}>
          <h2 className="text-sm font-semibold text-slate-800">Origin</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Nationality: {formatValue(draft.nationality)}</p>
            <p>Residence: {formatValue(draft.residenceCountry)}</p>
            <p>EU citizen: {formatValue(draft.isEuCitizen)}</p>
          </div>
        </div>

        <div className={cardBase}>
          <h2 className="text-sm font-semibold text-slate-800">Program</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Degree: {formatValue(draft.degreeType)}</p>
            <p>Field: {formatValue(draft.fieldOfStudy)}</p>
            <p>Start month: {formatValue(draft.programStartMonth)}</p>
          </div>
        </div>

        <div className={cardBase}>
          <h2 className="text-sm font-semibold text-slate-800">Admission</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Status: {formatValue(draft.admissionStatus)}</p>
            <p>Deadlines known: {formatValue(draft.deadlinesKnown)}</p>
          </div>
        </div>

        <div className={cardBase}>
          <h2 className="text-sm font-semibold text-slate-800">Visa and documents</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Passport expiry: {formatValue(draft.passportExpiry)}</p>
            <p>Visa type: {formatValue(draft.visaType)}</p>
            <p>Appointment needed: {formatValue(draft.visaAppointmentNeeded)}</p>
          </div>
        </div>

        <div className={cardBase}>
          <h2 className="text-sm font-semibold text-slate-800">Budget and housing</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Monthly budget: {formatValue(draft.monthlyBudgetRange)}</p>
            <p>Funding source: {formatValue(draft.fundingSource)}</p>
            <p>Housing preference: {formatValue(draft.housingPreference)}</p>
            <p>Move-in window: {formatValue(draft.moveInWindow)}</p>
          </div>
        </div>
      </div>

      {saveError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      ) : null}
    </OnboardingLayout>
  )
}

function mapAdmissionStatus(value: string) {
  switch (value) {
    case 'exploring':
      return 'planning'
    case 'applying':
      return 'applied'
    case 'accepted':
      return 'accepted'
    case 'enrolled':
      return 'accepted'
    default:
      return ''
  }
}

function mapBudgetRange(value: string) {
  switch (value) {
    case 'lt500':
      return '<500'
    case '500-900':
      return '500-900'
    case '900-1300':
      return '900-1300'
    case '1300+':
      return '1300+'
    default:
      return ''
  }
}

function mapHousingPreference(value: string) {
  switch (value) {
    case 'dorm':
      return 'dorm'
    case 'private':
      return 'private'
    case 'roommates':
      return 'roommates'
    default:
      return ''
  }
}

