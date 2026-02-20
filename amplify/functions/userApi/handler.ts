import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb'
import { v4 as uuidv4 } from 'uuid'

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  // Personal information
  preferredName?: string
  nationality?: string
  residenceCountry?: string
  // Destination
  destinationCountry?: string
  destinationCity?: string
  destinationUniversity?: string
  destinationUnknownCountry?: boolean
  destinationUnknownCity?: boolean
  destinationUnknownUniversity?: boolean
  // Program details
  degreeType?: string
  fieldOfStudy?: string
  fieldOfStudyUnknown?: boolean
  programStartMonth?: string
  programStartMonthUnknown?: boolean
  // Application status
  programApplied?: string
  programAccepted?: string
  admissionStatus?: string
  deadlinesKnown?: string
  // Test scores
  hasGmatOrEntranceTest?: string
  gmatScore?: string
  hasEnglishTest?: string
  englishTestType?: string
  englishTestScore?: string
  hasRecommendationLetters?: string
  hasCv?: string
  // Visa and travel
  isEuCitizen?: string
  hasVisa?: string
  visaType?: string
  passportExpiry?: string
  visaAppointmentNeeded?: string
  // Immigration
  hasCodiceFiscale?: string
  hasResidencePermit?: string
  // Housing
  hasHousing?: string
  housingPreference?: string
  housingBudget?: string
  moveInWindow?: string
  housingSupportNeeded?: string
  // Banking and phone
  needsBankAccount?: string
  hasBankAccount?: string
  needsPhoneNumber?: string
  hasPhoneNumber?: string
  // Insurance and health
  hasTravelInsurance?: string
  hasHealthInsurance?: string
  // Budget and finance
  monthlyBudgetRange?: string
  scholarshipNeed?: string
  fundingSource?: string
  lastCompletedStep?: number
  checklistItems?: Record<number, Record<string, boolean>>
  // Cost breakdown
  housingType?: string
  rentCost?: number
  utilitiesCost?: number
  internetCost?: number
  mobileCost?: number
  transportCost?: number
  groceriesCost?: number
  diningOutCost?: number
  entertainmentCost?: number
  clothingCost?: number
  personalCareCost?: number
  booksCost?: number
}

interface StepProgress {
  stepKey: string
  completed: boolean
  completedAt?: string
  started?: boolean
  startedAt?: string
}

interface Deadline {
  deadlineId: string
  userId: string
  title: string
  dueDate: string
  sendReminder: boolean
  note?: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

// ─── Clients & Config ────────────────────────────────────────────────────────

const dynamo = new DynamoDBClient({})
const ses = new SESClient({})

const TABLE = {
  profiles: process.env.USER_PROFILE_TABLE_NAME!,
  progress: process.env.USER_PROGRESS_TABLE_NAME!,
  feedback: process.env.FEEDBACK_TABLE_NAME!,
  deadlines: process.env.DEADLINES_TABLE_NAME!,
  // Reddit posts fetched by the redditPoller Lambda (leavs-{env}-reddit-posts)
  redditPosts: process.env.REDDIT_POSTS_TABLE_NAME!,
} as const

const FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL || 'tijn@eendenburg.eu'

// ─── Response Helpers ────────────────────────────────────────────────────────

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function ok(body: unknown, statusCode = 200): ApiResponse {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) }
}

function fail(statusCode: number, message: string): ApiResponse {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify({ error: message }) }
}

function parseBody(event: any): Record<string, any> {
  const raw = event.body
  if (!raw) return {}
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

/** Extract userId from Cognito authorizer (supports REST API v1 + HTTP API v2). */
function extractUserId(event: any): string | null {
  const auth = event.requestContext?.authorizer || event.authorizer
  return auth?.sub || auth?.claims?.sub || null
}

/** Extract HTTP method and path from the API Gateway event. */
function extractRoute(event: any): { method: string; path: string } {
  const isV2 = !!event.requestContext?.http
  return {
    method: isV2
      ? event.requestContext.http.method
      : event.requestContext?.httpMethod || event.httpMethod || 'UNKNOWN',
    path: isV2
      ? event.requestContext.http.path
      : event.requestContext?.resourcePath || event.path || event.rawPath || 'UNKNOWN',
  }
}

// ─── Data Access ─────────────────────────────────────────────────────────────

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { Item } = await dynamo.send(
    new GetItemCommand({ TableName: TABLE.profiles, Key: marshall({ userId }) })
  )
  if (!Item) return null

  // Strip system fields before returning
  const { userId: _, updatedAt: __, ...profile } = unmarshall(Item)
  return profile as UserProfile
}

async function saveUserProfile(userId: string, updates: UserProfile): Promise<void> {
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    throw new Error('Profile updates must be a non-array object')
  }

  // Merge with existing profile so partial updates don't erase other fields
  const existing = await getUserProfile(userId)
  const merged = { ...existing, ...updates }

  // Remove empty-string / null / undefined values (keep false and 0)
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value
    }
  }

  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE.profiles,
      Item: marshall({ userId, ...cleaned, updatedAt: new Date().toISOString() }),
    })
  )
}

async function getUserProgress(userId: string): Promise<StepProgress[]> {
  const { Items } = await dynamo.send(
    new QueryCommand({
      TableName: TABLE.progress,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: marshall({ ':uid': userId }),
    })
  )
  return (Items ?? []).map((item) => unmarshall(item) as StepProgress)
}

async function saveStepProgress(
  userId: string,
  stepKey: string,
  completed: boolean,
): Promise<void> {
  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE.progress,
      Item: marshall({
        userId,
        stepKey,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      }),
    })
  )
}

async function markStepStarted(
  userId: string,
  stepKey: string,
): Promise<void> {
  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE.progress,
      Item: marshall({
        userId,
        stepKey,
        started: true,
        startedAt: new Date().toISOString(),
        completed: false,
        updatedAt: new Date().toISOString(),
      }),
    })
  )
}

async function saveFeedback(userId: string, message: string): Promise<void> {
  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE.feedback,
      Item: marshall({
        feedbackId: uuidv4(),
        userId,
        message,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      }),
    })
  )
}

async function sendFeedbackEmail(userId: string, message: string): Promise<void> {
  try {
    await ses.send(
      new SendEmailCommand({
        Source: FEEDBACK_EMAIL,
        Destination: { ToAddresses: [FEEDBACK_EMAIL] },
        Message: {
          Subject: { Data: `[Leavs Feedback] New feedback from ${userId}` },
          Body: { Text: { Data: `User ID: ${userId}\n\nMessage:\n${message}` } },
        },
      })
    )
  } catch (error) {
    // Log but don't throw - feedback is already persisted in DynamoDB
    console.error('Failed to send feedback email (SES):', error)
  }
}

async function getUserDeadlines(userId: string): Promise<Deadline[]> {
  const { Items } = await dynamo.send(
    new QueryCommand({
      TableName: TABLE.deadlines,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: marshall({ ':uid': userId }),
    })
  )
  return (Items ?? []).map((item) => unmarshall(item) as Deadline)
}

async function createDeadline(
  userId: string,
  title: string,
  dueDate: string,
  sendReminder: boolean,
  note?: string,
): Promise<Deadline> {
  const now = new Date().toISOString()
  const deadline: Deadline = {
    deadlineId: uuidv4(),
    userId,
    title,
    dueDate,
    sendReminder,
    note: note || undefined,
    createdAt: now,
    updatedAt: now,
  }
  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE.deadlines,
      Item: marshall(deadline, { removeUndefinedValues: true }),
    })
  )
  return deadline
}

// ─── Admin helpers ───────────────────────────────────────────────────────────

/** Scan a full table and return all unmarshalled items (handles pagination). */
async function scanAll(tableName: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = []
  let lastKey: Record<string, any> | undefined
  do {
    const result = await dynamo.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastKey,
      })
    )
    for (const item of result.Items ?? []) {
      items.push(unmarshall(item))
    }
    lastKey = result.LastEvaluatedKey
  } while (lastKey)
  return items
}

async function handleGetAdminStats(event: any): Promise<ApiResponse> {
  // Admin credential check: require ?secret=<ADMIN_SECRET> header as a second
  // layer of defence on top of Cognito (simple shared secret approach).
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  if (adminSecret && providedSecret !== adminSecret) {
    return fail(403, 'Forbidden')
  }

  const [profiles, progressItems, feedbackItems] = await Promise.all([
    scanAll(TABLE.profiles),
    scanAll(TABLE.progress),
    scanAll(TABLE.feedback),
  ])

  const totalUsers = profiles.length

  // Signups over time — group by calendar day using createdAt or updatedAt
  const signupsByDay: Record<string, number> = {}
  for (const p of profiles) {
    const raw = (p.createdAt as string | undefined) || (p.updatedAt as string | undefined)
    if (!raw) continue
    const day = raw.slice(0, 10) // "YYYY-MM-DD"
    signupsByDay[day] = (signupsByDay[day] ?? 0) + 1
  }
  const signupTimeline = Object.entries(signupsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  // Step completion breakdown
  const stepCounts: Record<string, number> = {}
  for (const row of progressItems) {
    if (row.completed) {
      const key = row.stepKey as string
      stepCounts[key] = (stepCounts[key] ?? 0) + 1
    }
  }
  const stepBreakdown = Object.entries(stepCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([step, completions]) => ({ step, completions }))

  // Active users = users who have at least one progress record
  const activeUserIds = new Set(progressItems.map((r) => r.userId as string))
  const activeUsers = activeUserIds.size

  // Destination breakdown
  const destinationCounts: Record<string, number> = {}
  for (const p of profiles) {
    const city = (p.destinationCity as string | undefined) || 'Unknown'
    destinationCounts[city] = (destinationCounts[city] ?? 0) + 1
  }
  const topDestinations = Object.entries(destinationCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }))

  // Nationality breakdown
  const nationalityCounts: Record<string, number> = {}
  for (const p of profiles) {
    const nat = (p.nationality as string | undefined) || 'Unknown'
    nationalityCounts[nat] = (nationalityCounts[nat] ?? 0) + 1
  }
  const topNationalities = Object.entries(nationalityCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([nationality, count]) => ({ nationality, count }))

  // Feedback count
  const totalFeedback = feedbackItems.length

  // Average steps completed per user
  const completedPerUser: Record<string, number> = {}
  for (const row of progressItems) {
    if (row.completed) {
      const uid = row.userId as string
      completedPerUser[uid] = (completedPerUser[uid] ?? 0) + 1
    }
  }
  const completionValues = Object.values(completedPerUser)
  const avgStepsCompleted =
    completionValues.length > 0
      ? Math.round(
          (completionValues.reduce((s, v) => s + v, 0) / completionValues.length) * 10
        ) / 10
      : 0

  return ok({
    overview: {
      totalUsers,
      activeUsers,
      totalFeedback,
      avgStepsCompleted,
    },
    signupTimeline,
    stepBreakdown,
    topDestinations,
    topNationalities,
    generatedAt: new Date().toISOString(),
  })
}
// ─── Admin: Reddit Posts ───────────────────────────────────────────────────────

/**
 * GET /admin/reddit-posts
 * Returns Reddit posts stored by redditPoller, optionally filtered by subreddit.
 *
 * Query params:
 *   subreddit  — filter to one subreddit (e.g. "bocconi"). Omit for all posts.
 *   limit      — max posts to return (default 100, max 500)
 */
async function handleGetAdminRedditPosts(event: any): Promise<ApiResponse> {
  const subredditFilter: string | undefined = event.queryStringParameters?.subreddit
  const limit = Math.min(parseInt(event.queryStringParameters?.limit ?? '100', 10), 500)

  let items: Record<string, unknown>[] = []

  if (subredditFilter) {
    // Query by specific subreddit (uses the table's partition key — very efficient)
    const { Items } = await dynamo.send(
      new QueryCommand({
        TableName: TABLE.redditPosts,
        KeyConditionExpression: 'subreddit = :sub',
        ExpressionAttributeValues: marshall({ ':sub': subredditFilter }),
        ScanIndexForward: false, // newest first
        Limit: limit,
      })
    )
    items = (Items ?? []).map((i) => unmarshall(i))
  } else {
    // No filter — scan the full table (acceptable for admin use at this scale)
    let lastKey: Record<string, any> | undefined
    do {
      const result = await dynamo.send(
        new ScanCommand({
          TableName: TABLE.redditPosts,
          ExclusiveStartKey: lastKey,
          Limit: limit,
        })
      )
      for (const item of result.Items ?? []) {
        items.push(unmarshall(item))
      }
      lastKey = result.LastEvaluatedKey
    } while (lastKey && items.length < limit)
  }

  // Sort by createdUtc descending (newest first) before returning
  items.sort((a, b) => ((b.createdUtc as number) ?? 0) - ((a.createdUtc as number) ?? 0))

  // Compute per-subreddit counts for the summary header
  const subredditCounts: Record<string, number> = {}
  for (const item of items) {
    const sub = (item.subreddit as string) ?? 'unknown'
    subredditCounts[sub] = (subredditCounts[sub] ?? 0) + 1
  }

  return ok({
    posts: items,
    total: items.length,
    subredditCounts,
    fetchedAt: new Date().toISOString(),
  })
}
// ─── Route Handlers ──────────────────────────────────────────────────────────

async function handleGetUser(userId: string): Promise<ApiResponse> {
  const [profile, progress] = await Promise.all([
    getUserProfile(userId),
    getUserProgress(userId),
  ])
  return ok({ profile: profile ?? {}, progress: progress ?? [] })
}

async function handlePutUser(userId: string, event: any): Promise<ApiResponse> {
  const body = parseBody(event)
  await saveUserProfile(userId, body as UserProfile)
  return ok({ message: 'Profile saved' })
}

async function handlePutProgress(userId: string, event: any): Promise<ApiResponse> {
  const { stepKey, completed } = parseBody(event)
  if (!stepKey) return fail(400, 'stepKey is required')
  await saveStepProgress(userId, stepKey, completed)
  return ok({ message: 'Progress saved' })
}

async function handlePutProgressStart(userId: string, event: any): Promise<ApiResponse> {
  const { stepKey } = parseBody(event)
  if (!stepKey) return fail(400, 'stepKey is required')
  await markStepStarted(userId, stepKey)
  return ok({ message: 'Step started', stepKey, started: true })
}

async function handleGetDeadlines(userId: string): Promise<ApiResponse> {
  const deadlines = await getUserDeadlines(userId)
  return ok({ deadlines })
}

async function handlePostDeadline(userId: string, event: any): Promise<ApiResponse> {
  const { title, dueDate, sendReminder, note } = parseBody(event)

  if (!title || typeof title !== 'string' || !title.trim()) {
    return fail(400, 'Title is required and must be a non-empty string')
  }
  if (!dueDate || typeof dueDate !== 'string') {
    return fail(400, 'Due date is required and must be a valid date string')
  }
  const dueDateObj = new Date(dueDate)
  if (isNaN(dueDateObj.getTime())) return fail(400, 'Invalid date format')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dueDateObj < today) return fail(400, 'Due date cannot be in the past')

  if (typeof sendReminder !== 'boolean') {
    return fail(400, 'sendReminder must be a boolean')
  }

  const deadline = await createDeadline(userId, title.trim(), dueDate, sendReminder, note?.trim())
  return ok({ deadline }, 201)
}

async function handlePostFeedback(event: any): Promise<ApiResponse> {
  const { message } = parseBody(event)

  if (!message || typeof message !== 'string' || !message.trim()) {
    return fail(400, 'Message is required and must be a non-empty string')
  }

  const guestId = `guest-${Date.now()}`
  const trimmed = message.trim()

  await Promise.all([saveFeedback(guestId, trimmed), sendFeedbackEmail(guestId, trimmed)])
  return ok({ message: 'Feedback received' })
}

// ─── Router ──────────────────────────────────────────────────────────────────

export async function handler(event: any): Promise<ApiResponse> {
  const { method, path } = extractRoute(event)
  console.log(`[Handler] Received request: ${method} ${path}`)

  // CORS preflight
  if (method === 'OPTIONS') return ok({ message: 'OK' })

  // Public route (no auth required)
  if (method === 'POST' && path === '/feedback') {
    try {
      return await handlePostFeedback(event)
    } catch (err) {
      console.error('POST /feedback error:', err)
      return fail(500, 'Failed to process feedback')
    }
  }

  // Authenticated routes
  const userId = extractUserId(event)
  if (!userId) return fail(401, 'Unauthorized')

  try {
    if (method === 'GET'  && path === '/user/me')   return await handleGetUser(userId)
    if (method === 'PUT'  && path === '/user/me')   return await handlePutUser(userId, event)
    if (method === 'PUT'  && path === '/progress')   return await handlePutProgress(userId, event)
    if (method === 'PUT'  && path === '/progress/start')   return await handlePutProgressStart(userId, event)
    if (method === 'GET'  && path === '/deadlines')  return await handleGetDeadlines(userId)
    if (method === 'POST' && path === '/deadlines')  return await handlePostDeadline(userId, event)
    if (method === 'GET'  && path === '/admin/stats') return await handleGetAdminStats(event)
    if (method === 'GET'  && path === '/admin/reddit-posts') return await handleGetAdminRedditPosts(event)

    console.error(`[Handler] No route matched for ${method} ${path}`)
    return fail(404, 'Not found')
  } catch (error) {
    console.error(`${method} ${path} error:`, error)
    return fail(500, 'Internal server error')
  }
}
