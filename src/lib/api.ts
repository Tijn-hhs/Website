import { get, put, post } from 'aws-amplify/api'
import { fetchAuthSession } from 'aws-amplify/auth'
import { UserProfile, UserData, StepProgress } from '../types/user'

// IMPORTANT: Must match amplify_outputs.json.custom.API.apiName
// This value is read from amplify_outputs.json and registered in src/main.tsx
const API_NAME = 'leavsRest'

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
     
     // CRITICAL FIX: Filter out any keys that look like DynamoDB internal fields
     // or have undefined/null/empty values to prevent data corruption
     const cleanedProfile: Record<string, unknown> = {}
     Object.entries(profile).forEach(([key, value]) => {
       // Keep only valid profile fields with actual values
       if (
         value !== undefined &&
         value !== null &&
         value !== '' &&
         // Skip any internal/system fields
         !key.startsWith('_') &&
         // Skip numeric keys (arrays shouldn't be in profile)
         isNaN(Number(key))
       ) {
         cleanedProfile[key] = value
       }
     })
     
     console.log('[API] Profile cleaning:', {
       originalKeyCount: Object.keys(profile).length,
       cleanedKeyCount: Object.keys(cleanedProfile).length,
       removedKeyCount: Object.keys(profile).length - Object.keys(cleanedProfile).length,
     })
   
     // Rebuild the response with parsed profile
     const userData: UserData = {
       profile: cleanedProfile,
       progress: (jsonObj.progress as StepProgress[] | undefined) || [],
     }
   
     console.log('[API] fetchUserData response received:', {
       hasProfile: !!userData.profile,
       profileType: typeof userData.profile,
       profileIsArray: Array.isArray(userData.profile),
       profileKeys: Object.keys(userData.profile || {}),
       profileKeyCount: Object.keys(userData.profile || {}).length,
       sampleFields: {
         destinationCountry: userData.profile?.destinationCountry,
         universityName: userData.profile?.universityName,
         studyLevel: userData.profile?.studyLevel,
         nationality: userData.profile?.nationality,
       },
       firstFewKeys: Object.keys(userData.profile || {}).slice(0, 20),
       profileStructure: userData.profile ? Object.entries(userData.profile).slice(0, 5).map(([k, v]) => `${k}: ${typeof v}`) : [],
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
    console.log('[API] Profile to save:', profile)
    
    // CRITICAL: Pass the profile object directly
    // Amplify's put() handles JSON serialization internally
    const restOperation = put({
      apiName: API_NAME,
      path: '/user/me',
      options: {
        body: profile as any,  // Type assertion - Amplify handles serialization
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    })

    try {
      const response = await restOperation.response
      console.log('[API] saveProfile response received')
      console.log('[API] Response object type:', typeof response)
      console.log('[API] Response object keys:', Object.keys(response || {}))
      
      // Check response status
      if (response && 'statusCode' in response) {
        console.log('[API] Response statusCode:', response.statusCode)
      }
      
      return true
    } catch (responseError: any) {
      console.error('[API] Error awaiting response:', responseError)
      console.error('[API] Full error object:', JSON.stringify(responseError, null, 2))
      
      // Try to extract error body from the exception
      if (responseError?._response) {
        console.error('[API] Error has _response:', responseError._response)
        console.error('[API] _response type:', typeof responseError._response)
        console.error('[API] _response keys:', Object.keys(responseError._response || {}))
        
        // Try to get the body
        if (responseError._response.body) {
          console.error('[API] _response.body:', responseError._response.body)
          
          // If body is a ReadableStream, try to read it
          if (typeof responseError._response.body.json === 'function') {
            try {
              const errorBody = await responseError._response.body.json();
              console.error('[API] Parsed error body:', errorBody);
            } catch (e) {
              console.error('[API] Failed to parse error body:', e);
            }
          }
        }
      }
      if (responseError?.$metadata) {
        console.error('[API] Error $metadata:', responseError.$metadata)
        console.error('[API] $metadata type:', typeof responseError.$metadata)
        console.error('[API] $metadata stringify:', JSON.stringify(responseError.$metadata, null, 2))
      }
      if (responseError?.underlyingError) {
        console.error('[API] Underlying error:', responseError.underlyingError)
        console.error('[API] underlyingError type:', typeof responseError.underlyingError)
      }
      
      throw responseError
    }
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
    
    return false
  }
}

export async function markStepStarted(stepKey: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    
    console.log('[API] Calling markStepStarted with API_NAME:', API_NAME, 'stepKey:', stepKey)
    
    const restOperation = put({
      apiName: API_NAME,
      path: '/progress/start',
      options: {
        body: { stepKey },
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    })

    await restOperation.response
    return true
  } catch (error) {
    console.error('[API] Error in markStepStarted:', error)
    
    // Re-throw with more context if it's an Amplify InvalidApiName error
    if (error instanceof Error && error.message.includes('API name is invalid')) {
      throw new Error(
        `InvalidApiName: Amplify cannot find REST API '${API_NAME}'. ` +
        `Check that Amplify.configure() registers this API name.`
      )
    }
    
    return false
  }
}

export async function submitFeedback(message: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    
    console.log('[API] Calling submitFeedback with message:', message)
    
    const restOperation = post({
      apiName: API_NAME,
      path: 'feedback',
      options: {
        body: { message },
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    })

    await restOperation.response
    return true
  } catch (error) {
    console.error('[API] Error in submitFeedback:', error)
    
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

export interface Deadline {
  deadlineId: string
  userId: string
  title: string
  dueDate: string
  sendReminder: boolean
  note?: string
  createdAt: string
  updatedAt: string
}

export async function fetchDeadlines(): Promise<Deadline[]> {
  try {
    const headers = await getAuthHeaders()
    
    console.log('[API] Calling fetchDeadlines with API_NAME:', API_NAME)
    
    const restOperation = get({
      apiName: API_NAME,
      path: '/deadlines',
      options: {
        headers,
      },
    })

    const response = await restOperation.response
    const json = await response.body.json()
    
    if (!json || typeof json !== 'object') {
      throw new Error('Empty response from GET /deadlines')
    }
    
    const jsonObj = json as Record<string, unknown>
    const deadlines = (jsonObj.deadlines as Deadline[]) || []
    
    console.log('[API] fetchDeadlines response:', { count: deadlines.length })
    
    return deadlines
  } catch (error) {
    console.error('[API] Error in fetchDeadlines:', error)
    
    if (error instanceof Error && error.message.includes('API name is invalid')) {
      throw new Error(
        `InvalidApiName: Amplify cannot find REST API '${API_NAME}'. ` +
        `Check that Amplify.configure() registers this API name.`
      )
    }
    
    throw error
  }
}

export async function createDeadline(
  title: string,
  dueDate: string,
  sendReminder: boolean,
  note?: string
): Promise<Deadline> {
  try {
    const headers = await getAuthHeaders()
    
    console.log('[API] Calling createDeadline:', { title, dueDate, sendReminder })
    
    const restOperation = post({
      apiName: API_NAME,
      path: '/deadlines',
      options: {
        body: { title, dueDate, sendReminder, note },
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
    })

    const response = await restOperation.response
    const json = await response.body.json()
    
    if (!json || typeof json !== 'object') {
      throw new Error('Empty response from POST /deadlines')
    }
    
    const jsonObj = json as Record<string, unknown>
    const deadline = jsonObj.deadline as Deadline
    
    console.log('[API] createDeadline response:', { deadlineId: deadline.deadlineId })
    
    return deadline
  } catch (error) {
    console.error('[API] Error in createDeadline:', error)
    
    if (error instanceof Error && error.message.includes('API name is invalid')) {
      throw new Error(
        `InvalidApiName: Amplify cannot find REST API '${API_NAME}'. ` +
        `Check that Amplify.configure() registers this API name.`
      )
    }
    
    throw error
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  overview: {
    totalUsers: number
    activeUsers: number
    totalFeedback: number
    avgStepsCompleted: number
  }
  signupTimeline: { date: string; count: number }[]
  stepBreakdown: { step: string; completions: number }[]
  topDestinations: { city: string; count: number }[]
  topNationalities: { nationality: string; count: number }[]
  generatedAt: string
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const headers = await getAuthHeaders()

  // In local dev, use the Vite proxy path (/api-proxy) to avoid CORS preflight failures.
  // In production, use the full API endpoint from amplify_outputs.json.
  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/admin/stats'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/stats`
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }

  return res.json() as Promise<AdminStats>
}

// ─── Admin: Reddit Posts ──────────────────────────────────────────────────────

export interface RedditPost {
  postId: string
  subreddit: string
  title: string
  selftext: string
  author: string
  score: number
  numComments: number
  createdUtc: number   // Unix timestamp (seconds)
  url: string
  permalink: string
  isSticky: boolean
  fetchedAt: string
}

export interface RedditPostsResponse {
  posts: RedditPost[]
  total: number
  subredditCounts: Record<string, number>
  fetchedAt: string
}

/**
 * Fetch Reddit posts from the admin API.
 * Optionally filter by subreddit name (e.g. "bocconi").
 * Results are sorted newest-first by the backend.
 */
export async function fetchAdminRedditPosts(subreddit?: string): Promise<RedditPostsResponse> {
  const headers = await getAuthHeaders()

  const params = new URLSearchParams({ limit: '200' })
  if (subreddit) params.set('subreddit', subreddit)

  let url: string
  if (import.meta.env.DEV) {
    url = `/api-proxy/admin/reddit-posts?${params}`
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/reddit-posts?${params}`
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }

  return res.json() as Promise<RedditPostsResponse>
}
