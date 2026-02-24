import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
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
  // Buddy system
  buddyOptIn?: string
  buddyDisplayName?: string
  buddyPhone?: string
  buddyInstagram?: string
  buddyLinkedIn?: string
  buddyLookingFor?: string
  buddyBio?: string
  buddyStatus?: string
  buddyMatchedWithId?: string
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
  templateKey?: string
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
const ses = new SESClient({ region: 'eu-west-1' }) // SES identity (weleav.com) is verified in eu-west-1
const secretsClient = new SecretsManagerClient({})

// Cache the Gemini API key across warm Lambda invocations
let cachedGeminiApiKey: string | null = null

const TABLE = {
  profiles: process.env.USER_PROFILE_TABLE_NAME!,
  progress: process.env.USER_PROGRESS_TABLE_NAME!,
  feedback: process.env.FEEDBACK_TABLE_NAME!,
  deadlines: process.env.DEADLINES_TABLE_NAME!,
  // Reddit posts fetched by the redditPoller Lambda (leavs-{env}-reddit-posts)
  whatsappMessages: process.env.WHATSAPP_MESSAGES_TABLE_NAME!,
  chatMessages: process.env.CHAT_MESSAGES_TABLE_NAME!,
  emailTemplates: process.env.EMAIL_TEMPLATES_TABLE_NAME || '',
} as const

const SENDER_EMAIL = 'hallo@weleav.com'
const FEEDBACK_RECIPIENT = process.env.FEEDBACK_EMAIL || 'hallo@weleav.com'

// ─── Email Template Defaults ─────────────────────────────────────────────────────
// These are the out-of-the-box templates. Admins can override any key via the
// email template editor in /internal/mgmt. The saved version is stored in
// DynamoDB and loaded at send time; if never saved the default below is used.

const DEFAULT_EMAIL_TEMPLATES: Record<string, { subject: string; htmlBody: string; description: string }> = {
  welcome: {
    description: 'Sent when a user completes onboarding',
    subject: 'Welcome to Leavs, {{preferredName}}! 🎉',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Leavs</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Leavs</h1>
              <p style="margin:8px 0 0;color:#aaaaaa;font-size:14px;">Your study abroad companion</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;font-weight:600;">Welcome, {{preferredName}}! 🎉</h2>
              <p style="margin:0 0 24px;color:#444444;font-size:16px;line-height:1.6;">
                You've completed your onboarding \u2014 you're all set to make the most of your move to
                <strong>{{universityLine}}</strong>{{locationSuffix}}.
              </p>
              <p style="margin:0 0 24px;color:#444444;font-size:16px;line-height:1.6;">
                Your personalised dashboard is ready. Track your deadlines, explore your checklist, and find everything you need for a smooth relocation \u2014 all in one place.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background-color:#1a1a1a;border-radius:8px;padding:14px 28px;">
                    <a href="https://www.weleav.com/dashboard"
                       style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
                      Go to your dashboard \u2192
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#888888;font-size:14px;line-height:1.6;">
                If you have any questions or feedback, simply reply to this email \u2014 we'd love to hear from you.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;border-top:1px solid #eeeeee;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#aaaaaa;font-size:12px;">
                \u00A9 {{year}} Leavs \u00B7 <a href="https://www.weleav.com" style="color:#aaaaaa;text-decoration:underline;">weleav.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
}

/** Substitute {{variable}} placeholders in an email template string. */
function substituteVars(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.split(`{{${k}}}`).join(v),
    template
  )
}

/**
 * Load an email template from DynamoDB.
 * Falls back gracefully to the built-in default when the table is not yet
 * provisioned or the key has never been saved via the admin editor.
 */
async function getEmailTemplate(key: string): Promise<{
  subject: string
  htmlBody: string
  description: string
  isDefault: boolean
  updatedAt?: string
}> {
  const defaults = DEFAULT_EMAIL_TEMPLATES[key]
  const fallback = { ...(defaults ?? { subject: '', htmlBody: '', description: '' }), isDefault: true }
  const tableName = TABLE.emailTemplates
  if (!tableName) return fallback

  try {
    const { Item } = await dynamo.send(
      new GetItemCommand({ TableName: tableName, Key: marshall({ templateKey: key }) })
    )
    if (!Item) return fallback
    const item = unmarshall(Item)
    return {
      subject: item.subject || fallback.subject,
      htmlBody: item.htmlBody || fallback.htmlBody,
      description: item.description || fallback.description,
      isDefault: false,
      updatedAt: item.updatedAt,
    }
  } catch {
    return fallback
  }
}

// ─── Response Helpers ────────────────────────────────────────────────────────

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
      : event.path || event.rawPath || event.requestContext?.resourcePath || 'UNKNOWN',
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
  const now = new Date().toISOString()
  await dynamo.send(
    new UpdateItemCommand({
      TableName: TABLE.progress,
      Key: marshall({ userId, stepKey }),
      // Preserve started/startedAt; only update completed-related fields
      UpdateExpression:
        'SET completed = :completed, completedAt = :completedAt, updatedAt = :now',
      ExpressionAttributeValues: marshall({
        ':completed': completed,
        ':completedAt': completed ? now : null,
        ':now': now,
      }),
    })
  )
}

async function markStepStarted(
  userId: string,
  stepKey: string,
): Promise<void> {
  const now = new Date().toISOString()
  await dynamo.send(
    new UpdateItemCommand({
      TableName: TABLE.progress,
      Key: marshall({ userId, stepKey }),
      // Only set started/startedAt; never touch the completed field
      UpdateExpression:
        'SET #started = :started, startedAt = if_not_exists(startedAt, :now), updatedAt = :now',
      ConditionExpression: undefined,
      ExpressionAttributeNames: {
        '#started': 'started',
      },
      ExpressionAttributeValues: marshall({
        ':started': true,
        ':now': now,
      }),
    })
  )
}

async function saveFeedback(userId: string, message: string, page: string): Promise<void> {
  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE.feedback,
      Item: marshall({
        feedbackId: uuidv4(),
        userId,
        message,
        page,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      }),
    })
  )
}

async function sendFeedbackEmail(userId: string, message: string, page: string): Promise<void> {
  try {
    await ses.send(
      new SendEmailCommand({
        Source: SENDER_EMAIL,
        Destination: { ToAddresses: [FEEDBACK_RECIPIENT] },
        Message: {
          Subject: { Data: `[Leavs Feedback] New feedback from ${userId}` },
          Body: { Text: { Data: `User ID: ${userId}\nPage: ${page}\n\nMessage:\n${message}` } },
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

async function updateDeadlineInDb(
  userId: string,
  deadlineId: string,
  updates: { title: string; dueDate: string; sendReminder: boolean; note?: string },
): Promise<Deadline> {
  const { Item } = await dynamo.send(
    new GetItemCommand({ TableName: TABLE.deadlines, Key: marshall({ userId, deadlineId }) })
  )
  if (!Item) throw new Error('Deadline not found')
  const existing = unmarshall(Item) as Deadline
  const updated: Deadline = {
    ...existing,
    title: updates.title,
    dueDate: updates.dueDate,
    sendReminder: updates.sendReminder,
    note: updates.note,
    updatedAt: new Date().toISOString(),
  }
  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE.deadlines,
      Item: marshall(updated, { removeUndefinedValues: true }),
    })
  )
  return updated
}

async function deleteDeadlineFromDb(userId: string, deadlineId: string): Promise<void> {
  await dynamo.send(
    new DeleteItemCommand({
      TableName: TABLE.deadlines,
      Key: marshall({ userId, deadlineId }),
    })
  )
}

async function createDeadline(
  userId: string,
  title: string,
  dueDate: string,
  sendReminder: boolean,
  note?: string,
  templateKey?: string,
): Promise<Deadline> {
  const now = new Date().toISOString()
  const deadline: Deadline = {
    deadlineId: uuidv4(),
    userId,
    title,
    dueDate,
    sendReminder,
    note: note || undefined,
    templateKey: templateKey || undefined,
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

async function saveChatMessage(
  userId: string,
  role: string,
  content: string,
  timestamp: string,
): Promise<void> {
  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE.chatMessages,
      Item: marshall({
        messageId: `${timestamp}#${uuidv4()}`,
        userId,
        role,
        content,
        timestamp,
        createdAt: new Date().toISOString(),
      }),
    })
  )
}

async function handleGetChat(userId: string): Promise<ApiResponse> {
  const { Items } = await dynamo.send(
    new QueryCommand({
      TableName: TABLE.chatMessages,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: marshall({ ':uid': userId }),
      ScanIndexForward: true,
    })
  )
  const messages = (Items ?? []).map((item) => {
    const m = unmarshall(item)
    return {
      role: m.role as string,
      content: m.content as string,
      timestamp: m.timestamp as string,
    }
  })
  return ok({ messages })
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
// ─── Admin: WhatsApp Messages ─────────────────────────────────────────────────

/**
 * GET /admin/whatsapp-messages
 * Returns WhatsApp messages stored by the local poller script, optionally filtered by group.
 * Query params:
 *   groupId — filter to one group JID. Omit for all groups.
 *   limit   — max messages to return (default 200, max 1000)
 */
async function handleGetAdminWhatsappMessages(event: any): Promise<ApiResponse> {
  const groupFilter: string | undefined = event.queryStringParameters?.groupId
  const limit = Math.min(parseInt(event.queryStringParameters?.limit ?? '200', 10), 1000)

  let items: Record<string, unknown>[] = []

  if (groupFilter) {
    const { Items } = await dynamo.send(
      new QueryCommand({
        TableName: TABLE.whatsappMessages,
        KeyConditionExpression: 'groupId = :gid',
        ExpressionAttributeValues: marshall({ ':gid': groupFilter }),
        ScanIndexForward: false,
        Limit: limit,
      })
    )
    items = (Items ?? []).map((i) => unmarshall(i))
  } else {
    let lastKey: Record<string, any> | undefined
    do {
      const result = await dynamo.send(
        new ScanCommand({
          TableName: TABLE.whatsappMessages,
          ExclusiveStartKey: lastKey,
          Limit: limit,
        })
      )
      for (const item of result.Items ?? []) items.push(unmarshall(item))
      lastKey = result.LastEvaluatedKey
    } while (lastKey && items.length < limit)
  }

  items.sort((a, b) => ((b.timestamp as number) ?? 0) - ((a.timestamp as number) ?? 0))

  const groupCounts: Record<string, number> = {}
  for (const item of items) {
    const gname = (item.groupName as string) ?? (item.groupId as string) ?? 'unknown'
    groupCounts[gname] = (groupCounts[gname] ?? 0) + 1
  }

  return ok({ messages: items, total: items.length, groupCounts, fetchedAt: new Date().toISOString() })
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
  const { title, dueDate, sendReminder, note, templateKey } = parseBody(event)

  if (!title || typeof title !== 'string' || !title.trim()) {
    return fail(400, 'Title is required and must be a non-empty string')
  }
  if (!dueDate || typeof dueDate !== 'string') {
    return fail(400, 'Due date is required and must be a valid date string')
  }
  const dueDateObj = new Date(dueDate)
  if (isNaN(dueDateObj.getTime())) return fail(400, 'Invalid date format')

  if (typeof sendReminder !== 'boolean') {
    return fail(400, 'sendReminder must be a boolean')
  }

  const deadline = await createDeadline(
    userId,
    title.trim(),
    dueDate,
    sendReminder,
    note?.trim(),
    typeof templateKey === 'string' ? templateKey : undefined,
  )
  return ok({ deadline }, 201)
}

async function handlePutDeadline(userId: string, deadlineId: string, event: any): Promise<ApiResponse> {
  const { title, dueDate, sendReminder, note } = parseBody(event)
  if (!title || typeof title !== 'string' || !title.trim()) return fail(400, 'Title is required')
  if (!dueDate || typeof dueDate !== 'string') return fail(400, 'Due date is required')
  if (isNaN(new Date(dueDate).getTime())) return fail(400, 'Invalid date format')
  if (typeof sendReminder !== 'boolean') return fail(400, 'sendReminder must be a boolean')
  const deadline = await updateDeadlineInDb(userId, deadlineId, {
    title: title.trim(),
    dueDate,
    sendReminder,
    note: note?.trim() || undefined,
  })
  return ok({ deadline })
}

async function handleDeleteDeadline(userId: string, deadlineId: string): Promise<ApiResponse> {
  await deleteDeadlineFromDb(userId, deadlineId)
  return ok({ message: 'Deadline deleted' })
}

async function handlePostFeedback(event: any): Promise<ApiResponse> {
  const { message, page } = parseBody(event)

  if (!message || typeof message !== 'string' || !message.trim()) {
    return fail(400, 'Message is required and must be a non-empty string')
  }

  const guestId = `guest-${Date.now()}`
  const trimmed = message.trim()
  const pageStr = typeof page === 'string' && page.trim() ? page.trim() : 'unknown'

  await Promise.all([saveFeedback(guestId, trimmed, pageStr), sendFeedbackEmail(guestId, trimmed, pageStr)])
  return ok({ message: 'Feedback received' })
}

async function handleGetAdminFeedback(event: any): Promise<ApiResponse> {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  if (adminSecret && providedSecret !== adminSecret) {
    return fail(403, 'Forbidden')
  }

  const items = await scanAll(TABLE.feedback)
  // Sort newest-first
  items.sort((a, b) => ((b.timestamp as number) ?? 0) - ((a.timestamp as number) ?? 0))
  return ok({ feedback: items })
}

// ─── Buddy System ───────────────────────────────────────────────────────────

/** Fetch all Cognito users and return a map from sub (userId) → email. */
async function buildCognitoEmailMap(): Promise<Map<string, string>> {
  const userPoolId = process.env.USER_POOL_ID
  if (!userPoolId) return new Map()

  const client = new CognitoIdentityProviderClient({})
  const emailMap = new Map<string, string>()
  let paginationToken: string | undefined

  do {
    const cmd = new ListUsersCommand({
      UserPoolId: userPoolId,
      AttributesToGet: ['email', 'sub'],
      Limit: 60,
      PaginationToken: paginationToken,
    })
    const result = await client.send(cmd)
    for (const user of result.Users ?? []) {
      const sub = user.Attributes?.find((a) => a.Name === 'sub')?.Value
      const email = user.Attributes?.find((a) => a.Name === 'email')?.Value
      if (sub && email) emailMap.set(sub, email)
    }
    paginationToken = result.PaginationToken
  } while (paginationToken)

  return emailMap
}

/** GET /admin/users — return all user profiles for the admin dashboard. */
async function handleGetAdminUsers(event: any): Promise<ApiResponse> {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  if (adminSecret && providedSecret !== adminSecret) {
    return fail(403, 'Forbidden')
  }

  const [profiles, emailMap] = await Promise.all([
    scanAll(TABLE.profiles),
    buildCognitoEmailMap(),
  ])

  // Return all fields but ensure userId and updatedAt are present, and enrich with email
  const users = profiles.map((p) => ({
    userId: p.userId,
    updatedAt: p.updatedAt,
    ...p,
    email: emailMap.get(p.userId as string) ?? null,
  }))
  // Sort newest-first by updatedAt
  users.sort((a, b) => {
    const ta = typeof a.updatedAt === 'string' ? a.updatedAt : ''
    const tb = typeof b.updatedAt === 'string' ? b.updatedAt : ''
    return tb.localeCompare(ta)
  })

  return ok({ users, total: users.length })
}

/** GET /buddy/match — return the matched user's buddy contact profile. */
async function handleGetBuddyMatch(userId: string): Promise<ApiResponse> {
  const profile = await getUserProfile(userId)
  if (!profile) return fail(404, 'Profile not found')
  if (profile.buddyStatus !== 'matched' || !profile.buddyMatchedWithId) {
    return fail(400, 'Not currently matched')
  }

  const matchedUserId = profile.buddyMatchedWithId as string
  const matchProfile = await getUserProfile(matchedUserId)
  if (!matchProfile) return fail(404, 'Match profile not found')

  return ok({
    displayName: matchProfile.buddyDisplayName || matchProfile.preferredName || 'Your Match',
    phone: matchProfile.buddyPhone,
    instagram: matchProfile.buddyInstagram,
    linkedin: matchProfile.buddyLinkedIn,
    lookingFor: matchProfile.buddyLookingFor,
    bio: matchProfile.buddyBio,
    nationality: matchProfile.nationality,
    degreeType: matchProfile.degreeType,
    fieldOfStudy: matchProfile.fieldOfStudy,
    programStartMonth: matchProfile.programStartMonth,
  })
}

/** POST /admin/test-email — send a test email via SES to verify the integration. */
async function handlePostAdminTestEmail(event: any): Promise<ApiResponse> {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  if (adminSecret && providedSecret !== adminSecret) {
    return fail(403, 'Forbidden')
  }

  const body = parseBody(event)
  const to: string = (body.to || 'hallo@weleav.com').toLowerCase()
  const subject = body.subject || 'Leavs SES Test Email'
  const html = body.html || `
    <h2>SES test from Leavs ✅</h2>
    <p>If you received this, sending from <strong>hallo@weleav.com</strong> via AWS SES is working correctly.</p>
    <p>Sent at: ${new Date().toISOString()}</p>
  `

  try {
    await ses.send(
      new SendEmailCommand({
        Source: 'hallo@weleav.com',
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      })
    )
    return ok({ success: true, sentTo: to })
  } catch (err: any) {
    console.error('[test-email] SES error:', err)
    return fail(502, `SES error: ${err?.message ?? String(err)}`)
  }
}

/** POST /user/me/welcome-email — send a welcome email to the newly-onboarded user. */
async function handlePostWelcomeEmail(userId: string, event: any): Promise<ApiResponse> {
  // Extract email from Cognito JWT claims forwarded by API Gateway.
  // Lowercase to normalise casing (e.g. "Tijn@Eendenburg.eu" → "tijn@eendenburg.eu")
  // since SES verified-address checks are case-sensitive in sandbox mode.
  const auth = event.requestContext?.authorizer || event.authorizer || {}
  const userEmail: string = (auth?.claims?.email || auth?.email || '').toLowerCase()
  if (!userEmail) return fail(400, 'Could not determine user email from token')

  const body = parseBody(event)
  const preferredName: string = body.preferredName || 'there'
  const destinationUniversity: string = body.destinationUniversity || ''
  const destinationCity: string = body.destinationCity || ''
  const destinationCountry: string = body.destinationCountry || ''

  const locationLine = [destinationCity, destinationCountry].filter(Boolean).join(', ')
  const universityLine = destinationUniversity || 'your destination'

  // Load template from DynamoDB (falls back to built-in default if never customised)
  const templateData = await getEmailTemplate('welcome')
  const vars: Record<string, string> = {
    preferredName,
    universityLine,
    locationSuffix: locationLine ? ` in ${locationLine}` : '',
    year: String(new Date().getFullYear()),
  }
  const html = substituteVars(templateData.htmlBody, vars)
  const subject = substituteVars(templateData.subject, vars)

  try {
    await ses.send(
      new SendEmailCommand({
        Source: SENDER_EMAIL,
        Destination: { ToAddresses: [userEmail] },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      })
    )
    console.log(`[welcome-email] Sent welcome email to ${userEmail}`)
    return ok({ success: true, sentTo: userEmail })
  } catch (err: any) {
    console.error('[welcome-email] SES error:', err)
    return fail(502, `SES error: ${err?.message ?? String(err)}`)
  }
}

/** GET /admin/email-templates — list all email templates with current values. */
async function handleGetAdminEmailTemplates(event: any): Promise<ApiResponse> {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  const auth = event.requestContext?.authorizer || event.authorizer || {}
  const groups: string[] = (auth?.claims?.['cognito:groups'] || '').split(',').filter(Boolean)
  const isAdmin = groups.includes('admin') || (adminSecret && providedSecret === adminSecret)
  if (!isAdmin) return fail(403, 'Forbidden')

  const templateKeys = Object.keys(DEFAULT_EMAIL_TEMPLATES)
  const templates = await Promise.all(
    templateKeys.map(async (key) => {
      const tpl = await getEmailTemplate(key)
      return { templateKey: key, ...tpl }
    })
  )
  return ok({ templates })
}

/** PUT /admin/email-templates/{key} — save / update a single email template. */
async function handlePutAdminEmailTemplate(event: any, key: string): Promise<ApiResponse> {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  const auth = event.requestContext?.authorizer || event.authorizer || {}
  const groups: string[] = (auth?.claims?.['cognito:groups'] || '').split(',').filter(Boolean)
  const isAdmin = groups.includes('admin') || (adminSecret && providedSecret === adminSecret)
  if (!isAdmin) return fail(403, 'Forbidden')

  if (!DEFAULT_EMAIL_TEMPLATES[key]) return fail(404, `Unknown template key: ${key}`)

  const tableName = TABLE.emailTemplates
  if (!tableName) return fail(503, 'Email templates table not yet provisioned — Amplify deploy may still be in progress')

  const body = parseBody(event)
  const subject = (body.subject || '').trim()
  const htmlBody = (body.htmlBody || '').trim()
  if (!subject || !htmlBody) return fail(400, 'subject and htmlBody are required')

  const updatedAt = new Date().toISOString()
  await dynamo.send(
    new PutItemCommand({
      TableName: tableName,
      Item: marshall({
        templateKey: key,
        subject,
        htmlBody,
        description: DEFAULT_EMAIL_TEMPLATES[key].description,
        updatedAt,
      }),
    })
  )
  console.log(`[email-templates] Saved template "${key}" at ${updatedAt}`)
  return ok({ success: true, templateKey: key, updatedAt })
}

/** GET /admin/buddy-pool — list all users who opted into the buddy system. */
async function handleGetAdminBuddyPool(event: any): Promise<ApiResponse> {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  if (adminSecret && providedSecret !== adminSecret) {
    return fail(403, 'Forbidden')
  }

  const profiles = await scanAll(TABLE.profiles)
  const buddyUsers = profiles
    .filter((p) => p.buddyOptIn === 'yes')
    .map((p) => ({
      userId: p.userId,
      displayName: (p.buddyDisplayName || p.preferredName || 'Unknown') as string,
      nationality: p.nationality as string | undefined,
      degreeType: p.degreeType as string | undefined,
      fieldOfStudy: p.fieldOfStudy as string | undefined,
      programStartMonth: p.programStartMonth as string | undefined,
      phone: p.buddyPhone as string | undefined,
      instagram: p.buddyInstagram as string | undefined,
      linkedin: p.buddyLinkedIn as string | undefined,
      lookingFor: p.buddyLookingFor as string | undefined,
      bio: p.buddyBio as string | undefined,
      buddyStatus: (p.buddyStatus || 'pending') as string,
      buddyMatchedWithId: p.buddyMatchedWithId as string | undefined,
      updatedAt: p.updatedAt as string | undefined,
    }))

  return ok({ users: buddyUsers })
}

/** POST /admin/buddy-match — manually match two users. */
async function handlePostAdminBuddyMatch(event: any): Promise<ApiResponse> {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  if (adminSecret && providedSecret !== adminSecret) {
    return fail(403, 'Forbidden')
  }

  const { userAId, userBId } = parseBody(event)
  if (!userAId || !userBId) return fail(400, 'userAId and userBId are required')
  if (userAId === userBId) return fail(400, 'Cannot match a user with themselves')

  const [profileA, profileB] = await Promise.all([
    getUserProfile(userAId as string),
    getUserProfile(userBId as string),
  ])
  if (!profileA) return fail(404, `User ${userAId} not found`)
  if (!profileB) return fail(404, `User ${userBId} not found`)

  await Promise.all([
    saveUserProfile(userAId as string, { ...profileA, buddyStatus: 'matched', buddyMatchedWithId: userBId as string }),
    saveUserProfile(userBId as string, { ...profileB, buddyStatus: 'matched', buddyMatchedWithId: userAId as string }),
  ])

  return ok({ message: 'Matched successfully', userAId, userBId })
}

// ─── AI Chat Handler ──────────────────────────────────────────────────────────

interface ChatMessage { role: string; content: string }

async function getGeminiApiKey(): Promise<string> {
  if (cachedGeminiApiKey) return cachedGeminiApiKey
  const secretName = process.env.GEMINI_SECRET_NAME
  if (!secretName) throw new Error('GEMINI_SECRET_NAME env var not set')

  const { SecretString } = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretName })
  )
  if (!SecretString) throw new Error('Secret has no string value')

  // Log the raw format to CloudWatch (masked) so we can see exactly what is stored
  const isJson = SecretString.trimStart().startsWith('{')
  console.log(`[Chat] SecretString type: ${isJson ? 'JSON' : 'plain string'}, length: ${SecretString.length}`)

  let key: string
  if (isJson) {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(SecretString)
    } catch (e) {
      throw new Error(`Secret looks like JSON but failed to parse: ${e}`)
    }
    console.log(`[Chat] JSON keys in secret: ${JSON.stringify(Object.keys(parsed))}`)

    // Try every possible field name
    const candidate = parsed.api_key
      ?? parsed.apiKey
      ?? parsed.key
      ?? parsed.value
      ?? parsed[secretName]           // e.g. {"Google_api": "AIzaSy..."}
      ?? Object.values(parsed).find((v) => typeof v === 'string' && (v as string).length > 10)
      ?? (Object.keys(parsed)[0]?.length > 10 ? Object.keys(parsed)[0] : undefined) // key IS the API key (e.g. {"AIzaSy...": ""})

    if (!candidate || typeof candidate !== 'string') {
      throw new Error(
        `Could not find API key in secret JSON. Keys present: ${JSON.stringify(Object.keys(parsed))}. ` +
        `Values (lengths): ${JSON.stringify(Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v).length])))}`
      )
    }
    key = candidate
  } else {
    // Plain string — use as-is
    key = SecretString.trim()
  }

  if (!key) throw new Error('Gemini API key resolved to empty string')
  console.log(`[Chat] Gemini API key resolved, length: ${key.length}, prefix: ${key.slice(0, 4)}`)

  cachedGeminiApiKey = key
  return cachedGeminiApiKey
}

async function handlePostChat(userId: string, event: any): Promise<ApiResponse> {
  const body = parseBody(event)
  const messages: ChatMessage[] = body.messages

  if (!Array.isArray(messages) || messages.length === 0) {
    return fail(400, 'messages array is required')
  }

  // Load user profile for personalised context
  const profile = await getUserProfile(userId)

  // Build system prompt
  const systemLines: string[] = [
    'You are Leavs AI, a concise and knowledgeable assistant helping international students relocate to Italy (primarily Milan for universities such as Bocconi, Politecnico di Milano, etc.).',
    'RESPONSE STYLE: Keep answers short — 2-4 sentences or a brief bullet list (max 5 items). Never write long essays. Be direct and friendly.',
    'Topics you are expert in: student visas, Codice Fiscale, Permesso di Soggiorno, housing in Milan, Italian bank accounts, health insurance, healthcare (SSN / mutua), university enrollment, Italian bureaucracy, cost of living.',
    'Always recommend checking official sources for deadlines since they can change.',
    '',
    'ABOUT LEAVS: Leavs (weleav.com) is a platform that guides international students through every step of relocating to Italy. It provides step-by-step guides, tools, and a community for students moving to Milan.',
    '',
    'WEBSITE PAGES — when a question relates to one of these topics, include a markdown link to the relevant page. Each entry explains what is on that page:',
    '',
    '- [University Application](/dashboard/university-application): Step-by-step guide covering entrance tests, language requirements, application round deadlines & result dates, required documents (interactive checklist), the selection process, insider tips, and key official links. Content adapts per university (Bocconi, Politecnico, etc.).',
    '',
    '- [Student Visa](/dashboard/student-visa): Covers the Italian student D-visa — consulate process & timeline, appointment booking, required documents (passport, acceptance letter, financial proof, insurance, accommodation proof), and common mistakes. EU citizens see an "not applicable" message.',
    '',
    '- [Codice Fiscale](/dashboard/codice-fiscale): How to obtain the Italian tax code — step-by-step application guide, required documents checklist, local office locations, a live Codice Fiscale calculator tool, how to verify an existing code, and an FAQ. Adapts for EU vs non-EU students.',
    '',
    '- [Before Departure](/dashboard/before-departure): Personalised pre-departure checklist covering documents to pack, travel & arrival tips, travel insurance, EHIC (EU students), private health insurance (non-EU), and a readiness score based on the user\'s answers.',
    '',
    '- [Residence Permit / Permesso di Soggiorno](/dashboard/immigration-registration): Non-EU students: full kit giallo guide (Questura process, numbered steps), document checklist, police interview prep, status tracking & renewal. EU students: Anagrafe/municipality registration, required documents.',
    '',
    '- [Housing](/dashboard/housing): Neighbourhood-matching tool for Milan — shows the best neighbourhoods based on the user\'s university, housing preference, and programme start month.',
    '',
    '- [Banking](/dashboard/banking): Covers digital banks (N26, Revolut, Wise, etc.) vs traditional banks, required documents, step-by-step account opening, international transfers, student budgeting tips, and the link between banking and the Codice Fiscale.',
    '',
    '- [Insurance](/dashboard/insurance): Overview of health and travel insurance requirements and status checklist for the user.',
    '',
    '- [Healthcare](/dashboard/healthcare): Overview of healthcare in Italy — SSN (Servizio Sanitario Nazionale), registering with a GP, EHIC, and student health coverage options.',
    '',
    '- [Cost of Living](/dashboard/cost-of-living): Interactive monthly budget planner with sliders for rent (by housing type), utilities, transport, groceries, dining, entertainment, and more. Includes city-specific defaults and a Big Mac index reference.',
    '',
    '- [Buddy System](/dashboard/buddy-system): Peer-matching feature — users can find a flatmate, bureaucracy buddy, study partner, language exchange partner, sports partner, or city guide. Users fill in a short profile and are matched with another student.',
    '',
    '- [Find Your Peers](/dashboard/find-your-peers): Directory of verified WhatsApp, Telegram, and Discord group chats for university programmes (Bocconi MSc & BSc, and more). Automatically highlights the group matching the user\'s degree and intake year.',
    '',
    '- [Information Centre](/dashboard/information-centre): FAQ with 14 answered questions covering: arrival documents, codice fiscale, permesso di soggiorno, Anagrafe registration, bank account, health coverage, Milan public transport (ATM pass), student discounts (ESN), affordable food, mental health support, housing search, SPID digital identity, safety, and making friends.',
    '',
    '- [Blog](/dashboard/blog): Articles and guides with tips for international students moving to Italy.',
    '',
    'Link format: use relative paths exactly as shown above (e.g. /dashboard/housing). Never invent paths.',
  ]

  if (profile) {
    const ctx: string[] = []
    if (profile.preferredName)          ctx.push(`Name: ${profile.preferredName}`)
    if (profile.nationality)            ctx.push(`Nationality: ${profile.nationality}`)
    if (profile.destinationUniversity)  ctx.push(`University: ${profile.destinationUniversity}`)
    const prog = [profile.degreeType, profile.fieldOfStudy].filter(Boolean).join(' – ')
    if (prog)                           ctx.push(`Program: ${prog}`)
    if (profile.programStartMonth) {
      const d = new Date(`${profile.programStartMonth}-01`)
      ctx.push(`Arrival: ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
    }
    if (profile.isEuCitizen)            ctx.push(`EU citizen: ${profile.isEuCitizen === 'yes' ? 'Yes' : 'No'}`)
    if (profile.hasVisa)                ctx.push(`Visa: ${profile.hasVisa === 'yes' ? 'Obtained' : 'Not yet obtained'}`)
    if (profile.hasHousing)             ctx.push(`Housing: ${profile.hasHousing === 'yes' ? 'Arranged' : 'Not yet arranged'}`)
    if (profile.hasBankAccount)         ctx.push(`Bank account: ${profile.hasBankAccount === 'yes' ? 'Open' : 'Not yet open'}`)
    if (profile.hasCodiceFiscale)       ctx.push(`Codice Fiscale: ${profile.hasCodiceFiscale === 'yes' ? 'Obtained' : 'Not yet obtained'}`)
    if (ctx.length > 0) {
      systemLines.push(`\nUser profile (use this to personalise your answers — never reveal private contact details):\n${ctx.map(c => `- ${c}`).join('\n')}`)
    }
  }

  const systemPrompt = systemLines.join('\n')

  // Gemini requires the conversation to start with a 'user' turn;
  // merge consecutive same-role turns as required by the API
  const geminiContents = messages
    .filter((_, i) => i > 0 || _.role === 'user')
    .reduce<{ role: string; parts: { text: string }[] }[]>((acc, m) => {
      const geminiRole = m.role === 'user' ? 'user' : 'model'
      const last = acc[acc.length - 1]
      if (last && last.role === geminiRole) {
        last.parts.push({ text: m.content })
      } else {
        acc.push({ role: geminiRole, parts: [{ text: m.content }] })
      }
      return acc
    }, [])

  const apiKey = await getGeminiApiKey()

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
      }),
    }
  )

  if (!geminiRes.ok) {
    const errText = await geminiRes.text()
    console.error('[Chat] Gemini API error:', errText)
    return fail(502, `AI service unavailable: ${errText}`)
  }

  const geminiData = await geminiRes.json() as any
  const text: string | undefined = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    console.error('[Chat] No text in Gemini response:', JSON.stringify(geminiData))
    return fail(502, 'No response from AI service')
  }

  // Persist messages asynchronously — non-fatal if table isn't ready
  const userTimestamp = body.userTimestamp as string | undefined ?? new Date().toISOString()
  void persistChatMessages(userId, messages[messages.length - 1].content, text, userTimestamp)

  return ok({ reply: text })
}

async function persistChatMessages(
  userId: string,
  userContent: string,
  aiText: string,
  userTimestamp: string,
): Promise<void> {
  const now = new Date().toISOString()
  try {
    await Promise.all([
      saveChatMessage(userId, 'user',      userContent, userTimestamp),
      saveChatMessage(userId, 'assistant', aiText, now),
    ])
  } catch (err) {
    // Non-fatal — log but don't fail the chat response
    console.error('[Chat] Failed to persist messages to DynamoDB:', err)
  }
}

// ─── Router ──────────────────────────────────────────────────────────────────

export async function handler(event: any): Promise<ApiResponse> {
  let { method, path } = extractRoute(event)

  // API Gateway v1 passes the resource template (e.g. /deadlines/{deadlineId})
  // in event.path instead of the actual URL. Substitute real values from
  // event.pathParameters when available so routing works correctly.
  if (event.pathParameters && typeof event.pathParameters === 'object') {
    for (const [key, val] of Object.entries(event.pathParameters as Record<string, string>)) {
      path = path.replace(`{${key}}`, val)
    }
  }

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
    const deadlineMatch = path.match(/^\/deadlines\/([^/]+)$/)
    if (method === 'PUT'    && deadlineMatch) return await handlePutDeadline(userId, deadlineMatch[1], event)
    if (method === 'DELETE' && deadlineMatch) return await handleDeleteDeadline(userId, deadlineMatch[1])
    if (method === 'GET'  && path === '/admin/stats') return await handleGetAdminStats(event)
    if (method === 'GET'  && path === '/admin/whatsapp-messages') return await handleGetAdminWhatsappMessages(event)
    if (method === 'GET'  && path === '/admin/feedback') return await handleGetAdminFeedback(event)
    if (method === 'GET'  && path === '/buddy/match') return await handleGetBuddyMatch(userId)
    if (method === 'GET'  && path === '/admin/users') return await handleGetAdminUsers(event)
    if (method === 'GET'  && path === '/admin/buddy-pool') return await handleGetAdminBuddyPool(event)
    if (method === 'POST' && path === '/admin/buddy-match') return await handlePostAdminBuddyMatch(event)
    if (method === 'POST' && path === '/user/me/welcome-email') return await handlePostWelcomeEmail(userId, event)
    if (method === 'POST' && path === '/admin/test-email')  return await handlePostAdminTestEmail(event)
    if (method === 'GET'  && path === '/admin/email-templates') return await handleGetAdminEmailTemplates(event)
    const emailTemplateMatch = path.match(/^\/admin\/email-templates\/([^/]+)$/)
    if (method === 'PUT'  && emailTemplateMatch) return await handlePutAdminEmailTemplate(event, emailTemplateMatch[1])
    if (method === 'GET'  && path === '/chat')             return await handleGetChat(userId)
    if (method === 'POST' && path === '/chat')             return await handlePostChat(userId, event)

    console.error(`[Handler] No route matched for ${method} ${path}`)
    return fail(404, 'Not found')
  } catch (error) {
    console.error(`${method} ${path} error:`, error)
    return fail(500, 'Internal server error')
  }
}
