import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMe } from '../lib/api'
import type { UserProfile } from '../types/user'

type InfoField = {
  key: keyof UserProfile
  label: string
  formatter?: (value: any) => string
}

type UserInfoBoxProps = {
  title: string
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

export default function UserInfoBox({ title, fields }: UserInfoBoxProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const data = await fetchMe()
      setProfile(data.profile || {})
      setError(null)
    } catch (err) {
      console.error('[UserInfoBox] Error loading user data:', err)
      setError('Unable to load your information')
    } finally {
      setIsLoading(false)
    }
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
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          
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
        
        <Link
          to="/my-situation"
          className="flex-shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-150 hover:border-blue-300 hover:bg-blue-50 hover:shadow"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}
