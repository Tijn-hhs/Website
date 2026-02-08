import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase } from '../ui'
import { getPrevEnabledStepId, getStepConfig } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'
import { fetchUserData, saveProfile } from '../../lib/api'
import { UserProfile } from '../../types/user'
import { isSignedIn } from '../../lib/auth'
import { clearOnboardingDraft } from '../sync'

const formatValue = (value: string | boolean | undefined) => {
  if (value === undefined || value === '') return 'Not specified'
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return value
}

const formatMonthToDate = (value: string) => (value ? `${value}-01` : '')

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
      const data = await fetchUserData()
      const profile = data.profile || {}

      const updatedProfile: UserProfile = {
        ...profile,
        destinationCountry: draft.destinationUnknownCountry ? profile.destinationCountry : draft.destinationCountry || profile.destinationCountry,
        destinationCity: draft.destinationUnknownCity ? profile.destinationCity : draft.destinationCity || profile.destinationCity,
        universityName: draft.destinationUnknownUniversity ? profile.universityName : draft.destinationUniversity || profile.universityName,
        nationality: draft.nationality || profile.nationality,
        studyLevel: draft.degreeType || profile.studyLevel,
        programName: draft.fieldOfStudy || profile.programName,
        startDate: formatMonthToDate(draft.programStartMonth) || profile.startDate,
        admissionStatus: mapAdmissionStatus(draft.admissionStatus) || profile.admissionStatus,
        passportExpiry: draft.passportExpiry || profile.passportExpiry,
        visaType: draft.visaType || profile.visaType,
        monthlyBudget: mapBudgetRange(draft.monthlyBudgetRange) || profile.monthlyBudget,
        accommodationType: mapHousingPreference(draft.housingPreference) || profile.accommodationType,
        leaseStart: formatMonthToDate(draft.moveInWindow) || profile.leaseStart,
        onboardingDraftJson: '',
      }

      const success = await saveProfile(updatedProfile)
      if (!success) {
        setSaveError('We could not save your profile. Please try again.')
        return
      }

      clearLocalDraft()
      clearOnboardingDraft()
      navigate('/dashboard')
    } catch (error) {
      console.error('Error finishing onboarding:', error)
      setSaveError('We could not save your profile. Please try again.')
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
                // After successful authentication
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

