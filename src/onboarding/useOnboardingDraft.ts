import { useCallback, useEffect, useRef, useState } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { fetchUserData, saveProfile } from '../lib/api'
import { UserProfile } from '../types/user'
import { createDefaultDraft } from './defaultDraft'
import { OnboardingDraft } from './types'

const LOCAL_KEY = 'livecity:onboardingDraft'
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
        const currentProfile = profileRef.current || {}
        await saveProfile({
          ...currentProfile,
          onboardingDraftJson: JSON.stringify(nextDraft),
        })
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
          // User is logged in - prioritize backend data
          const data = await fetchUserData()
          const profile = data.profile || {}
          profileRef.current = profile

          const profileDraft = parseDraft(profile.onboardingDraftJson ?? null)
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
      return '/onboarding/1'
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
