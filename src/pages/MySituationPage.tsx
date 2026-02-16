import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { fetchMe, saveProfile } from '../lib/api'
import { UserProfile } from '../types/user'
import type { OnboardingDraft } from '../onboarding/types'

// Tailwind styles
const inputBase =
  'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const selectBase =
  'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const textAreaBase =
  'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

// Helper to convert profile data back to onboarding draft format
function syncProfileToDraft(profile: UserProfile): string {
  const draft: Partial<OnboardingDraft> = {
    destinationCountry: profile.destinationCountry || '',
    destinationCity: profile.destinationCity || '',
    destinationUniversity: profile.universityName || '',
    nationality: profile.nationality || '',
    residenceCountry: profile.residenceCountry || '',
    isEuCitizen: (profile.isEuCitizen as 'yes' | 'no' | 'unknown') || 'unknown',
    degreeType: (profile.studyLevel as 'bachelor' | 'master' | 'phd' | 'exchange' | 'other' | '') || '',
    fieldOfStudy: profile.programName || '',
    programStartMonth: profile.startDate ? profile.startDate.substring(0, 7) : '',
    admissionStatus: (profile.admissionStatus as 'exploring' | 'applying' | 'accepted' | 'enrolled' | '') || '',
    deadlinesKnown: 'unknown',
    passportExpiry: profile.passportExpiry || '',
    visaType: profile.visaType || '',
    visaAppointmentNeeded: 'unknown',
    monthlyBudgetRange: (profile.monthlyBudgetRange as 'lt500' | '500-900' | '900-1300' | '1300+' | 'unknown') || 'unknown',
    scholarshipNeed: (profile.scholarshipNeed as 'yes' | 'no' | 'maybe') || 'maybe',
    fundingSource: (profile.fundingSource as 'parents' | 'savings' | 'work' | 'scholarship' | 'mixed' | 'unknown') || 'unknown',
    housingPreference: (profile.housingPreference as 'dorm' | 'private' | 'roommates' | 'unknown') || 'unknown',
    moveInWindow: '',
    housingSupportNeeded: (profile.housingSupportNeeded as 'yes' | 'no' | 'unknown') || 'unknown',
    lastCompletedStep: 0,
  }
  
  return JSON.stringify(draft)
}

// Helper to convert onboarding draft to profile format
function convertDraftToProfile(draft: OnboardingDraft): Partial<UserProfile> {
  return {
    destinationCountry: draft.destinationCountry || undefined,
    destinationCity: draft.destinationCity || undefined,
    universityName: draft.destinationUniversity || undefined,
    nationality: draft.nationality || undefined,
    residenceCountry: draft.residenceCountry || undefined,
    studyLevel: draft.degreeType || undefined,
    programName: draft.fieldOfStudy || undefined,
    startDate: draft.programStartMonth ? `${draft.programStartMonth}-01` : undefined,
    passportExpiry: draft.passportExpiry || undefined,
    visaType: draft.visaType || undefined,
  }
}

// EDITABLE_KEYS: whitelisted keys from UserProfile that can be saved
const EDITABLE_KEYS: (keyof UserProfile)[] = [
  'firstName',
  'lastName',
  'nationality',
  'residenceCountry',
  'dateOfBirth',
  'destinationCountry',
  'destinationCity',
  'universityName',
  'programName',
  'studyLevel',
  'startDate',
  'admissionStatus',
  'isEuCitizen',
  'visaType',
  'passportExpiry',
  'visaAppointmentDate',
  'travelDate',
  'flightsBooked',
  'packingNotes',
  'registrationStatus',
  'residencePermitNeeded',
  'accommodationType',
  'housingBudget',
  'leaseStart',
  'bankAccountNeeded',
  'insuranceProvider',
  'legalDocsReady',
  'healthCoverage',
  'doctorPreference',
  'arrivalDate',
  'localTransport',
  'dailyLifeNotes',
  'monthlyBudget',
  'budgetCurrency',
  'budgetingNotes',
  'communityInterest',
  'supportNeeds',
  'monthlyBudgetRange',
  'scholarshipNeed',
  'fundingSource',
  'housingPreference',
  'housingSupportNeeded',
]

const createEmptyProfile = (): UserProfile => {
  const booleanKeys = new Set(['flightsBooked', 'residencePermitNeeded', 'bankAccountNeeded', 'legalDocsReady'])
  return Object.fromEntries(
    EDITABLE_KEYS.map((key) => [key, booleanKeys.has(key) ? false : ''])
  ) as UserProfile
}

const buildSavePayload = (formData: UserProfile): UserProfile => {
  const payload: Partial<UserProfile> = {}
  EDITABLE_KEYS.forEach((key) => {
    const value = formData[key]
    // Only include values that are actually set (not empty strings or undefined)
    if (value !== undefined && value !== '' && value !== null) {
      payload[key] = value as any
    }
  })
  
  // Sync the profile data back to onboarding draft JSON
  payload.onboardingDraftJson = syncProfileToDraft(formData)
  
  console.log('[MySituation] buildSavePayload - included keys:', Object.keys(payload))
  console.log('[MySituation] buildSavePayload - sample values:', {
    destinationCountry: payload.destinationCountry,
    universityName: payload.universityName,
    studyLevel: payload.studyLevel,
    isEuCitizen: payload.isEuCitizen,
  })
  return payload as UserProfile
}

const isProfileDirty = (current: UserProfile, original: UserProfile): boolean => {
  for (const key of EDITABLE_KEYS) {
    if (current[key] !== original[key]) {
      return true
    }
  }
  return false
}

export default function MySituationPage() {
  const navigate = useNavigate()
  const emptyProfile = createEmptyProfile()

  const [formData, setFormData] = useState<UserProfile>(emptyProfile)
  const [originalData, setOriginalData] = useState<UserProfile>(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      console.log('[MySituation] loadProfile - Starting...')
      const data = await fetchMe()
      console.log('[MySituation] loadProfile - fetchMe returned:', {
        hasData: !!data,
        hasProfile: !!data.profile,
        profileType: typeof data.profile,
        profileKeys: data.profile ? Object.keys(data.profile) : [],
      })
      const profile = data.profile || {}
      
      // Check if profile has any of the key onboarding fields
      const hasProfileData = !!(
        profile.destinationCountry ||
        profile.universityName ||
        profile.nationality ||
        profile.studyLevel
      )
      
      console.log('[MySituation] loadProfile - Profile fields:', {
        destinationCountry: profile.destinationCountry,
        universityName: profile.universityName,
        nationality: profile.nationality,
        studyLevel: profile.studyLevel,
        hasProfileData,
      })
      
      let merged = { ...emptyProfile, ...profile }
      
      // Fallback: if profile is empty, try to load from localStorage draft
      if (!hasProfileData && typeof window !== 'undefined') {
        const draftJson = window.localStorage.getItem('livecity:onboardingDraft')
        if (draftJson) {
          try {
            const draft = JSON.parse(draftJson) as OnboardingDraft
            const draftData = convertDraftToProfile(draft)
            
            console.log('[MySituation] No profile data, using localStorage draft as fallback')
            console.log('[MySituation] Draft data from localStorage:', draftData)
            
            merged = { ...emptyProfile, ...draftData }
          } catch (e) {
            console.error('[MySituation] Failed to parse localStorage draft:', e)
          }
        }
      }
      
      setFormData(merged)
      setOriginalData(merged)
      setLoadError(null)
      
      const editableValues = EDITABLE_KEYS.filter((k) => merged[k] !== undefined && merged[k] !== '')
      console.log('[MySituation] loaded profile (has backend data:', hasProfileData + ')')
      console.log('[MySituation] profile keys with values:', editableValues)
      console.log('[MySituation] full profile data:', {
        destinationCountry: merged.destinationCountry,
        destinationCity: merged.destinationCity,
        universityName: merged.universityName,
        programName: merged.programName,
        studyLevel: merged.studyLevel,
        startDate: merged.startDate,
        nationality: merged.nationality,
        admissionStatus: merged.admissionStatus,
        passportExpiry: merged.passportExpiry,
        visaType: merged.visaType,
        monthlyBudget: merged.monthlyBudget,
        accommodationType: merged.accommodationType,
        leaseStart: merged.leaseStart,
      })
    } catch (error) {
      console.error('[MySituation] loadProfile error:', error)
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        navigate('/auth?returnTo=/my-situation', { replace: true })
        return
      }
      setLoadError('Failed to load profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isDirty = isProfileDirty(formData, originalData)

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.nationality?.trim()) {
      errors.nationality = 'Nationality is required'
    }
    if (!formData.destinationCountry?.trim()) {
      errors.destinationCountry = 'Destination country is required'
    }
    if (!formData.destinationCity?.trim()) {
      errors.destinationCity = 'Destination city is required'
    }
    if (!formData.studyLevel?.trim()) {
      errors.studyLevel = 'Study level is required'
    }
    if (!formData.startDate?.trim()) {
      errors.startDate = 'Program start date is required'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const payload = buildSavePayload(formData)
      console.log('[MySituation] Submitting form data...')
      console.log('[MySituation] saving payload keys', Object.keys(payload))
      console.log('[MySituation] sample payload data:', {
        destinationCountry: payload.destinationCountry,
        universityName: payload.universityName,
        studyLevel: payload.studyLevel,
        nationality: payload.nationality,
      })

      await saveProfile(payload)
      console.log('[MySituation] saveProfile call succeeded')

      // Always re-fetch from backend (source of truth)
      console.log('[MySituation] Re-fetching profile from backend...')
      const data = await fetchMe()
      console.log('[MySituation] Re-fetch response:', {
        hasData: !!data,
        hasProfile: !!data.profile,
        profileType: typeof data.profile,
        profileKeys: data.profile ? Object.keys(data.profile) : [],
        profileKeyCount: data.profile ? Object.keys(data.profile).length : 0,
      })
      const profile = data.profile || {}
      
      // DEBUG: Log the actual structure of the profile to diagnose the 382 keys issue
      console.log('[MySituation] DEBUG - Profile analysis:', {
        profileType: typeof profile,
        isArray: Array.isArray(profile),
        constructor: profile.constructor?.name,
        firstTenKeys: Object.keys(profile).slice(0, 10),
        keysWithValues: Object.entries(profile).filter(([k, v]) => v !== undefined && v !== '' && v !== null).slice(0, 10),
        allKeysSample: Object.keys(profile).slice(0, 50),
      })
      
      // SAFETY CHECK: If the re-fetched profile is empty, something went wrong
      // Don't clear the form - keep the current data
      const hasAnyData = Object.keys(profile).some(key => {
        const value = profile[key as keyof typeof profile]
        return value !== undefined && value !== '' && value !== null
      })
      
      if (!hasAnyData) {
        console.warn('[MySituation] WARNING: Re-fetched profile is empty! Not updating form.')
        console.warn('[MySituation] This suggests the save might have failed or not propagated yet.')
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
        return
      }
      
      const verified = { ...emptyProfile, ...profile }
      
      console.log('[MySituation] After save, re-fetched profile from backend')
      console.log('[MySituation] Re-fetched profile data:', {
        destinationCountry: profile.destinationCountry,
        universityName: profile.universityName,
        studyLevel: profile.studyLevel,
        nationality: profile.nationality,
        allKeys: Object.keys(profile),
      })
      console.log('[MySituation] Verified (merged with emptyProfile):', {
        destinationCountry: verified.destinationCountry,
        universityName: verified.universityName,
        studyLevel: verified.studyLevel,
        nationality: verified.nationality,
        allKeys: Object.keys(verified).filter(k => verified[k as keyof UserProfile] !== ''),
      })
      
      setFormData(verified)
      setOriginalData(verified)
      setSaveStatus('success')
      console.log('[MySituation] saved and re-fetched from backend')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('[MySituation] handleSubmit error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const getInputClass = (fieldName: string) =>
    validationErrors[fieldName]
      ? 'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-red-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
      : inputBase

  const getSelectClass = (fieldName: string) =>
    validationErrors[fieldName]
      ? 'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-red-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
      : selectBase

  const renderError = (fieldName: string) =>
    validationErrors[fieldName] ? (
      <p className="text-xs text-red-600 mt-1">{validationErrors[fieldName]}</p>
    ) : null

  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-blue-50 to-white pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">My Situation</h1>
            <p className="text-sm text-gray-600 mt-1">
              Tell us about your plans so we can personalize your LiveCity journey.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading your information...</p>
            </div>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">{loadError}</p>
              <button
                onClick={() => {
                  setIsLoading(true)
                  loadProfile()
                }}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="e.g., Amina"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="e.g., Rossi"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nationality">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nationality"
                      name="nationality"
                      type="text"
                      placeholder="e.g., Canadian"
                      value={formData.nationality || ''}
                      onChange={handleChange}
                      className={getInputClass('nationality')}
                      aria-required="true"
                    />
                    {renderError('nationality')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dateOfBirth">
                      Date of birth
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Citizenship & Visa Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="isEuCitizen">
                      Are you an EU citizen?
                    </label>
                    <select
                      id="isEuCitizen"
                      name="isEuCitizen"
                      value={formData.isEuCitizen || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select an option</option>
                      <option value="yes">Yes, I am an EU citizen</option>
                      <option value="no">No, I am not an EU citizen</option>
                      <option value="unknown">I am not sure yet</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">University & Admission</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="destinationCountry"
                    >
                      Destination country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="destinationCountry"
                      name="destinationCountry"
                      value={formData.destinationCountry || ''}
                      onChange={handleChange}
                      className={getSelectClass('destinationCountry')}
                      aria-required="true"
                    >
                      <option value="">Select country</option>
                      <option value="Italy">Italy</option>
                    </select>
                    {renderError('destinationCountry')}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="destinationCity"
                    >
                      Destination city <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="destinationCity"
                      name="destinationCity"
                      value={formData.destinationCity || ''}
                      onChange={handleChange}
                      className={getSelectClass('destinationCity')}
                      aria-required="true"
                    >
                      <option value="">Select city</option>
                      <option value="Milan">Milan</option>
                    </select>
                    {renderError('destinationCity')}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="universityName"
                    >
                      University name
                    </label>
                    <select
                      id="universityName"
                      name="universityName"
                      value={formData.universityName || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select university</option>
                      <option value="Bocconi University">Bocconi University</option>
                      <option value="Politecnico di Milano">Politecnico di Milano</option>
                      <option value="Università degli Studi di Milano">Università degli Studi di Milano (State University)</option>
                      <option value="Università Cattolica del Sacro Cuore">Università Cattolica del Sacro Cuore (Catholic University)</option>
                      <option value="Università degli Studi di Milano-Bicocca">Università degli Studi di Milano-Bicocca</option>
                      <option value="NABA - Nuova Accademia di Belle Arti">NABA - Nuova Accademia di Belle Arti</option>
                      <option value="IED - Istituto Europeo di Design">IED - Istituto Europeo di Design</option>
                      <option value="Marangoni Institute">Marangoni Institute</option>
                      <option value="Domus Academy">Domus Academy</option>
                      <option value="IULM University">IULM University</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="programName"
                    >
                      Program name
                    </label>
                    <input
                      id="programName"
                      name="programName"
                      type="text"
                      placeholder="e.g., MSc in Finance"
                      value={formData.programName || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="studyLevel"
                    >
                      Study level <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="studyLevel"
                      name="studyLevel"
                      value={formData.studyLevel || ''}
                      onChange={handleChange}
                      className={getSelectClass('studyLevel')}
                      aria-required="true"
                    >
                      <option value="">Select study level</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="master">Master</option>
                      <option value="phd">PhD</option>
                      <option value="exchange">Exchange</option>
                    </select>
                    {renderError('studyLevel')}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="startDate"
                    >
                      Program start date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate || ''}
                      onChange={handleChange}
                      className={getInputClass('startDate')}
                      aria-required="true"
                    />
                    {renderError('startDate')}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="admissionStatus"
                    >
                      Admission status
                    </label>
                    <select
                      id="admissionStatus"
                      name="admissionStatus"
                      value={formData.admissionStatus || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select status</option>
                      <option value="accepted">Accepted</option>
                      <option value="conditional">Conditional</option>
                      <option value="applied">Applied</option>
                      <option value="planning">Planning</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Visa & Legal Entry</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="visaType">
                      Visa type
                    </label>
                    <select
                      id="visaType"
                      name="visaType"
                      value={formData.visaType || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select visa type</option>
                      <option value="student">Student visa</option>
                      <option value="research">Research visa</option>
                      <option value="exchange">Exchange visa</option>
                      <option value="none">Not required</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="passportExpiry">
                      Passport expiry date
                    </label>
                    <input
                      id="passportExpiry"
                      name="passportExpiry"
                      type="date"
                      value={formData.passportExpiry || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="visaAppointmentDate"
                    >
                      Visa appointment date
                    </label>
                    <input
                      id="visaAppointmentDate"
                      name="visaAppointmentDate"
                      type="date"
                      value={formData.visaAppointmentDate || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget & Funding</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="monthlyBudgetRange">
                      Monthly budget range
                    </label>
                    <select
                      id="monthlyBudgetRange"
                      name="monthlyBudgetRange"
                      value={formData.monthlyBudgetRange || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select budget range</option>
                      <option value="lt500">Less than €500</option>
                      <option value="500-900">€500 - €900</option>
                      <option value="900-1300">€900 - €1300</option>
                      <option value="1300+">€1300+</option>
                      <option value="unknown">Not sure yet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="scholarshipNeed">
                      Do you need a scholarship or financial aid?
                    </label>
                    <select
                      id="scholarshipNeed"
                      name="scholarshipNeed"
                      value={formData.scholarshipNeed || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select an option</option>
                      <option value="yes">Yes, I need financial aid</option>
                      <option value="no">No, I don't need it</option>
                      <option value="maybe">Maybe, I'm exploring options</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fundingSource">
                      Primary funding source
                    </label>
                    <select
                      id="fundingSource"
                      name="fundingSource"
                      value={formData.fundingSource || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select a source</option>
                      <option value="parents">Parents/Family</option>
                      <option value="savings">Personal savings</option>
                      <option value="work">Work/Part-time job</option>
                      <option value="scholarship">Scholarship/Grant</option>
                      <option value="mixed">Mixed sources</option>
                      <option value="unknown">Not sure yet</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pre-Departure Preparation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="travelDate">
                      Planned travel date
                    </label>
                    <input
                      id="travelDate"
                      name="travelDate"
                      type="date"
                      value={formData.travelDate || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="flightsBooked"
                      name="flightsBooked"
                      type="checkbox"
                      checked={formData.flightsBooked || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-blue-200 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700" htmlFor="flightsBooked">
                      Flights booked
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="packingNotes">
                      Packing checklist notes
                    </label>
                    <textarea
                      id="packingNotes"
                      name="packingNotes"
                      rows={3}
                      placeholder="e.g., need winter coat, adapters, medications"
                      value={formData.packingNotes || ''}
                      onChange={handleChange}
                      className={textAreaBase}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Immigration & Registration (Post-Arrival)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="registrationStatus">
                      Registration status
                    </label>
                    <select
                      id="registrationStatus"
                      name="registrationStatus"
                      value={formData.registrationStatus || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select status</option>
                      <option value="not-started">Not started</option>
                      <option value="in-progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="residencePermitNeeded"
                      name="residencePermitNeeded"
                      type="checkbox"
                      checked={formData.residencePermitNeeded || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-blue-200 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700" htmlFor="residencePermitNeeded">
                      Residence permit required
                    </label>
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Housing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="accommodationType">
                      Accommodation type
                    </label>
                    <select
                      id="accommodationType"
                      name="accommodationType"
                      value={formData.accommodationType || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select type</option>
                      <option value="dorm">Dormitory</option>
                      <option value="shared">Shared apartment</option>
                      <option value="studio">Studio</option>
                      <option value="family">Host family</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="housingBudget">
                      Monthly housing budget
                    </label>
                    <input
                      id="housingBudget"
                      name="housingBudget"
                      type="number"
                      placeholder="e.g., 750"
                      value={formData.housingBudget || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="leaseStart">
                      Lease start date
                    </label>
                    <input
                      id="leaseStart"
                      name="leaseStart"
                      type="date"
                      value={formData.leaseStart || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="housingPreference">
                      Housing preference
                    </label>
                    <select
                      id="housingPreference"
                      name="housingPreference"
                      value={formData.housingPreference || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select preference</option>
                      <option value="dorm">Dormitory</option>
                      <option value="private">Private apartment</option>
                      <option value="roommates">Shared apartment with roommates</option>
                      <option value="unknown">Not sure yet</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="housingSupportNeeded"
                      name="housingSupportNeeded"
                      type="checkbox"
                      checked={formData.housingSupportNeeded === 'yes'}
                      onChange={(e) => {
                        const value = e.target.checked ? 'yes' : 'no'
                        handleChange({ target: { name: 'housingSupportNeeded', value } } as any)
                      }}
                      className="h-4 w-4 text-blue-600 border-blue-200 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700" htmlFor="housingSupportNeeded">
                      I need help finding housing
                    </label>
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Banking, Legal & Insurance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="bankAccountNeeded"
                      name="bankAccountNeeded"
                      type="checkbox"
                      checked={formData.bankAccountNeeded || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-blue-200 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700" htmlFor="bankAccountNeeded">
                      Open a local bank account
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="insuranceProvider">
                      Insurance provider
                    </label>
                    <input
                      id="insuranceProvider"
                      name="insuranceProvider"
                      type="text"
                      placeholder="e.g., Allianz"
                      value={formData.insuranceProvider || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="legalDocsReady"
                      name="legalDocsReady"
                      type="checkbox"
                      checked={formData.legalDocsReady || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-blue-200 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700" htmlFor="legalDocsReady">
                      Legal documents prepared
                    </label>
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Healthcare</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="healthCoverage">
                      Health coverage
                    </label>
                    <select
                      id="healthCoverage"
                      name="healthCoverage"
                      value={formData.healthCoverage || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select coverage</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="doctorPreference">
                      Doctor preference
                    </label>
                    <input
                      id="doctorPreference"
                      name="doctorPreference"
                      type="text"
                      placeholder="e.g., English-speaking GP"
                      value={formData.doctorPreference || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Arrival & Daily Life</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="arrivalDate">
                      Arrival date
                    </label>
                    <input
                      id="arrivalDate"
                      name="arrivalDate"
                      type="date"
                      value={formData.arrivalDate || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="localTransport">
                      Local transport
                    </label>
                    <select
                      id="localTransport"
                      name="localTransport"
                      value={formData.localTransport || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select option</option>
                      <option value="public">Public transport</option>
                      <option value="bike">Bike</option>
                      <option value="walk">Walk</option>
                      <option value="ride-share">Ride share</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dailyLifeNotes">
                      Daily life notes
                    </label>
                    <textarea
                      id="dailyLifeNotes"
                      name="dailyLifeNotes"
                      rows={3}
                      placeholder="e.g., preferred neighborhoods, gym access, grocery options"
                      value={formData.dailyLifeNotes || ''}
                      onChange={handleChange}
                      className={textAreaBase}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost of Living & Budgeting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="monthlyBudget">
                      Monthly budget
                    </label>
                    <input
                      id="monthlyBudget"
                      name="monthlyBudget"
                      type="number"
                      placeholder="e.g., 1200"
                      value={formData.monthlyBudget || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="budgetCurrency">
                      Currency
                    </label>
                    <select
                      id="budgetCurrency"
                      name="budgetCurrency"
                      value={formData.budgetCurrency || ''}
                      onChange={handleChange}
                      className={selectBase}
                    >
                      <option value="">Select currency</option>
                      <option value="eur">EUR</option>
                      <option value="usd">USD</option>
                      <option value="gbp">GBP</option>
                      <option value="cad">CAD</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="budgetingNotes">
                      Budgeting notes
                    </label>
                    <textarea
                      id="budgetingNotes"
                      name="budgetingNotes"
                      rows={3}
                      placeholder="e.g., expected rent, tuition payments, meal plan"
                      value={formData.budgetingNotes || ''}
                      onChange={handleChange}
                      className={textAreaBase}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Community & Support</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="communityInterest">
                      Community interests
                    </label>
                    <textarea
                      id="communityInterest"
                      name="communityInterest"
                      rows={3}
                      placeholder="e.g., clubs, sports, language exchange"
                      value={formData.communityInterest || ''}
                      onChange={handleChange}
                      className={textAreaBase}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supportNeeds">
                      Support needs
                    </label>
                    <textarea
                      id="supportNeeds"
                      name="supportNeeds"
                      rows={3}
                      placeholder="e.g., housing guidance, visa checklists, mentorship"
                      value={formData.supportNeeds || ''}
                      onChange={handleChange}
                      className={textAreaBase}
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-4">
                {saveStatus === 'success' && (
                  <span className="text-sm font-medium text-green-600">✓ Saved successfully</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-sm font-medium text-red-600">
                    {Object.keys(validationErrors).length > 0 ? '✗ Please fix errors above' : '✗ Failed to save'}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSaving || isLoading || !isDirty}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : isDirty ? 'Save changes' : 'No changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  )
}
