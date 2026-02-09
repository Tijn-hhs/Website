import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { fetchMe, saveProfile } from '../lib/api'
import { UserProfile } from '../types/user'

// Tailwind styles
const inputBase =
  'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const selectBase =
  'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const textAreaBase =
  'w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

// EDITABLE_KEYS: whitelisted keys from UserProfile that can be saved
const EDITABLE_KEYS: (keyof UserProfile)[] = [
  'firstName',
  'lastName',
  'nationality',
  'dateOfBirth',
  'destinationCountry',
  'destinationCity',
  'universityName',
  'programName',
  'studyLevel',
  'startDate',
  'admissionStatus',
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
    if (formData[key] !== undefined) {
      payload[key] = formData[key] as any
    }
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
      const data = await fetchMe()
      const profile = data.profile || {}
      const merged = { ...emptyProfile, ...profile }
      setFormData(merged)
      setOriginalData(merged)
      setLoadError(null)
      const editableValues = EDITABLE_KEYS.filter((k) => profile[k] !== undefined)
      console.log('[MySituation] loaded editable values', editableValues)
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
      console.log('[MySituation] saving payload keys', Object.keys(payload))

      const success = await saveProfile(payload)
      if (!success) {
        throw new Error('saveProfile returned false')
      }

      // Always re-fetch from backend (source of truth)
      const data = await fetchMe()
      const profile = data.profile || {}
      const verified = { ...emptyProfile, ...profile }
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
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-8">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">University & Admission</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="destinationCountry"
                    >
                      Destination country <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="destinationCountry"
                      name="destinationCountry"
                      type="text"
                      placeholder="e.g., Italy"
                      value={formData.destinationCountry || ''}
                      onChange={handleChange}
                      className={getInputClass('destinationCountry')}
                      aria-required="true"
                    />
                    {renderError('destinationCountry')}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="destinationCity"
                    >
                      Destination city <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="destinationCity"
                      name="destinationCity"
                      type="text"
                      placeholder="e.g., Milan"
                      value={formData.destinationCity || ''}
                      onChange={handleChange}
                      className={getInputClass('destinationCity')}
                      aria-required="true"
                    />
                    {renderError('destinationCity')}
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="universityName"
                    >
                      University name
                    </label>
                    <input
                      id="universityName"
                      name="universityName"
                      type="text"
                      placeholder="e.g., Bocconi University"
                      value={formData.universityName || ''}
                      onChange={handleChange}
                      className={inputBase}
                    />
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
