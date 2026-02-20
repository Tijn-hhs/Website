import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { fetchMe, saveProfile } from '../lib/api'
import { UserProfile } from '../types/user'
import type { OnboardingDraft } from '../onboarding/types'

// Tailwind styles
const inputBase =
  'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const selectBase =
  'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

// Helper to convert onboarding draft to profile format
function convertDraftToProfile(draft: OnboardingDraft): Partial<UserProfile> {
  return {
    destinationCountry: draft.destinationCountry || undefined,
    destinationCity: draft.destinationCity || undefined,
    destinationUniversity: draft.destinationUniversity || undefined,
    nationality: draft.nationality || undefined,
    residenceCountry: draft.residenceCountry || undefined,
    degreeType: draft.degreeType || undefined,
    fieldOfStudy: draft.fieldOfStudy || undefined,
    programStartMonth: draft.programStartMonth || undefined,
    passportExpiry: draft.passportExpiry || undefined,
    visaType: draft.visaType || undefined,
  }
}

// EDITABLE_KEYS: whitelisted keys from UserProfile that can be saved
const EDITABLE_KEYS: (keyof UserProfile)[] = [
  'nationality',
  'residenceCountry',
  'destinationCountry',
  'destinationCity',
  'destinationUniversity',
  'degreeType',
  'fieldOfStudy',
  'programStartMonth',
  'admissionStatus',
  'isEuCitizen',
  'visaType',
  'passportExpiry',
  'housingBudget',
  'monthlyBudgetRange',
  'scholarshipNeed',
  'fundingSource',
  'housingPreference',
  'housingSupportNeeded',
  // Application details
  'targetApplicationRound',
  'specificProgramName',
  'bocconiTestStatus',
  'previousDegreeLanguage',
]

const createEmptyProfile = (): UserProfile => {
  return Object.fromEntries(
    EDITABLE_KEYS.map((key) => [key, ''])
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
  
  console.log('[MySituation] buildSavePayload - included keys:', Object.keys(payload))
  console.log('[MySituation] buildSavePayload - sample values:', {
    destinationCountry: payload.destinationCountry,
    destinationUniversity: payload.destinationUniversity,
    degreeType: payload.degreeType,
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
        profile.destinationUniversity ||
        profile.nationality ||
        profile.degreeType
      )
      
      console.log('[MySituation] loadProfile - Profile fields:', {
        destinationCountry: profile.destinationCountry,
        destinationUniversity: profile.destinationUniversity,
        nationality: profile.nationality,
        degreeType: profile.degreeType,
        hasProfileData,
      })
      
      let merged = { ...emptyProfile, ...profile }
      
      // Fallback: if profile is empty, try to load from localStorage draft
      if (!hasProfileData && typeof window !== 'undefined') {
        const draftJson = window.localStorage.getItem('leavs:onboardingDraft')
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
        destinationUniversity: merged.destinationUniversity,
        fieldOfStudy: merged.fieldOfStudy,
        degreeType: merged.degreeType,
        programStartMonth: merged.programStartMonth,
        nationality: merged.nationality,
        residenceCountry: merged.residenceCountry,
        isEuCitizen: merged.isEuCitizen,
        hasVisa: merged.hasVisa,
        monthlyBudgetRange: merged.monthlyBudgetRange,
        housingPreference: merged.housingPreference,
        lastCompletedStep: merged.lastCompletedStep,
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
    if (!formData.degreeType?.trim()) {
      errors.degreeType = 'Degree type is required'
    }
    if (!formData.programStartMonth?.trim()) {
      errors.programStartMonth = 'Program start month is required'
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
        destinationUniversity: payload.destinationUniversity,
        degreeType: payload.degreeType,
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
        keysWithValues: Object.entries(profile).filter(([, v]) => v !== undefined && v !== '' && v !== null).slice(0, 10),
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
        destinationUniversity: profile.destinationUniversity,
        degreeType: profile.degreeType,
        nationality: profile.nationality,
        allKeys: Object.keys(profile),
      })
      console.log('[MySituation] Verified (merged with emptyProfile):', {
        destinationCountry: verified.destinationCountry,
        destinationUniversity: verified.destinationUniversity,
        degreeType: verified.degreeType,
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
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">My Situation</h1>
        <p className="text-sm text-gray-600 mt-1">
          Tell us about your plans so we can personalize your Leavs journey.
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
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredName">
                  Preferred name
            </label>
            <input
                  id="preferredName"
                  name="preferredName"
                  type="text"
                  placeholder="e.g., Alex"
                  value={formData.preferredName || ''}
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
                      htmlFor="destinationUniversity"
                    >
                      University name
                    </label>
                    <select
                      id="destinationUniversity"
                      name="destinationUniversity"
                      value={formData.destinationUniversity || ''}
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
                      htmlFor="fieldOfStudy"
                    >
                      Field of study
                    </label>
                    <input
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      type="text"
                      placeholder="e.g., Finance, Computer Science"
                      value={formData.fieldOfStudy || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="specificProgramName"
                    >
                      Specific program name
                    </label>
                    <input
                      id="specificProgramName"
                      name="specificProgramName"
                      type="text"
                      placeholder="e.g., MSc Finance, BSc Economics"
                      value={formData.specificProgramName || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="degreeType"
                    >
                      Degree type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="degreeType"
                      name="degreeType"
                      value={formData.degreeType || ''}
                      onChange={handleChange}
                      className={getSelectClass('degreeType')}
                      aria-required="true"
                    >
                      <option value="">Select degree type</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="master">Master</option>
                      <option value="phd">PhD</option>
                      <option value="exchange">Exchange</option>
                    </select>
                    {renderError('degreeType')}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="programStartMonth"
                    >
                      Program start month <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="programStartMonth"
                      name="programStartMonth"
                      type="month"
                      value={formData.programStartMonth || ''}
                      onChange={handleChange}
                      className={getInputClass('programStartMonth')}
                      aria-required="true"
                    />
                    {renderError('programStartMonth')}
                  </div>
            </div>
          </section>

          <section className="bg-white/80 border border-blue-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visa & Legal Entry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="hasVisa"
                      name="hasVisa"
                      type="checkbox"
                      checked={formData.hasVisa === 'yes'}
                      onChange={(e) => {
                        const value = e.target.checked ? 'yes' : 'no'
                        handleChange({ target: { name: 'hasVisa', value } } as any)
                      }}
                      className="h-4 w-4 text-blue-600 border-blue-200 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700" htmlFor="hasVisa">
                      I have my visa
                    </label>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Housing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </DashboardLayout>
  )
}