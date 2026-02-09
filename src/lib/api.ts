import { get, put } from 'aws-amplify/api'
import { fetchAuthSession } from 'aws-amplify/auth'
import { UserProfile, UserData } from '../types/user'

const API_NAME = 'livecityRest'

/**
 * Get authorization headers from the current Amplify session.
 * Returns an empty object if user is not authenticated.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
    
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      }
    }
    return {}
  } catch {
    // User is not authenticated
    return {}
  }
}

export async function fetchUserData(): Promise<UserData> {
  try {
    const headers = await getAuthHeaders()
    
    const restOperation = get({
      apiName: API_NAME,
      path: '/user/me',
      options: {
        headers,
      },
    })

    const response = await restOperation.response
    const json = await response.body.json()
    return (json as unknown as UserData) || { profile: {}, progress: [] }
  } catch (error) {
    console.error('Error fetching user data:', error)
    return { profile: {}, progress: [] }
  }
}

export async function saveProfile(profile: UserProfile): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    
    const restOperation = put({
      apiName: API_NAME,
      path: '/user/me',
      options: {
        body: JSON.stringify(profile),
        headers,
      },
    })

    await restOperation.response
    return true
  } catch (error) {
    console.error('Error saving profile:', error)
    return false
  }
}

// Alias for fetchUserData - semantic convenience for "fetch me"
export const fetchMe = fetchUserData

export async function saveStepProgress(
  stepKey: string,
  completed: boolean
): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    
    const restOperation = put({
      apiName: API_NAME,
      path: '/progress',
      options: {
        body: JSON.stringify({ stepKey, completed }),
        headers,
      },
    })

    await restOperation.response
    return true
  } catch (error) {
    console.error('Error saving step progress:', error)
    return false
  }
}
