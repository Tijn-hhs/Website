import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase } from '../ui'
import { getPrevEnabledStepId, getStepConfig, stepIdToRoute } from '../steps'
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

  const handleBack = () => {
    const routePath = stepIdToRoute(prevStepId)
    navigate(`/onboarding/${routePath}`)
  }

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
        fieldOfStudyUnknown: draft.fieldOfStudyUnknown,
        programStartMonth: draft.programStartMonth,
        programStartMonthUnknown: draft.programStartMonthUnknown,
        programApplied: draft.programApplied,
        programAccepted: draft.programAccepted,
        hasVisa: draft.hasVisa,
        hasCodiceFiscale: draft.hasCodiceFiscale,
        hasResidencePermit: draft.hasResidencePermit,
        hasHousing: draft.hasHousing,
        hasTravelInsurance: draft.hasTravelInsurance,
        hasHealthInsurance: draft.hasHealthInsurance,
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
        profileToSave.destinationUniversity = draft.destinationUniversity
      }
      if (draft.nationality) {
        profileToSave.nationality = draft.nationality
      }
      if (draft.residenceCountry) {
        profileToSave.residenceCountry = draft.residenceCountry
      }
      if (draft.isEuCitizen) {
        profileToSave.isEuCitizen = draft.isEuCitizen
      }
      if (draft.degreeType) {
        profileToSave.degreeType = draft.degreeType
      }
      if (draft.fieldOfStudy && !draft.fieldOfStudyUnknown) {
        profileToSave.fieldOfStudy = draft.fieldOfStudy
      }
      if (draft.programStartMonth && !draft.programStartMonthUnknown) {
        profileToSave.programStartMonth = draft.programStartMonth
      }
      if (draft.programApplied) {
        profileToSave.programApplied = draft.programApplied
      }
      if (draft.programAccepted) {
        profileToSave.programAccepted = draft.programAccepted
      }
      if (draft.hasGmatOrEntranceTest) {
        profileToSave.hasGmatOrEntranceTest = draft.hasGmatOrEntranceTest
      }
      if (draft.gmatScore) {
        profileToSave.gmatScore = draft.gmatScore
      }
      if (draft.hasEnglishTest) {
        profileToSave.hasEnglishTest = draft.hasEnglishTest
      }
      if (draft.englishTestType) {
        profileToSave.englishTestType = draft.englishTestType
      }
      if (draft.englishTestScore) {
        profileToSave.englishTestScore = draft.englishTestScore
      }
      if (draft.hasRecommendationLetters) {
        profileToSave.hasRecommendationLetters = draft.hasRecommendationLetters
      }
      if (draft.hasCv) {
        profileToSave.hasCv = draft.hasCv
      }
      if (draft.hasVisa) {
        profileToSave.hasVisa = draft.hasVisa
      }
      if (draft.hasCodiceFiscale) {
        profileToSave.hasCodiceFiscale = draft.hasCodiceFiscale
      }
      if (draft.hasResidencePermit) {
        profileToSave.hasResidencePermit = draft.hasResidencePermit
      }
      if (draft.hasHousing) {
        profileToSave.hasHousing = draft.hasHousing
      }
      if (draft.needsBankAccount) {
        profileToSave.needsBankAccount = draft.needsBankAccount
      }
      if (draft.hasBankAccount) {
        profileToSave.hasBankAccount = draft.hasBankAccount
      }
      if (draft.needsPhoneNumber) {
        profileToSave.needsPhoneNumber = draft.needsPhoneNumber
      }
      if (draft.hasPhoneNumber) {
        profileToSave.hasPhoneNumber = draft.hasPhoneNumber
      }
      if (draft.hasTravelInsurance) {
        profileToSave.hasTravelInsurance = draft.hasTravelInsurance
      }
      if (draft.hasHealthInsurance) {
        profileToSave.hasHealthInsurance = draft.hasHealthInsurance
      }

      const cleanedProfile = profileToSave as UserProfile

      console.log('[Onboarding] Profile to save:', {
        destinationCountry: cleanedProfile.destinationCountry,
        destinationCity: cleanedProfile.destinationCity,
        destinationUniversity: cleanedProfile.destinationUniversity,
        nationality: cleanedProfile.nationality,
        residenceCountry: cleanedProfile.residenceCountry,
        isEuCitizen: cleanedProfile.isEuCitizen,
        degreeType: cleanedProfile.degreeType,
        fieldOfStudy: cleanedProfile.fieldOfStudy,
        programStartMonth: cleanedProfile.programStartMonth,
        programApplied: cleanedProfile.programApplied,
        programAccepted: cleanedProfile.programAccepted,
        hasVisa: cleanedProfile.hasVisa,
        hasCodiceFiscale: cleanedProfile.hasCodiceFiscale,
        hasResidencePermit: cleanedProfile.hasResidencePermit,
        hasHousing: cleanedProfile.hasHousing,
        needsBankAccount: cleanedProfile.needsBankAccount,
        hasBankAccount: cleanedProfile.hasBankAccount,
        needsPhoneNumber: cleanedProfile.needsPhoneNumber,
        hasPhoneNumber: cleanedProfile.hasPhoneNumber,
        hasTravelInsurance: cleanedProfile.hasTravelInsurance,
        hasHealthInsurance: cleanedProfile.hasHealthInsurance,
        allKeys: Object.keys(cleanedProfile),
      })

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
        destinationUniversity: verifiedProfile.destinationUniversity,
        nationality: verifiedProfile.nationality,
        degreeType: verifiedProfile.degreeType,
        fieldOfStudy: verifiedProfile.fieldOfStudy,
        programStartMonth: verifiedProfile.programStartMonth,
        programApplied: verifiedProfile.programApplied,
        programAccepted: verifiedProfile.programAccepted,
        hasVisa: verifiedProfile.hasVisa,
        hasCodiceFiscale: verifiedProfile.hasCodiceFiscale,
        hasResidencePermit: verifiedProfile.hasResidencePermit,
        hasHousing: verifiedProfile.hasHousing,
        needsBankAccount: verifiedProfile.needsBankAccount,
        hasBankAccount: verifiedProfile.hasBankAccount,
        needsPhoneNumber: verifiedProfile.needsPhoneNumber,
        hasPhoneNumber: verifiedProfile.hasPhoneNumber,
        hasTravelInsurance: verifiedProfile.hasTravelInsurance,
        hasHealthInsurance: verifiedProfile.hasHealthInsurance,
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

      {/* Summary Section */}
      <div className={cardBase}>
        <h2 className="text-lg font-bold text-slate-900 mb-6">Summary of your situation</h2>
        
        <div className="space-y-6">
          {/* Destination */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">📍 Destination</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Country:</span> {formatValue(draft.destinationCountry)}</p>
              <p><span className="font-medium">City:</span> {formatValue(draft.destinationCity)}</p>
              <p><span className="font-medium">University:</span> {formatValue(draft.destinationUniversity)}</p>
            </div>
          </div>

          {/* Origin */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">🏠 Your background</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Nationality:</span> {formatValue(draft.nationality)}</p>
              <p><span className="font-medium">Current residence:</span> {formatValue(draft.residenceCountry)}</p>
              <p><span className="font-medium">EU citizen:</span> {formatValue(draft.isEuCitizen)}</p>
            </div>
          </div>

          {/* Program */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">🎓 Your program</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Degree type:</span> {formatValue(draft.degreeType)}</p>
              <p><span className="font-medium">Field of study:</span> {draft.fieldOfStudyUnknown ? 'Unknown' : formatValue(draft.fieldOfStudy)}</p>
              <p><span className="font-medium">Start month:</span> {draft.programStartMonthUnknown ? 'Unknown' : formatValue(draft.programStartMonth)}</p>
              <p><span className="font-medium">Applied to program:</span> {formatValue(draft.programApplied)}</p>
              {draft.programApplied === 'yes' && (
                <p><span className="font-medium">Accepted:</span> {formatValue(draft.programAccepted)}</p>
              )}
            </div>
          </div>

          {/* Application requirements - only if not applied */}
          {draft.programApplied === 'no' && (
            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 Application requirements</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><span className="font-medium">GMAT/Entrance test:</span> {formatValue(draft.hasGmatOrEntranceTest)}</p>
                {draft.hasGmatOrEntranceTest === 'yes' && draft.gmatScore && (
                  <p className="pl-4"><span className="font-medium">Score:</span> {draft.gmatScore}</p>
                )}
                <p><span className="font-medium">English test:</span> {formatValue(draft.hasEnglishTest)}</p>
                {draft.hasEnglishTest === 'yes' && (
                  <>
                    {draft.englishTestType && <p className="pl-4"><span className="font-medium">Type:</span> {draft.englishTestType}</p>}
                    {draft.englishTestScore && <p className="pl-4"><span className="font-medium">Score:</span> {draft.englishTestScore}</p>}
                  </>
                )}
                <p><span className="font-medium">Recommendation letters:</span> {formatValue(draft.hasRecommendationLetters)}</p>
                <p><span className="font-medium">CV/Resume:</span> {formatValue(draft.hasCv)}</p>
              </div>
            </div>
          )}

          {/* Visa - only for non-EU */}
          {draft.isEuCitizen !== 'yes' && (
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">🛂 Visa status</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><span className="font-medium">Has visa for {draft.destinationCountry}:</span> {formatValue(draft.hasVisa)}</p>
              </div>
            </div>
          )}

          {/* Current progress */}
          <div className="border-l-4 border-teal-500 pl-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">✅ Current progress</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Codice Fiscale:</span> {formatValue(draft.hasCodiceFiscale)}</p>
              <p><span className="font-medium">Residence Permit:</span> {formatValue(draft.hasResidencePermit)}</p>
              <p><span className="font-medium">Housing secured:</span> {formatValue(draft.hasHousing)}</p>
              {draft.needsBankAccount === 'yes' && (
                <p><span className="font-medium">Local bank account:</span> {formatValue(draft.hasBankAccount)}</p>
              )}
              {draft.needsPhoneNumber === 'yes' && (
                <p><span className="font-medium">Local phone number:</span> {formatValue(draft.hasPhoneNumber)}</p>
              )}
              <p><span className="font-medium">Travel insurance:</span> {formatValue(draft.hasTravelInsurance)}</p>
              <p><span className="font-medium">Health insurance:</span> {formatValue(draft.hasHealthInsurance)}</p>
            </div>
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