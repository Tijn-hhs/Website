import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb'
import { v4 as uuidv4 } from 'uuid'

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  firstName?: string
  lastName?: string
  nationality?: string
  dateOfBirth?: string
  destinationCountry?: string
  destinationCity?: string
  universityName?: string
  programName?: string
  studyLevel?: string
  startDate?: string
  admissionStatus?: string
  visaType?: string
  passportExpiry?: string
  visaAppointmentDate?: string
  travelDate?: string
  flightsBooked?: boolean
  packingNotes?: string
  registrationStatus?: string
  residencePermitNeeded?: boolean
  accommodationType?: string
  housingBudget?: string
  leaseStart?: string
  bankAccountNeeded?: boolean
  insuranceProvider?: string
  legalDocsReady?: boolean
  healthCoverage?: string
  doctorPreference?: string
  arrivalDate?: string
  localTransport?: string
  dailyLifeNotes?: string
  monthlyBudget?: string
  budgetCurrency?: string
  budgetingNotes?: string
  communityInterest?: string
  supportNeeds?: string
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
    if (method === 'GET'  && path === '/deadlines')  return await handleGetDeadlines(userId)
    if (method === 'POST' && path === '/deadlines')  return await handlePostDeadline(userId, event)

    return fail(404, 'Not found')
  } catch (error) {
    console.error(`${method} ${path} error:`, error)
    return fail(500, 'Internal server error')
  }
}
