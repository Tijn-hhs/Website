import { get, put } from 'aws-amplify/api'
import { fetchAuthSession } from 'aws-amplify/auth'
import { UserProfile, UserData, StepProgress } from '../types/user'

// IMPORTANT: Must match amplify_outputs.json.custom.API.apiName
// This value is read from amplify_outputs.json and registered in src/main.tsx
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
    
    if (!json || typeof json !== 'object') {
      throw new Error('Empty response from GET /user/me')
    }
    
    const jsonObj = json as Record<string, unknown>
   
     // CRITICAL: Handle case where backend returns profile as a stringified JSON
     let profile: Record<string, unknown> = (jsonObj.profile as Record<string, unknown>) || {}
   
     // Check if profile is actually a string (backend serialization issue)
     if (typeof profile === 'string') {
       console.log('[API] WARNING: Backend returned profile as string, parsing...')
       try {
         profile = JSON.parse(profile) as Record<string, unknown>
         console.log('[API] Successfully parsed stringified profile')
       } catch (e) {
         console.error('[API] Failed to parse stringified profile:', e)
         profile = {}
       }
     }
   
     // Rebuild the response with parsed profile
     const userData: UserData = {
       profile,
       progress: (jsonObj.progress as StepProgress[] | undefined) || [],
     }
   
     console.log('[API] fetchUserData response received:', {
       hasProfile: !!userData.profile,
       profileKeys: Object.keys(userData.profile || {}),
       sampleFields: {
         destinationCountry: userData.profile?.destinationCountry,
         universityName: userData.profile?.universityName,
         studyLevel: userData.profile?.studyLevel,
         nationality: userData.profile?.nationality,
       },
     })
   
     return userData
  } catch (error) {
    console.error('[API] Error in fetchUserData:', error)
    
    // Re-throw with more context if it's an Amplify InvalidApiName error
    if (error instanceof Error && error.message.includes('API name is invalid')) {
      throw new Error(
        `InvalidApiName: Amplify cannot find REST API '${API_NAME}'. ` +
        `Check that Amplify.configure() registers this API name.`
      )
    }
    
    throw error
  }
}

export async function saveProfile(profile: UserProfile): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    
    console.log('[API] Calling saveProfile with API_NAME:', API_NAME)
    console.log('[API] Request headers:', Object.keys(headers))
    console.log('[API] Profile keys:', Object.keys(profile))
    
    const restOperation = put({
      apiName: API_NAME,
      path: '/user/me',
      options: {
        body: JSON.stringify(profile),
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    })

    const response = await restOperation.response
    console.log('[API] saveProfile response received')
    console.log('[API] Response object type:', typeof response)
    console.log('[API] Response object keys:', Object.keys(response || {}))
    
    // Check response status
    if (response && 'status' in response) {
      console.log('[API] Response status:', response.status)
    }
    
    return true
  } catch (error) {
    console.error('[API] Error in saveProfile:', error)
    console.error('[API] Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('[API] Error message:', error instanceof Error ? error.message : String(error))
    console.error('[API] Error keys:', Object.keys(error || {}))
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('[API] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
    
    // Re-throw with more context if it's an Amplify InvalidApiName error
    if (error instanceof Error && error.message.includes('API name is invalid')) {
      throw new Error(
        `InvalidApiName: Amplify cannot find REST API '${API_NAME}'. ` +
        `Check that Amplify.configure() registers this API name.`
      )
    }
    throw error
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
    
    console.log('[API] Calling saveStepProgress with API_NAME:', API_NAME, 'stepKey:', stepKey)
    
    const restOperation = put({
      apiName: API_NAME,
      path: '/progress',
      options: {
        body: { stepKey, completed },
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    })

    await restOperation.response
    return true
  } catch (error) {
    console.error('[API] Error in saveStepProgress:', error)
    
    // Re-throw with more context if it's an Amplify InvalidApiName error
    if (error instanceof Error && error.message.includes('API name is invalid')) {
      throw new Error(
        `InvalidApiName: Amplify cannot find REST API '${API_NAME}'. ` +
        `Check that Amplify.configure() registers this API name.`
      )
    }
    
    throw error
  }
}
