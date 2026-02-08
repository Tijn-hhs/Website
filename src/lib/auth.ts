import { getCurrentUser } from 'aws-amplify/auth'

/**
 * Check if user is currently signed in without throwing errors.
 */
export async function isSignedIn(): Promise<boolean> {
  try {
    await getCurrentUser()
    return true
  } catch {
    return false
  }
}
