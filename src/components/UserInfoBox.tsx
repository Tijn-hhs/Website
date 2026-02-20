import { useEffect, useState } from 'react'
import { fetchMe, saveProfile } from '../lib/api'
import type { ReactNode } from 'react'
import type { UserProfile } from '../types/user'

type InfoField = {
  key: keyof UserProfile
  label: string
  formatter?: (value: any) => string
}

type UserInfoBoxProps = {
  title: string
  subtitle?: ReactNode
  fields: InfoField[]
}

// Format values for display
const formatValue = (value: any): string => {
  if (value === undefined || value === null || value === '') {
    return 'Not set'
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'string') {
    // Format study level
    const studyLevelMap: Record<string, string> = {
      bachelor: 'Bachelor',
      master: 'Master',
      phd: 'PhD',
      exchange: 'Exchange',
      other: 'Other',
    }
    if (studyLevelMap[value.toLowerCase()]) {
      return studyLevelMap[value.toLowerCase()]
    }
    
    // Format admission status
    const admissionMap: Record<string, string> = {
      exploring: 'Exploring',
      applying: 'Applying',
      accepted: 'Accepted',
      enrolled: 'Enrolled',
    }
    if (admissionMap[value.toLowerCase()]) {
      return admissionMap[value.toLowerCase()]
    }
    
    return value
  }
  return String(value)
}

export default function UserInfoBox({ title, subtitle, fields }: UserInfoBoxProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const data = await fetchMe()
      setProfile(data.profile || {})
      setEditedProfile(data.profile || {})
      setError(null)
    } catch (err) {
      console.error('[UserInfoBox] Error loading user data:', err)
      setError('Unable to load your information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setEditedProfile({ ...profile } as UserProfile)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile({ ...profile } as UserProfile)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const success = await saveProfile(editedProfile)
      if (success) {
        setProfile(editedProfile)
        setIsEditing(false)
      } else {
        setError('Failed to save changes')
      }
    } catch (err) {
      console.error('[UserInfoBox] Error saving profile:', err)
      setError('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (key: keyof UserProfile, value: string | number | boolean) => {
    setEditedProfile((prev) => ({ ...prev, [key]: value }))
  }

  // Get input type and options for a field
  const getFieldConfig = (key: keyof UserProfile) => {
    // Dropdown fields
    const dropdownFields: Record<string, string[]> = {
      destinationCountry: ['', 'Italy'],
      destinationCity: ['', 'Milan'],
      universityName: [
        '',
        'Bocconi University',
        'Politecnico di Milano',
        'Università degli Studi di Milano',
        'Università Cattolica del Sacro Cuore',
        'Università degli Studi di Milano-Bicocca',
        'NABA',
        'IED',
        'Marangoni Institute',
        'Domus Academy',
        'IULM University',
        'Other',
      ],
      studyLevel: ['', 'bachelor', 'master', 'phd', 'exchange'],
      admissionStatus: ['', 'accepted', 'conditional', 'applied', 'planning'],
      visaType: ['', 'student', 'research', 'exchange', 'none'],
      registrationStatus: ['', 'not-started', 'in-progress', 'completed'],
      accommodationType: ['', 'dorm', 'shared', 'studio', 'family'],
      healthCoverage: ['', 'public', 'private', 'both'],
      localTransport: ['', 'public', 'bike', 'walk', 'ride-share'],
    }

    // Date fields
    const dateFields = [
      'startDate',
      'dateOfBirth',
      'passportExpiry',
      'visaAppointmentDate',
      'travelDate',
      'leaseStart',
      'arrivalDate',
    ]

    // Number fields
    const numberFields = ['monthlyBudget', 'housingBudget']

    if (key in dropdownFields) {
      return { type: 'select', options: dropdownFields[key] }
    }
    if (dateFields.includes(key as string)) {
      return { type: 'date' }
    }
    if (numberFields.includes(key as string)) {
      return { type: 'number' }
    }
    return { type: 'text' }
  }

  // Format dropdown option labels
  const formatOptionLabel = (option: string, fieldKey: keyof UserProfile): string => {
    if (option === '') return `Select ${fieldKey.replace(/([A-Z])/g, ' $1').toLowerCase()}`
    
    // Special formatting for specific values
    const labelMap: Record<string, string> = {
      'bachelor': 'Bachelor',
      'master': 'Master',
      'phd': 'PhD',
      'exchange': 'Exchange',
      'accepted': 'Accepted',
      'conditional': 'Conditional offer',
      'applied': 'Applied',
      'planning': 'Planning to apply',
      'student': 'Student visa',
      'research': 'Research visa',
      'none': 'Not required',
      'not-started': 'Not started',
      'in-progress': 'In progress',
      'completed': 'Completed',
      'dorm': 'Dormitory',
      'shared': 'Shared apartment',
      'studio': 'Studio',
      'family': 'Host family',
      'public': 'Public',
      'private': 'Private',
      'both': 'Both',
      'bike': 'Bike',
      'walk': 'Walk',
      'ride-share': 'Ride share',
    }

    return labelMap[option] || option
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-32 rounded bg-slate-200"></div>
            <div className="h-3 w-48 rounded bg-slate-200"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 shadow-sm">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  const hasAnyData = fields.some(
    (field) => profile && profile[field.key] !== undefined && profile[field.key] !== '' && profile[field.key] !== null
  )

  return (
    <>
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            )}
            
            {!hasAnyData ? (
              <p className="mt-2 text-sm text-slate-600">
                No information set yet. Complete your profile to see relevant details here.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {fields.map((field) => {
                  const value = profile?.[field.key]
                  const displayValue = field.formatter
                    ? field.formatter(value)
                    : formatValue(value)
                  
                  // Only show fields that have values
                  if (value === undefined || value === null || value === '') {
                    return null
                  }
                  
                  return (
                    <div key={field.key} className="text-sm">
                      <span className="font-medium text-slate-700">{field.label}:</span>{' '}
                      <span className="text-slate-900">{displayValue}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
          <button
            onClick={handleEdit}
            className="flex-shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-150 hover:border-blue-300 hover:bg-blue-50 hover:shadow"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {fields.map((field) => {
                const config = getFieldConfig(field.key)
                const baseInputClass =
                  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'

                return (
                  <div key={field.key}>
                    <label htmlFor={field.key} className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>

                    {config.type === 'select' ? (
                      <select
                        id={field.key}
                        value={(editedProfile[field.key] as string) || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={baseInputClass}
                      >
                        {config.options?.map((option) => (
                          <option key={option} value={option}>
                            {formatOptionLabel(option, field.key)}
                          </option>
                        ))}
                      </select>
                    ) : config.type === 'number' ? (
                      <input
                        type="number"
                        id={field.key}
                        value={editedProfile[field.key] !== undefined && editedProfile[field.key] !== null ? String(editedProfile[field.key]) : ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={baseInputClass}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : config.type === 'date' ? (
                      <input
                        type="date"
                        id={field.key}
                        value={(editedProfile[field.key] as string) || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={baseInputClass}
                      />
                    ) : (
                      <input
                        type="text"
                        id={field.key}
                        value={(editedProfile[field.key] as string) || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={baseInputClass}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
            
            <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

