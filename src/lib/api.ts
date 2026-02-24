import { get, put, post, del } from 'aws-amplify/api'
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
         universityName: (userData.profile as any)?.universityName,
         studyLevel: (userData.profile as any)?.studyLevel,
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

export async function submitFeedback(message: string, page?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    
    console.log('[API] Calling submitFeedback with message:', message)
    
    const restOperation = post({
      apiName: API_NAME,
      path: '/feedback',
      options: {
        body: { message, page: page ?? 'unknown' },
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
  templateKey?: string
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
  note?: string,
  templateKey?: string,
): Promise<Deadline> {
  try {
    const headers = await getAuthHeaders()
    
    console.log('[API] Calling createDeadline:', { title, dueDate, sendReminder })
    
    const restOperation = post({
      apiName: API_NAME,
      path: '/deadlines',
      options: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: { title, dueDate, sendReminder, ...(note !== undefined ? { note } : {}), ...(templateKey ? { templateKey } : {}) } as any,
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

export async function updateDeadline(
  deadlineId: string,
  title: string,
  dueDate: string,
  sendReminder: boolean,
  note?: string,
): Promise<Deadline> {
  try {
    const headers = await getAuthHeaders()
    const restOperation = put({
      apiName: API_NAME,
      path: `/deadlines/${deadlineId}`,
      options: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: { title, dueDate, sendReminder, ...(note !== undefined ? { note } : {}) } as any,
        headers: { 'Content-Type': 'application/json', ...headers },
      },
    })
    const response = await restOperation.response
    const json = await response.body.json() as Record<string, unknown>
    return json.deadline as Deadline
  } catch (error) {
    console.error('[API] Error in updateDeadline:', error)
    throw error
  }
}

export async function deleteDeadline(deadlineId: string): Promise<void> {
  try {
    const headers = await getAuthHeaders()
    console.log('[API] Calling deleteDeadline:', { deadlineId })
    const restOperation = del({
      apiName: API_NAME,
      path: `/deadlines/${deadlineId}`,
      options: { headers },
    })
    await restOperation.response
  } catch (error) {
    console.error('[API] Error in deleteDeadline:', error)
    throw error
  }
}

// ─── Admin: Test Email ──────────────────────────────────────────────────────

export async function sendTestEmail(to: string): Promise<{ success: boolean; sentTo: string }> {
  const headers = await getAuthHeaders()

  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/admin/test-email'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/test-email`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ to }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${body}`)
  }

  return res.json()
}

export async function sendWelcomeEmail(data: {
  preferredName?: string
  destinationUniversity?: string
  destinationCity?: string
  destinationCountry?: string
}): Promise<void> {
  const headers = await getAuthHeaders()

  const restOperation = post({
    apiName: API_NAME,
    path: '/user/me/welcome-email',
    options: {
      body: data as any,
      headers: { 'Content-Type': 'application/json', ...headers },
    },
  })

  await restOperation.response
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

// ─── Admin: Feedback ────────────────────────────────────────────────────────

export interface FeedbackItem {
  feedbackId: string
  userId: string
  message: string
  page: string
  createdAt: string
  timestamp: number
}

export async function fetchAdminFeedback(): Promise<FeedbackItem[]> {
  const headers = await getAuthHeaders()

  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/admin/feedback'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/feedback`
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

  const json = await res.json() as { feedback: FeedbackItem[] }
  return json.feedback ?? []
}

// ─── Admin: WhatsApp Messages ─────────────────────────────────────────────────

export interface WhatsAppMessage {
  groupId: string       // WhatsApp group JID (e.g. "120363XXXX@g.us")
  messageId: string     // Unique message ID
  groupName: string     // Human-readable group name (set by poller)
  sender: string        // Sender JID
  senderName: string    // Sender display name
  body: string          // Message text
  timestamp: number     // Unix timestamp (seconds)
  fetchedAt: string     // ISO string of when we stored this
}

export interface WhatsAppMessagesResponse {
  messages: WhatsAppMessage[]
  total: number
  groupCounts: Record<string, number>
  fetchedAt: string
}

/**
 * Fetch WhatsApp messages from the admin API.
 * Optionally filter by groupId.
 */
export async function fetchAdminWhatsappMessages(groupId?: string): Promise<WhatsAppMessagesResponse> {
  const headers = await getAuthHeaders()

  const params = new URLSearchParams({ limit: '200' })
  if (groupId) params.set('groupId', groupId)

  let url: string
  if (import.meta.env.DEV) {
    url = `/api-proxy/admin/whatsapp-messages?${params}`
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/whatsapp-messages?${params}`
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }

  return res.json() as Promise<WhatsAppMessagesResponse>
}
// ─── Buddy System ─────────────────────────────────────────────────────────────

export interface BuddyMatchProfile {
  displayName: string
  phone?: string
  instagram?: string
  linkedin?: string
  lookingFor?: string   // JSON-stringified string[]
  bio?: string
  nationality?: string
  degreeType?: string
  fieldOfStudy?: string
  programStartMonth?: string
}

/** Fetch the current user's matched buddy's contact profile. */
export async function fetchBuddyMatch(): Promise<BuddyMatchProfile> {
  const headers = await getAuthHeaders()

  const restOperation = get({
    apiName: API_NAME,
    path: '/buddy/match',
    options: { headers },
  })

  const response = await restOperation.response
  const json = await response.body.json()
  return json as unknown as BuddyMatchProfile
}

export interface BuddyPoolUser {
  userId: string
  displayName: string
  nationality?: string
  degreeType?: string
  fieldOfStudy?: string
  programStartMonth?: string
  phone?: string
  instagram?: string
  linkedin?: string
  lookingFor?: string
  bio?: string
  buddyStatus: string
  buddyMatchedWithId?: string
  updatedAt?: string
}

// ─── Admin: All Users ─────────────────────────────────────────────────────────

export interface AdminUserRecord {
  userId: string
  email?: string | null
  updatedAt?: string
  // personal
  preferredName?: string
  nationality?: string
  residenceCountry?: string
  // destination
  destinationCountry?: string
  destinationCity?: string
  destinationUniversity?: string
  // program
  degreeType?: string
  fieldOfStudy?: string
  programStartMonth?: string
  // admission
  admissionStatus?: string
  programApplied?: string
  programAccepted?: string
  // visa
  isEuCitizen?: string
  hasVisa?: string
  visaType?: string
  hasCodiceFiscale?: string
  hasResidencePermit?: string
  // housing
  hasHousing?: string
  housingPreference?: string
  housingBudget?: string
  housingSupportNeeded?: string
  moveInWindow?: string
  // banking
  needsBankAccount?: string
  hasBankAccount?: string
  // insurance
  hasTravelInsurance?: string
  hasHealthInsurance?: string
  // budget
  monthlyBudgetRange?: string
  fundingSource?: string
  // buddy
  buddyOptIn?: string
  buddyStatus?: string
  buddyLookingFor?: string
  // misc
  lastCompletedStep?: number
  flightBooked?: string
  departureDate?: string
}

export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  const headers = await getAuthHeaders()

  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/admin/users'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/users`
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }

  const json = await res.json() as { users: AdminUserRecord[] }
  return json.users ?? []
}

/** Admin: fetch all users who opted into the buddy system. */
export async function fetchAdminBuddyPool(): Promise<BuddyPoolUser[]> {
  const headers = await getAuthHeaders()

  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/admin/buddy-pool'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/buddy-pool`
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }

  const json = await res.json() as { users: BuddyPoolUser[] }
  return json.users ?? []
}

/** Admin: manually match two users by their userIds. */
export async function adminBuddyMatch(userAId: string, userBId: string): Promise<void> {
  const headers = await getAuthHeaders()

  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/admin/buddy-match'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/buddy-match`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ userAId, userBId }),
  })

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export interface EmailTemplate {
  templateKey: string
  description: string
  subject: string
  htmlBody: string
  isDefault: boolean
  updatedAt?: string
}

/** Admin: fetch all email templates (with current values from DynamoDB or built-in defaults). */
export async function fetchAdminEmailTemplates(): Promise<EmailTemplate[]> {
  const headers = await getAuthHeaders()

  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/admin/email-templates'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/email-templates`
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }

  const json = await res.json() as { templates: EmailTemplate[] }
  return json.templates ?? []
}

/** Admin: save / update an email template. */
export async function updateAdminEmailTemplate(
  key: string,
  data: { subject: string; htmlBody: string }
): Promise<{ updatedAt: string }> {
  const headers = await getAuthHeaders()

  let url: string
  if (import.meta.env.DEV) {
    url = `/api-proxy/admin/email-templates/${key}`
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/admin/email-templates/${key}`
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ': ' + body : ''}`)
  }

  return res.json()
}



export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StoredChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string  // ISO string
}

/**
 * Load the persisted chat history for the current user.
 */
export async function fetchChatHistory(): Promise<StoredChatMessage[]> {
  const headers = await getAuthHeaders()

  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/chat'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/chat`
  }

  const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...headers } })
  if (!res.ok) return []
  const data = await res.json() as { messages: StoredChatMessage[] }
  return data.messages ?? []
}

/**
 * Send the conversation history to the /chat Lambda endpoint which calls
 * Google Gemini and returns a personalised reply.
 */
export async function postChat(messages: ChatMessage[], userTimestamp?: string): Promise<string> {
  const headers = await getAuthHeaders()

  // Use the raw-fetch pattern so it works in both dev (via vite proxy) and prod
  let url: string
  if (import.meta.env.DEV) {
    url = '/api-proxy/chat'
  } else {
    const outputs = await fetch('/amplify_outputs.json').then((r) => r.json()) as any
    const endpoint: string = (outputs?.custom?.API?.endpoint ?? '').replace(/\/+$/, '')
    url = `${endpoint}/chat`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ messages, userTimestamp }),
  })

  if (!res.ok) {
    let errBody = ''
    try { errBody = await res.text() } catch {}
    throw new Error(`Chat API error ${res.status}${errBody ? ': ' + errBody : ''}`)
  }

  const data = await res.json() as { reply: string }
  return data.reply
}