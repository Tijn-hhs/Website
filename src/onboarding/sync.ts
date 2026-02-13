import { fetchMe, saveProfile } from '../lib/api'

const DRAFT_LOCAL_KEY = 'livecity:onboardingDraft'

/**
 * Sync onboarding draft from localStorage to backend profile.
 * Called when user signs in or completes onboarding auth.
 */
export async function syncOnboardingDraftToProfileIfPresent(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false

    const draftJson = window.localStorage.getItem(DRAFT_LOCAL_KEY)
    if (!draftJson) {
      return true // No draft to sync, no error
    }

    // Only save the onboardingDraftJson field
    // Backend will merge this with existing profile data
    await saveProfile({
      onboardingDraftJson: draftJson,
    } as any)

    // Keep draft in localStorage until onboarding is fully complete
    // It will be cleared on Step 8 finish
    return true
  } catch (error) {
    console.error('Error syncing onboarding draft:', error)
    // Fail gracefully; localStorage is fallback
    return false
  }
}

/**
 * Clear the onboarding draft from localStorage.
 */
export function clearOnboardingDraft(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(DRAFT_LOCAL_KEY)
  }
}
