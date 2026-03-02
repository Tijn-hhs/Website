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
  // Personalised dashboard
  dashboardPlan?: string   // JSON string of DashboardPlanItem[]
  onboardingCompletedAt?: string
}

const ONBOARDING_LOCKED_FIELDS: Array<keyof UserProfile> = [
  'preferredName',
  'nationality',
  'residenceCountry',
  'destinationCountry',
  'destinationCity',
  'destinationUniversity',
  'destinationUnknownCountry',
  'destinationUnknownCity',
  'destinationUnknownUniversity',
  'degreeType',
  'fieldOfStudy',
  'fieldOfStudyUnknown',
  'programStartMonth',
  'programStartMonthUnknown',
  'programApplied',
  'programAccepted',
  'admissionStatus',
  'deadlinesKnown',
  'hasGmatOrEntranceTest',
  'gmatScore',
  'hasEnglishTest',
  'englishTestType',
  'englishTestScore',
  'hasRecommendationLetters',
  'hasCv',
  'isEuCitizen',
  'hasVisa',
  'visaType',
  'passportExpiry',
  'visaAppointmentNeeded',
  'hasCodiceFiscale',
  'hasResidencePermit',
  'hasHousing',
  'housingPreference',
  'housingBudget',
  'moveInWindow',
  'housingSupportNeeded',
  'needsBankAccount',
  'hasBankAccount',
  'needsPhoneNumber',
  'hasPhoneNumber',
  'hasTravelInsurance',
  'hasHealthInsurance',
  'monthlyBudgetRange',
  'scholarshipNeed',
  'fundingSource',
  'lastCompletedStep',
  'checklistItems',
  'dashboardPlan',
]

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

// ─── Content System Types ────────────────────────────────────────────────────────────

/**
 * The situation object built from a user's profile (destination + origin).
 * Passed as query params to GET /content/modules and evaluated by the rule engine.
 */
interface UserSituation {
  destinationCountry?: string   // e.g. "italy"
  destinationCity?: string      // e.g. "milan"
  universityId?: string         // e.g. "bocconi"
  originEu?: boolean            // true = EU citizen
  originCountry?: string        // e.g. "United States"
  degreeType?: string           // "bachelor" | "master" | "phd" | "exchange"
}

/**
 * Rules that determine whether a module is shown to a user.
 * Any field left undefined = wildcard (matches any value).
 * Arrays mean "any of these values".
 */
interface VisibilityRules {
  destinationCountry?: string | string[]
  destinationCity?: string
  universityId?: string
  originEu?: boolean
  originCountry?: string | string[]
  degreeType?: string | string[]
}

interface ContentModuleStep {
  title: string
  body: string
  tips?: string[]
}

interface ContentModuleDocument {
  label: string
  required: boolean
  notes?: string
}

interface ContentModuleLink {
  label: string
  url: string
}

interface ContentModuleDeadline {
  label: string
  date: string
  notes?: string
}

/** Structured content for a dashboard module page. */
interface ContentModuleContent {
  intro?: string
  steps?: ContentModuleStep[]
  tips?: string[]
  documents?: ContentModuleDocument[]
  links?: ContentModuleLink[]
  deadlines?: ContentModuleDeadline[]
}

/**
 * Types of dashboard module:
 *  journey — A numbered step in the student journey (shown in sequence 1-10)
 *  info    — A resource/reference page, always accessible, no required action
 *  tool    — An interactive tool (calculator, map, matcher)
 */
type StepType = 'journey' | 'info' | 'tool'

/**
 * A content variant inside a module.
 * When the user's situation matches `condition`, the page renders
 * `contentNote` content instead of the default content.
 * First matching variant wins.
 */
interface ContentVariant {
  variantId: string
  label: string          // e.g. "Non-EU students"
  condition: {
    originEu?: boolean
    originCountry?: string
    degreeType?: string
    destinationCountry?: string
    destinationCity?: string
    universityId?: string
  }
  contentNote: string    // describes what differs for this variant
}

/**
 * A content variant: if the user's situation matches `condition`,
 * merge `contentOverrides` into the module's base content.
 */
interface ContentModuleVariant {
  condition: Partial<UserSituation>
  contentOverrides: Partial<ContentModuleContent>
}

/**
 * A single dashboard module entry stored in `content-modules` DynamoDB table.
 * The rule engine evaluates `visibilityRules` against the user's situation
 * and returns matching modules sorted by stepNumber.
 */
interface ContentModule {
  moduleId: string
  label: string
  icon?: string
  description?: string
  route?: string         // dashboard path, e.g. /dashboard/banking-italy
  stepType?: StepType     // 'journey' | 'info' | 'tool'
  stepNumber?: number
  visibilityRules: VisibilityRules
  variants?: ContentVariant[]   // per-situation content variants
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

interface ContentCountry {
  countryId: string
  name: string
  code: string
  flagEmoji?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

interface ContentOriginCountry {
  originCountryId: string
  name: string
  code: string          // ISO 3166-1 alpha-2 e.g. "CN"
  active: boolean
  createdAt?: string
  updatedAt?: string
}

interface ContentCity {
  cityId: string
  countryId: string
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

interface ContentUniversity {
  universityId: string
  cityId: string
  countryId: string
  name: string
  shortName?: string
  applyUrl?: string
  tuitionRange?: Record<string, string>
  applicationRounds?: unknown[]
  documents?: Record<string, unknown[]>
  languageRequirements?: Record<string, unknown>
  selectionCriteria?: Record<string, string[]>
  tips?: string[]
  keyLinks?: Array<{ label: string; url: string }>
  lastVerified?: string
  updatedAt?: string
}

interface ContentNeighborhood {
  cityId: string
  neighborhoodId: string
  name: string
  lat?: number
  lng?: number
  avgRent?: number
  walkabilityScore?: number
  vibe?: string
  shortDescription?: string
  longDescription?: string
  distancesToUniversities?: Record<string, string>  // { bocconi: "8 min walk" }
  bestFor?: string[]
  notFor?: string[]
  photoUrl?: string
  updatedAt?: string
}

// ─── Clients & Config ────────────────────────────────────────────────────────

const dynamo = new DynamoDBClient({})
const ses = new SESClient({ region: 'eu-west-1' }) // SES identity (weleav.com) is verified in eu-west-1
const secretsClient = new SecretsManagerClient({})

// Cache the Gemini API key across warm Lambda invocations
let cachedGeminiApiKey: string | null = null
let cachedFirecrawlApiKey: string | null = null

const TABLE = {
  profiles: process.env.USER_PROFILE_TABLE_NAME!,
  progress: process.env.USER_PROGRESS_TABLE_NAME!,
  feedback: process.env.FEEDBACK_TABLE_NAME!,
  deadlines: process.env.DEADLINES_TABLE_NAME!,
  // Reddit posts fetched by the redditPoller Lambda (leavs-{env}-reddit-posts)
  whatsappMessages: process.env.WHATSAPP_MESSAGES_TABLE_NAME!,
  chatMessages: process.env.CHAT_MESSAGES_TABLE_NAME!,
  emailTemplates: process.env.EMAIL_TEMPLATES_TABLE_NAME || '',
  // ─ Content tables (multi-destination system) ─────────────────────────────────────
  contentCountries:       process.env.CONTENT_COUNTRIES_TABLE_NAME         || '',
  contentCities:          process.env.CONTENT_CITIES_TABLE_NAME              || '',
  contentUniversities:    process.env.CONTENT_UNIVERSITIES_TABLE_NAME        || '',
  contentNeighborhoods:   process.env.CONTENT_NEIGHBORHOODS_TABLE_NAME       || '',
  contentModules:         process.env.CONTENT_MODULES_TABLE_NAME             || '',
  contentOriginCountries: process.env.CONTENT_ORIGIN_COUNTRIES_TABLE_NAME    || '',
  costBenchmarks:         process.env.COST_BENCHMARKS_TABLE_NAME              || '',
} as const

const SENDER_EMAIL = 'hallo@weleav.com'
const FEEDBACK_RECIPIENT = process.env.FEEDBACK_EMAIL || 'hallo@weleav.com'
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'Tijn@eendenburg.eu'

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
<body style="margin:0;padding:0;background-color:#eff6ff;font-family:system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(30,27,75,0.10);border:1px solid #e2e8f0;">

          <!-- Header: deep indigo → navy gradient matching dashboard -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#1e3a5f 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">Leavs</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.60);font-size:13px;letter-spacing:0.2px;">Your study abroad companion</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:600;">
                Welcome, {{preferredName}}! \uD83C\uDF89
              </h2>

              <p style="margin:0 0 20px;color:#475569;font-size:16px;line-height:1.65;">
                You've completed your onboarding \u2014 you're all set to make the most of your move to
                <strong style="color:#1e1b4b;">{{universityLine}}</strong>{{locationSuffix}}.
              </p>

              <p style="margin:0 0 32px;color:#475569;font-size:16px;line-height:1.65;">
                Your personalised dashboard is ready. Track your deadlines, explore your checklist, and find everything you need for a smooth relocation \u2014 all in one place.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#1e1b4b 0%,#1e3a5f 100%);border-radius:10px;padding:14px 32px;">
                    <a href="https://www.weleav.com/dashboard"
                       style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:0.1px;">
                      Go to your dashboard \u2192
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 28px;">
                <tr>
                  <td style="height:1px;background-color:#e2e8f0;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.6;">
                If you have any questions or feedback, simply reply to this email \u2014 we'd love to hear from you.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                \u00A9 {{year}} Leavs \u00B7
                <a href="https://www.weleav.com" style="color:#3b82f6;text-decoration:none;">weleav.com</a>
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
  deadline_reminder: {
    description: 'Sent 5 days before a deadline when sendReminder is enabled',
    subject: '⏰ Reminder: {{deadlineTitle}} is due in {{daysUntil}} days',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Deadline Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#eff6ff;font-family:system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(30,27,75,0.10);border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#1e3a5f 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">Leavs</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.60);font-size:13px;letter-spacing:0.2px;">Your study abroad companion</p>
            </td>
          </tr>

          <!-- Deadline badge -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <div style="display:inline-block;background-color:#fef3c7;border:1px solid #fde68a;border-radius:999px;padding:6px 18px;">
                <span style="color:#92400e;font-size:13px;font-weight:600;">⏰ Due in {{daysUntil}} days</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:600;">
                Hi {{preferredName}},
              </h2>
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.65;">
                Just a heads-up \u2014 you have a deadline coming up soon:
              </p>

              <!-- Deadline card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #1e1b4b;border-radius:10px;padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#0f172a;font-size:17px;font-weight:600;">{{deadlineTitle}}</p>
                    <p style="margin:0;color:#64748b;font-size:14px;">Due: <strong style="color:#1e1b4b;">{{dueDate}}</strong></p>
                    {{noteSection}}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.65;">
                Stay on top of your journey \u2014 check your dashboard for all upcoming tasks and deadlines.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#1e1b4b 0%,#1e3a5f 100%);border-radius:10px;padding:14px 32px;">
                    <a href="https://www.weleav.com/dashboard"
                       style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:0.1px;">
                      View your dashboard \u2192
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 28px;">
                <tr>
                  <td style="height:1px;background-color:#e2e8f0;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.6;">
                If you have any questions, simply reply to this email \u2014 we'd love to help.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                \u00A9 {{year}} Leavs \u00B7
                <a href="https://www.weleav.com" style="color:#3b82f6;text-decoration:none;">weleav.com</a>
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
  const onboardingAlreadyCompleted =
    (typeof existing?.onboardingCompletedAt === 'string' && existing.onboardingCompletedAt.length > 0) ||
    (typeof existing?.lastCompletedStep === 'number' && existing.lastCompletedStep >= 8) ||
    (typeof existing?.dashboardPlan === 'string' && existing.dashboardPlan.trim().length > 0 && existing.dashboardPlan.trim() !== '[]')

  const updatesToApply: Record<string, unknown> = { ...updates }

  if (onboardingAlreadyCompleted) {
    for (const field of ONBOARDING_LOCKED_FIELDS) {
      delete updatesToApply[field]
    }
    delete updatesToApply.onboardingCompletedAt
  }

  const merged = { ...existing, ...updatesToApply }

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
  // Extra fields for admin notification
  const nationality: string = body.nationality || ''
  const isEuCitizen: string = body.isEuCitizen || ''
  const degreeType: string = body.degreeType || ''
  const fieldOfStudy: string = body.fieldOfStudy || ''
  const programStartMonth: string = body.programStartMonth || ''

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

    // ── Admin notification ────────────────────────────────────────────────────
    // Fire-and-forget — do not let a failure here block the user response.
    const signupTime = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    const adminHtml = `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px">
        <h2 style="color:#166534;margin-bottom:4px">🎉 New Leavs user signed up</h2>
        <p style="color:#6b7280;font-size:13px;margin-top:0">${signupTime}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;font-weight:600;width:40%">Name</td><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb">${preferredName}</td></tr>
          <tr><td style="padding:8px 12px;background:#f3f4f6;border:1px solid #e5e7eb;font-weight:600">Email</td><td style="padding:8px 12px;background:#f3f4f6;border:1px solid #e5e7eb">${userEmail}</td></tr>
          <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;font-weight:600">Nationality</td><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb">${nationality || '—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f3f4f6;border:1px solid #e5e7eb;font-weight:600">EU citizen</td><td style="padding:8px 12px;background:#f3f4f6;border:1px solid #e5e7eb">${isEuCitizen === 'yes' ? '✅ Yes' : isEuCitizen === 'no' ? '❌ No' : '—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;font-weight:600">University</td><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb">${destinationUniversity || '—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f3f4f6;border:1px solid #e5e7eb;font-weight:600">City / Country</td><td style="padding:8px 12px;background:#f3f4f6;border:1px solid #e5e7eb">${locationLine || '—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;font-weight:600">Degree type</td><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb">${degreeType || '—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f3f4f6;border:1px solid #e5e7eb;font-weight:600">Field of study</td><td style="padding:8px 12px;background:#f3f4f6;border:1px solid #e5e7eb">${fieldOfStudy || '—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb;font-weight:600">Program start</td><td style="padding:8px 12px;background:#fff;border:1px solid #e5e7eb">${programStartMonth || '—'}</td></tr>
        </table>
      </div>`

    ses.send(
      new SendEmailCommand({
        Source: SENDER_EMAIL,
        Destination: { ToAddresses: [ADMIN_NOTIFICATION_EMAIL] },
        Message: {
          Subject: { Data: `New Leavs user: ${preferredName} (${userEmail})` },
          Body: { Html: { Data: adminHtml } },
        },
      })
    ).then(() => {
      console.log(`[welcome-email] Admin notification sent to ${ADMIN_NOTIFICATION_EMAIL}`)
    }).catch((err: any) => {
      console.error('[welcome-email] Admin notification failed (non-blocking):', err)
    })

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

/**
 * POST /admin/send-deadline-reminders
 * Scans the deadlines table and emails every user whose deadline falls in
 * `daysAhead` days (default 5) and has `sendReminder: true`.
 * Intended to be called daily by an EventBridge rule or manually from the admin panel.
 */
async function handlePostAdminSendDeadlineReminders(event: any): Promise<ApiResponse> {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  const auth = event.requestContext?.authorizer || event.authorizer || {}
  const groups: string[] = (auth?.claims?.['cognito:groups'] || '').split(',').filter(Boolean)
  const isAdmin = groups.includes('admin') || (adminSecret && providedSecret === adminSecret)
  if (!isAdmin) return fail(403, 'Forbidden')

  const body = parseBody(event)
  const daysAhead: number = parseInt(body.daysAhead ?? '5', 10) || 5

  // Compute target date in UTC (today + daysAhead)
  const now = new Date()
  const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysAhead))
  const targetDateStr = targetDate.toISOString().slice(0, 10) // "YYYY-MM-DD"

  // Scan all deadlines and keep only those due on targetDate with reminders on
  const allDeadlines = (await scanAll(TABLE.deadlines)) as unknown as Deadline[]
  const due = allDeadlines.filter((d) => d.sendReminder && (d.dueDate || '').slice(0, 10) === targetDateStr)

  if (due.length === 0) {
    return ok({ sent: 0, skipped: 0, failed: 0, message: `No reminders due on ${targetDateStr}` })
  }

  // Build userId → email map from Cognito
  const emailMap = await buildCognitoEmailMap()

  // Load template once (falls back to default if never customised)
  const templateData = await getEmailTemplate('deadline_reminder')

  const formattedDate = targetDate.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })

  const results = { sent: 0, skipped: 0, failed: 0, details: [] as string[] }

  await Promise.all(
    due.map(async (deadline) => {
      const userEmail = emailMap.get(deadline.userId)?.toLowerCase()
      if (!userEmail) {
        results.skipped++
        results.details.push(`${deadline.deadlineId}: no email for userId ${deadline.userId}`)
        return
      }

      const profile = await getUserProfile(deadline.userId)
      const preferredName = profile?.preferredName || 'there'

      // Build optional note block — empty string if no note so {{noteSection}} renders cleanly
      const noteSection = deadline.note
        ? `<p style="margin:10px 0 0;color:#64748b;font-size:13px;line-height:1.5;"><strong>Note:</strong> ${deadline.note}</p>`
        : ''

      const vars: Record<string, string> = {
        preferredName,
        deadlineTitle: deadline.title,
        dueDate: formattedDate,
        daysUntil: String(daysAhead),
        noteSection,
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
        results.sent++
        console.log(`[deadline-reminder] Sent to ${userEmail} for "${deadline.title}" due ${targetDateStr}`)
      } catch (err: any) {
        results.failed++
        results.details.push(`${deadline.deadlineId}: SES error — ${err?.message ?? String(err)}`)
        console.error(`[deadline-reminder] Failed for ${userEmail}:`, err)
      }
    })
  )

  return ok({ ...results, targetDate: targetDateStr })
}

// ─── Firecrawl Deadline Scraper ─────────────────────────────────────────────

const DEADLINE_SCRAPE_SOURCES = [
  {
    id: 'bocconi-admissions',
    university: 'Bocconi',
    url: 'https://www.unibocconi.it/en/applying-bocconi/master-science-and-ma-programs/application-and-admissions/admissions',
  },
  {
    id: 'polimi-admissions',
    university: 'Politecnico di Milano',
    url: 'https://www.polimi.it/en/prospective-students/how-to-apply/admission-to-laurea-magistrale/foreign-qualification/deadlines',
  },
]

interface ScrapedDeadlineItem {
  title: string
  date: string
  description?: string
  type?: string
}

interface NumbeoMilanBenchmarks {
  city: string
  // Rent
  rent_1br_city_center: number
  rent_1br_outside_center: number
  rent_3br_city_center: number
  rent_3br_outside_center: number
  rent_shared_room: number          // estimated (room in shared flat)
  rent_studio: number               // estimated (small 1BR/studio)
  // Restaurants & dining
  meal_inexpensive_restaurant: number
  meal_midrange_restaurant_2people: number
  meal_fastfood_combo: number
  beer_domestic_pint: number
  cappuccino: number
  // Markets / groceries
  milk_1l: number
  bread_loaf: number
  eggs_12: number
  chicken_1lb: number
  apples_1lb: number
  water_1_5l: number
  wine_bottle_midrange: number
  cigarettes_pack: number
  groceries_monthly: number         // estimated monthly grocery budget
  // Transportation
  transport_one_way_ticket: number
  monthly_transport_pass: number
  taxi_start: number
  gasoline_1l: number
  // Utilities
  utilities_monthly_basic: number   // electricity + heating + water + garbage
  mobile_plan: number
  internet_monthly: number
  // Leisure
  fitness_club_monthly: number
  cinema_ticket: number
  // Economy
  avg_monthly_net_salary: number
  scrapedAt: string
}

/**
 * POST /admin/scrape-deadlines
 * Uses Firecrawl to extract deadline info from official university pages.
 * Returns the raw extracted data for admin review — does NOT write to DynamoDB.
 */
async function handlePostAdminScrapeDeadlines(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')

  let apiKey: string
  try {
    apiKey = await getFirecrawlApiKey()
  } catch (err) {
    console.error('[scrape-deadlines] Failed to load Firecrawl key:', err)
    return fail(500, 'Could not load Firecrawl API key')
  }

  const scrapeOne = async (source: typeof DEADLINE_SCRAPE_SOURCES[number]) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 22000) // 22s per-source timeout
    try {
      const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: source.url,
          formats: ['extract'],
          extract: {
            prompt: `Extract ALL dates and deadlines from this page — include every entry that has a specific date or date range.
Return a JSON array of objects, each with these fields:
- title (string): descriptive name, e.g. "1st semester application period (Engineering)" or "Early bird deadline (Architecture)"
- date (string): the date or date range exactly as shown on the page, e.g. "1st October 2025 - 1st December 2025" or "29th January 2026"
- description (string, optional): any extra context from the page (e.g. fee amount, who it applies to)
- type (string): one of "application", "enrollment", "outcome", "event", "other"
Include ALL entries regardless of whether they are past or future. Do not skip anything with a date.`,
          },
        }),
      })

      if (!firecrawlRes.ok) {
        const errText = await firecrawlRes.text()
        throw new Error(`Firecrawl HTTP ${firecrawlRes.status}: ${errText}`)
      }

      const data = await firecrawlRes.json() as any
      const extracted: ScrapedDeadlineItem[] = data?.data?.extract ?? data?.extract ?? []
      return { source: source.url, university: source.university, status: 'ok' as const, deadlines: extracted }
    } catch (err: any) {
      console.error(`[scrape-deadlines] Error scraping ${source.university}:`, err)
      return { source: source.url, university: source.university, status: 'error' as const, error: err?.message ?? String(err) }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // Run all sources in parallel to stay within API Gateway's 29s limit
  const results = await Promise.all(DEADLINE_SCRAPE_SOURCES.map(scrapeOne))

  return ok({ results })
}

/**
 * Parses a Numbeo markdown page and extracts a price by matching the row label.
 * Numbeo tables look like: | Row Label | 1,234.56 € | range |
 */
function parseNumbeoPrice(markdown: string, label: string): number {
  // Escape special regex chars in the label
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Match: ...| <label> | <number> € |...
  const re = new RegExp(`\\|[^|]*${esc}[^|]*\\|\\s*([\\d,]+\\.?\\d*)\\s*[€$£]?`, 'i')
  const m = markdown.match(re)
  if (!m) return 0
  return parseFloat(m[1].replace(/,/g, ''))
}

/**
 * POST /admin/scrape-cost-benchmarks
 * Accepts optional { city } body (defaults to "Milan").
 * Scrapes Numbeo for live cost-of-living prices and saves them to the
 * costBenchmarks table keyed by city name.
 */
async function handlePostAdminScrapeCostBenchmarks(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.costBenchmarks) return fail(503, 'Cost benchmarks table not yet provisioned')

  let apiKey: string
  try {
    apiKey = await getFirecrawlApiKey()
  } catch (err) {
    console.error('[scrape-cost-benchmarks] Failed to load Firecrawl key:', err)
    return fail(500, 'Could not load Firecrawl API key')
  }

  const body = event.body ? JSON.parse(event.body) : {}
  const city: string = ((body.city as string) || 'Milan').trim()
  const numbeoSlug = city.replace(/\s+/g, '-') // "New York" -> "New-York"
  const numbeoUrl = `https://www.numbeo.com/cost-of-living/in/${numbeoSlug}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25000)

  try {
    const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: numbeoUrl,
        formats: ['markdown'],
      }),
    })

    clearTimeout(timeoutId)

    if (!firecrawlRes.ok) {
      const errText = await firecrawlRes.text()
      throw new Error(`Firecrawl HTTP ${firecrawlRes.status}: ${errText}`)
    }

    const data = await firecrawlRes.json() as any
    const md: string = data?.data?.markdown ?? data?.markdown ?? ''

    if (!md) {
      throw new Error('Firecrawl returned no markdown content')
    }

    const p = (label: string) => parseNumbeoPrice(md, label)

    // Derived estimates
    const rent3brOut  = p('3 Bedroom Apartment Outside of City Centre')
    const rent1brOut  = p('1 Bedroom Apartment Outside of City Centre')
    const sharedRoom  = rent3brOut > 0 ? Math.round(rent3brOut / 3) : 0

    const benchmarks: NumbeoMilanBenchmarks = {
      city,
      // Rent
      rent_1br_city_center:      p('1 Bedroom Apartment in City Centre'),
      rent_1br_outside_center:   rent1brOut,
      rent_3br_city_center:      p('3 Bedroom Apartment in City Centre'),
      rent_3br_outside_center:   rent3brOut,
      rent_shared_room:          sharedRoom,
      rent_studio:               rent1brOut,
      // Restaurants
      meal_inexpensive_restaurant:      p('Meal at an Inexpensive Restaurant'),
      meal_midrange_restaurant_2people: p('Meal for Two at a Mid-Range Restaurant'),
      meal_fastfood_combo:              p("Combo Meal at McDonald"),
      beer_domestic_pint:               p('Domestic Draft Beer (1 Pint)'),
      cappuccino:                       p('Cappuccino'),
      // Markets
      milk_1l:             p('Milk (Regular'),
      bread_loaf:          p('Fresh White Bread'),
      eggs_12:             p('Eggs (12'),
      chicken_1lb:         p('Chicken Fillets'),
      apples_1lb:          p('Apples (1 lb)'),
      water_1_5l:          p('Bottled Water (50 oz'),
      wine_bottle_midrange: p('Bottle of Wine (Mid-Range)'),
      cigarettes_pack:     p('Cigarettes'),
      groceries_monthly:   0, // computed below from basket items
      // Transportation
      transport_one_way_ticket: p('One-Way Ticket'),
      monthly_transport_pass:   p('Monthly Public Transport Pass'),
      taxi_start:               p('Taxi Start'),
      gasoline_1l:              p('Gasoline (1 Liter)'),
      // Utilities
      utilities_monthly_basic: p('Basic Utilities'),
      mobile_plan:             p('Mobile Phone Plan'),
      internet_monthly:        p('60 Mbps'),
      // Leisure
      fitness_club_monthly: p('Fitness Club'),
      cinema_ticket:        p('Cinema'),
      // Economy
      avg_monthly_net_salary: p('Average Monthly Net Salary'),
      scrapedAt: new Date().toISOString(),
    }

    // Estimate monthly grocery spend from individual basket items (frugal student)
    // milk×4 + bread×4 + eggs×1.5 + chicken×6lb + apples×4lb + water×4 + wine×1 + misc€60
    if (benchmarks.milk_1l || benchmarks.bread_loaf || benchmarks.chicken_1lb) {
      benchmarks.groceries_monthly = Math.round(
        benchmarks.milk_1l * 4 +
        benchmarks.bread_loaf * 4 +
        benchmarks.eggs_12 * 1.5 +
        benchmarks.chicken_1lb * 6 +
        benchmarks.apples_1lb * 4 +
        benchmarks.water_1_5l * 4 +
        benchmarks.wine_bottle_midrange * 1 +
        60 // misc: pasta, rice, vegetables, sauces, oils
      )
    }

    await dynamo.send(new PutItemCommand({
      TableName: TABLE.costBenchmarks,
      Item: marshall(benchmarks, { removeUndefinedValues: true }),
    }))

    console.log('[scrape-cost-benchmarks] Saved benchmarks for', city, ':', benchmarks)
    return ok({ benchmarks })
  } catch (err: any) {
    clearTimeout(timeoutId)
    console.error('[scrape-cost-benchmarks] Error:', err)
    return fail(500, err?.message ?? 'Failed to scrape Numbeo')
  }
}

/**
 * GET /cost-benchmarks?city=Milan
 * Returns benchmarks for a specific city. Returns { benchmarks: null } if not scraped yet.
 */
async function handleGetCostBenchmarks(event: any): Promise<ApiResponse> {
  if (!TABLE.costBenchmarks) return ok({ benchmarks: null })
  const city = (event.queryStringParameters?.city || 'Milan').trim()
  const res = await dynamo.send(
    new GetItemCommand({ TableName: TABLE.costBenchmarks, Key: marshall({ city }) })
  )
  if (!res.Item) return ok({ benchmarks: null })
  return ok({ benchmarks: unmarshall(res.Item) })
}

/**
 * GET /cost-benchmarks/all
 * Returns all scraped city benchmarks (for admin comparison view).
 */
async function handleGetAllCostBenchmarks(): Promise<ApiResponse> {
  if (!TABLE.costBenchmarks) return ok({ benchmarks: [] })
  const items = await scanAll(TABLE.costBenchmarks)
  return ok({ benchmarks: items })
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

async function getFirecrawlApiKey(): Promise<string> {
  if (cachedFirecrawlApiKey) return cachedFirecrawlApiKey
  const secretName = process.env.FIRECRAWL_SECRET_NAME
  if (!secretName) throw new Error('FIRECRAWL_SECRET_NAME env var not set')

  const { SecretString } = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretName })
  )
  if (!SecretString) throw new Error('Firecrawl secret has no string value')

  const isJson = SecretString.trimStart().startsWith('{')
  let key: string
  if (isJson) {
    const parsed = JSON.parse(SecretString) as Record<string, unknown>
    key = (parsed.api_key ?? parsed.apiKey ?? parsed.key ?? Object.values(parsed)[0]) as string
  } else {
    key = SecretString.trim()
  }

  if (!key) throw new Error('Firecrawl API key resolved to empty string')
  cachedFirecrawlApiKey = key
  return cachedFirecrawlApiKey
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

// ─── Content System ───────────────────────────────────────────────────────────

/** Returns true if the caller is in the Cognito 'admin' group or provides the ADMIN_SECRET. */
function isAdminCaller(event: any): boolean {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret =
    event.queryStringParameters?.secret ||
    event.headers?.['x-admin-secret'] ||
    event.headers?.['X-Admin-Secret']
  const auth = event.requestContext?.authorizer || event.authorizer || {}
  const groups: string[] = (auth?.claims?.['cognito:groups'] || '').split(',').filter(Boolean)
  return groups.includes('admin') || !!(adminSecret && providedSecret === adminSecret)
}

/**
 * Rule engine: given all active modules and a user situation,
 * returns the matching modules sorted by stepNumber.
 *
 * - A rule field that is undefined on the module = wildcard (matches any value)
 * - Arrays in rule fields mean "any of these values"
 * - If the situation omits a field, the rule field is skipped (don't exclude on missing info)
 */
function evaluateModules(modules: ContentModule[], situation: UserSituation): ContentModule[] {
  const matchField = (
    ruleVal: string | string[] | boolean | undefined,
    situationVal: string | boolean | undefined,
  ): boolean => {
    if (ruleVal === undefined || situationVal === undefined) return true
    if (Array.isArray(ruleVal)) return ruleVal.includes(situationVal as string)
    return ruleVal === situationVal
  }

  const matched = modules.filter((m) => {
    if (m.active === false) return false
    const r = m.visibilityRules
    if (!r) return true
    return (
      matchField(r.destinationCountry, situation.destinationCountry) &&
      matchField(r.destinationCity,    situation.destinationCity) &&
      matchField(r.universityId,       situation.universityId) &&
      matchField(r.originEu,           situation.originEu) &&
      matchField(r.originCountry,      situation.originCountry) &&
      matchField(r.degreeType,         situation.degreeType)
    )
  })

  return matched.sort((a, b) => (a.stepNumber ?? 999) - (b.stepNumber ?? 999))
}

function buildSituationFromProfile(profile: Record<string, unknown>): UserSituation {
  const isEuCitizen = typeof profile.isEuCitizen === 'string' ? profile.isEuCitizen : undefined
  return {
    destinationCountry: typeof profile.destinationCountry === 'string' ? profile.destinationCountry : undefined,
    destinationCity: typeof profile.destinationCity === 'string' ? profile.destinationCity : undefined,
    universityId: typeof profile.destinationUniversity === 'string' ? profile.destinationUniversity : undefined,
    originEu: isEuCitizen === 'yes' ? true : isEuCitizen === 'no' ? false : undefined,
    originCountry:
      (typeof profile.nationality === 'string' ? profile.nationality : undefined) ||
      (typeof profile.residenceCountry === 'string' ? profile.residenceCountry : undefined),
    degreeType: typeof profile.degreeType === 'string' ? profile.degreeType : undefined,
  }
}

function toDashboardPlan(modules: ContentModule[]): Array<{
  moduleId: string
  label: string
  icon?: string
  description?: string
  stepNumber?: number
  route?: string
  stepType?: StepType
}> {
  return modules.map((m) => ({
    moduleId: m.moduleId,
    label: m.label,
    icon: m.icon,
    description: m.description,
    stepNumber: m.stepNumber,
    route: m.route,
    stepType: m.stepType,
  }))
}

async function recalculateDashboardPlansForAllUsers(): Promise<{
  updatedUsers: number
  skippedUsers: number
  modulesEvaluated: number
}> {
  const [allProfiles, allModulesRaw] = await Promise.all([
    scanAll(TABLE.profiles),
    scanAll(TABLE.contentModules),
  ])

  const allModules = allModulesRaw as unknown as ContentModule[]
  let updatedUsers = 0
  let skippedUsers = 0

  for (const profile of allProfiles) {
    const userId = typeof profile.userId === 'string' ? profile.userId : ''
    if (!userId) {
      skippedUsers++
      continue
    }

    const situation = buildSituationFromProfile(profile)
    const matched = evaluateModules(allModules, situation)
    const dashboardPlan = JSON.stringify(toDashboardPlan(matched))

    await dynamo.send(
      new UpdateItemCommand({
        TableName: TABLE.profiles,
        Key: marshall({ userId }),
        UpdateExpression: 'SET dashboardPlan = :plan, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':plan': dashboardPlan,
          ':updatedAt': new Date().toISOString(),
        }),
      })
    )

    updatedUsers++
  }

  return {
    updatedUsers,
    skippedUsers,
    modulesEvaluated: allModules.length,
  }
}

// ─ Content read handlers (any authenticated user) ─────────────────────────────

async function handleGetContentModules(event: any): Promise<ApiResponse> {
  if (!TABLE.contentModules) return fail(503, 'Content modules table not yet provisioned')
  const qp = event.queryStringParameters || {}
  const returnAll = qp.all === 'true' && isAdminCaller(event)
  const allModules = (await scanAll(TABLE.contentModules)) as unknown as ContentModule[]
  if (returnAll) return ok({ modules: allModules })
  const situation: UserSituation = {
    destinationCountry: qp.destinationCountry,
    destinationCity:    qp.destinationCity,
    universityId:       qp.universityId,
    originEu:           qp.originEu === 'true' ? true : qp.originEu === 'false' ? false : undefined,
    originCountry:      qp.originCountry,
    degreeType:         qp.degreeType,
  }
  const modules = evaluateModules(allModules, situation)
  return ok({ modules, situation })
}

async function handleGetContentCountries(): Promise<ApiResponse> {
  if (!TABLE.contentCountries) return fail(503, 'Content countries table not yet provisioned')
  const items = await scanAll(TABLE.contentCountries)
  items.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  return ok({ countries: items })
}

async function handleGetContentCountry(countryId: string): Promise<ApiResponse> {
  if (!TABLE.contentCountries) return fail(503, 'Content countries table not yet provisioned')
  const { Item } = await dynamo.send(
    new GetItemCommand({ TableName: TABLE.contentCountries, Key: marshall({ countryId }) })
  )
  if (!Item) return fail(404, `Country '${countryId}' not found`)
  return ok({ country: unmarshall(Item) })
}

async function handleGetContentCities(event: any): Promise<ApiResponse> {
  if (!TABLE.contentCities) return fail(503, 'Content cities table not yet provisioned')
  const countryId = event.queryStringParameters?.countryId
  const items = await scanAll(TABLE.contentCities)
  const filtered = countryId ? items.filter((c) => c.countryId === countryId) : items
  filtered.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  return ok({ cities: filtered })
}

async function handleGetContentCity(cityId: string): Promise<ApiResponse> {
  if (!TABLE.contentCities) return fail(503, 'Content cities table not yet provisioned')
  const { Item } = await dynamo.send(
    new GetItemCommand({ TableName: TABLE.contentCities, Key: marshall({ cityId }) })
  )
  if (!Item) return fail(404, `City '${cityId}' not found`)
  return ok({ city: unmarshall(Item) })
}

async function handleGetContentUniversities(event: any): Promise<ApiResponse> {
  if (!TABLE.contentUniversities) return fail(503, 'Content universities table not yet provisioned')
  const { cityId, countryId } = event.queryStringParameters || {}
  const items = await scanAll(TABLE.contentUniversities)
  const filtered = items.filter((u) => {
    if (cityId    && u.cityId    !== cityId)    return false
    if (countryId && u.countryId !== countryId) return false
    return true
  })
  filtered.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  return ok({ universities: filtered })
}

async function handleGetContentUniversity(universityId: string): Promise<ApiResponse> {
  if (!TABLE.contentUniversities) return fail(503, 'Content universities table not yet provisioned')
  const { Item } = await dynamo.send(
    new GetItemCommand({ TableName: TABLE.contentUniversities, Key: marshall({ universityId }) })
  )
  if (!Item) return fail(404, `University '${universityId}' not found`)
  return ok({ university: unmarshall(Item) })
}

async function handleGetContentNeighborhoods(cityId: string): Promise<ApiResponse> {
  if (!TABLE.contentNeighborhoods) return fail(503, 'Content neighborhoods table not yet provisioned')
  const { Items } = await dynamo.send(
    new QueryCommand({
      TableName: TABLE.contentNeighborhoods,
      KeyConditionExpression: 'cityId = :cid',
      ExpressionAttributeValues: marshall({ ':cid': cityId }),
    })
  )
  return ok({ neighborhoods: (Items ?? []).map((i) => unmarshall(i)) })
}

// ─ Admin content CRUD handlers ────────────────────────────────────────────────

// Origin Countries
async function handleAdminGetOriginCountries(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentOriginCountries) return fail(503, 'Origin countries table not yet provisioned')
  const items = await scanAll(TABLE.contentOriginCountries)
  items.sort((a: any, b: any) => (a.name as string).localeCompare(b.name as string))
  return ok({ originCountries: items })
}
async function handleAdminPostOriginCountry(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentOriginCountries) return fail(503, 'Origin countries table not yet provisioned')
  const body = parseBody(event)
  if (!body.name || typeof body.name !== 'string') return fail(400, 'name is required')
  const originCountryId = (body.originCountryId as string | undefined) || crypto.randomUUID()
  const item = { ...body, originCountryId, active: body.active !== false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentOriginCountries, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ originCountry: item }, 201)
}
async function handleAdminDeleteOriginCountry(event: any, originCountryId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentOriginCountries) return fail(503, 'Origin countries table not yet provisioned')
  await dynamo.send(new DeleteItemCommand({ TableName: TABLE.contentOriginCountries, Key: marshall({ originCountryId }) }))
  return ok({ message: 'Origin country deleted' })
}

// Countries
async function handleAdminGetCountries(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentCountries) return fail(503, 'Content countries table not yet provisioned')
  return ok({ countries: await scanAll(TABLE.contentCountries) })
}
async function handleAdminPostCountry(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentCountries) return fail(503, 'Content countries table not yet provisioned')
  const body = parseBody(event)
  if (!body.name || typeof body.name !== 'string') return fail(400, 'name is required')
  const countryId = (body.countryId as string | undefined) || crypto.randomUUID()
  const item = { ...body, countryId, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentCountries, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ country: item }, 201)
}
async function handleAdminPutCountry(event: any, countryId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentCountries) return fail(503, 'Content countries table not yet provisioned')
  const item = { ...parseBody(event), countryId, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentCountries, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ country: item })
}
async function handleAdminDeleteCountry(event: any, countryId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentCountries) return fail(503, 'Content countries table not yet provisioned')
  await dynamo.send(new DeleteItemCommand({ TableName: TABLE.contentCountries, Key: marshall({ countryId }) }))
  return ok({ message: 'Country deleted' })
}

// Cities
async function handleAdminGetCities(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentCities) return fail(503, 'Content cities table not yet provisioned')
  return ok({ cities: await scanAll(TABLE.contentCities) })
}
async function handleAdminPostCity(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentCities) return fail(503, 'Content cities table not yet provisioned')
  const body = parseBody(event)
  if (!body.countryId || typeof body.countryId !== 'string') return fail(400, 'countryId is required')
  if (!body.name      || typeof body.name      !== 'string') return fail(400, 'name is required')
  const cityId = (body.cityId as string | undefined) || crypto.randomUUID()
  const item = { ...body, cityId, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentCities, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ city: item }, 201)
}
async function handleAdminPutCity(event: any, cityId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentCities) return fail(503, 'Content cities table not yet provisioned')
  const item = { ...parseBody(event), cityId, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentCities, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ city: item })
}
async function handleAdminDeleteCity(event: any, cityId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentCities) return fail(503, 'Content cities table not yet provisioned')
  await dynamo.send(new DeleteItemCommand({ TableName: TABLE.contentCities, Key: marshall({ cityId }) }))
  return ok({ message: 'City deleted' })
}

// Universities
async function handleAdminGetUniversities(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentUniversities) return fail(503, 'Content universities table not yet provisioned')
  return ok({ universities: await scanAll(TABLE.contentUniversities) })
}
async function handleAdminPostUniversity(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentUniversities) return fail(503, 'Content universities table not yet provisioned')
  const body = parseBody(event)
  if (!body.name   || typeof body.name   !== 'string') return fail(400, 'name is required')
  if (!body.cityId || typeof body.cityId !== 'string') return fail(400, 'cityId is required')
  const universityId = (body.universityId as string | undefined) || crypto.randomUUID()
  const item = { ...body, universityId, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentUniversities, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ university: item }, 201)
}
async function handleAdminPutUniversity(event: any, universityId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentUniversities) return fail(503, 'Content universities table not yet provisioned')
  const item = { ...parseBody(event), universityId, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentUniversities, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ university: item })
}
async function handleAdminDeleteUniversity(event: any, universityId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentUniversities) return fail(503, 'Content universities table not yet provisioned')
  await dynamo.send(new DeleteItemCommand({ TableName: TABLE.contentUniversities, Key: marshall({ universityId }) }))
  return ok({ message: 'University deleted' })
}

// Neighborhoods
async function handleAdminPostNeighborhood(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentNeighborhoods) return fail(503, 'Content neighborhoods table not yet provisioned')
  const body = parseBody(event)
  if (!body.cityId         || typeof body.cityId         !== 'string') return fail(400, 'cityId is required')
  if (!body.neighborhoodId || typeof body.neighborhoodId !== 'string') return fail(400, 'neighborhoodId is required')
  if (!body.name           || typeof body.name           !== 'string') return fail(400, 'name is required')
  const item = { ...body, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentNeighborhoods, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ neighborhood: item }, 201)
}
async function handleAdminPutNeighborhood(event: any, neighborhoodId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentNeighborhoods) return fail(503, 'Content neighborhoods table not yet provisioned')
  const body = parseBody(event)
  if (!body.cityId || typeof body.cityId !== 'string') return fail(400, 'cityId is required in body')
  const item = { ...body, neighborhoodId, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentNeighborhoods, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ neighborhood: item })
}
async function handleAdminDeleteNeighborhood(event: any, neighborhoodId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentNeighborhoods) return fail(503, 'Content neighborhoods table not yet provisioned')
  const body = parseBody(event)
  if (!body.cityId || typeof body.cityId !== 'string') return fail(400, 'cityId is required in body')
  await dynamo.send(new DeleteItemCommand({
    TableName: TABLE.contentNeighborhoods,
    Key: marshall({ cityId: body.cityId, neighborhoodId }),
  }))
  return ok({ message: 'Neighborhood deleted' })
}

// Modules
async function handleAdminGetModules(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentModules) return fail(503, 'Content modules table not yet provisioned')
  const items = await scanAll(TABLE.contentModules)
  items.sort((a, b) => (Number(a.stepNumber) || 999) - (Number(b.stepNumber) || 999))
  return ok({ modules: items })
}
async function handleAdminPostModule(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentModules) return fail(503, 'Content modules table not yet provisioned')
  const body = parseBody(event)
  if (!body.moduleId || typeof body.moduleId !== 'string') return fail(400, 'moduleId is required')
  if (!body.label || typeof body.label !== 'string') return fail(400, 'label is required')
  const moduleId = (body.moduleId as string | undefined) || crypto.randomUUID()
  const item = {
    moduleId,
    label:           body.label,
    icon:            body.icon,
    description:     body.description,
    stepNumber:      body.stepNumber,
    visibilityRules: body.visibilityRules || {},
    active:          body.active !== false,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentModules, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ module: item }, 201)
}
async function handleAdminPutModule(event: any, moduleId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentModules) return fail(503, 'Content modules table not yet provisioned')
  const item = { ...parseBody(event), moduleId, updatedAt: new Date().toISOString() }
  await dynamo.send(new PutItemCommand({ TableName: TABLE.contentModules, Item: marshall(item, { removeUndefinedValues: true }) }))
  return ok({ module: item })
}
async function handleAdminDeleteModule(event: any, moduleId: string): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentModules) return fail(503, 'Content modules table not yet provisioned')
  await dynamo.send(new DeleteItemCommand({ TableName: TABLE.contentModules, Key: marshall({ moduleId }) }))
  return ok({ message: 'Module deleted' })
}

async function handleAdminPostRecalculateDashboardPlans(event: any): Promise<ApiResponse> {
  if (!isAdminCaller(event)) return fail(403, 'Forbidden')
  if (!TABLE.contentModules) return fail(503, 'Content modules table not yet provisioned')
  if (!TABLE.profiles) return fail(503, 'Profiles table not yet provisioned')

  const result = await recalculateDashboardPlansForAllUsers()
  return ok({
    message: 'Dashboard plans recalculated for existing users',
    ...result,
    recalculatedAt: new Date().toISOString(),
  })
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
    if (method === 'POST' && path === '/admin/send-deadline-reminders') return await handlePostAdminSendDeadlineReminders(event)
    if (method === 'POST' && path === '/admin/scrape-deadlines') return await handlePostAdminScrapeDeadlines(event)
    if (method === 'POST' && path === '/admin/scrape-cost-benchmarks') return await handlePostAdminScrapeCostBenchmarks(event)
    if (method === 'GET'  && path === '/cost-benchmarks') return await handleGetCostBenchmarks(event)
    if (method === 'GET'  && path === '/cost-benchmarks/all') return await handleGetAllCostBenchmarks()
    if (method === 'GET'  && path === '/chat')             return await handleGetChat(userId)
    if (method === 'POST' && path === '/chat')             return await handlePostChat(userId, event)

    // ─ Content read routes (any authenticated user) ──────────────────────────────────
    if (method === 'GET' && path === '/content/modules')       return await handleGetContentModules(event)
    if (method === 'GET' && path === '/content/countries')     return await handleGetContentCountries()
    if (method === 'GET' && path === '/content/cities')        return await handleGetContentCities(event)
    if (method === 'GET' && path === '/content/universities')  return await handleGetContentUniversities(event)
    const contentCountryMatch      = path.match(/^\/content\/countries\/([^/]+)$/)
    const contentCityMatch         = path.match(/^\/content\/cities\/([^/]+)$/)
    const contentUniversityMatch   = path.match(/^\/content\/universities\/([^/]+)$/)
    const contentNeighborhoodMatch = path.match(/^\/content\/neighborhoods\/([^/]+)$/)
    if (method === 'GET' && contentCountryMatch)      return await handleGetContentCountry(contentCountryMatch[1])
    if (method === 'GET' && contentCityMatch)         return await handleGetContentCity(contentCityMatch[1])
    if (method === 'GET' && contentUniversityMatch)   return await handleGetContentUniversity(contentUniversityMatch[1])
    if (method === 'GET' && contentNeighborhoodMatch) return await handleGetContentNeighborhoods(contentNeighborhoodMatch[1])

    // ─ Admin content CRUD routes ───────────────────────────────────────────────────
    if (method === 'GET'  && path === '/admin/content/origin-countries') return await handleAdminGetOriginCountries(event)
    if (method === 'POST' && path === '/admin/content/origin-countries') return await handleAdminPostOriginCountry(event)
    const adminOriginCountryMatch = path.match(/^\/admin\/content\/origin-countries\/([^/]+)$/)
    if (method === 'DELETE' && adminOriginCountryMatch) return await handleAdminDeleteOriginCountry(event, adminOriginCountryMatch[1])
    if (method === 'GET'  && path === '/admin/content/countries')    return await handleAdminGetCountries(event)
    if (method === 'POST' && path === '/admin/content/countries')    return await handleAdminPostCountry(event)
    if (method === 'GET'  && path === '/admin/content/cities')       return await handleAdminGetCities(event)
    if (method === 'POST' && path === '/admin/content/cities')       return await handleAdminPostCity(event)
    if (method === 'GET'  && path === '/admin/content/universities') return await handleAdminGetUniversities(event)
    if (method === 'POST' && path === '/admin/content/universities') return await handleAdminPostUniversity(event)
    if (method === 'POST' && path === '/admin/content/neighborhoods') return await handleAdminPostNeighborhood(event)
    if (method === 'GET'  && path === '/admin/content/modules')      return await handleAdminGetModules(event)
    if (method === 'POST' && path === '/admin/content/modules')      return await handleAdminPostModule(event)
    if (method === 'POST' && path === '/admin/content/recalculate-dashboard-plans') return await handleAdminPostRecalculateDashboardPlans(event)
    const adminCountryMatch      = path.match(/^\/admin\/content\/countries\/([^/]+)$/)
    const adminCityMatch         = path.match(/^\/admin\/content\/cities\/([^/]+)$/)
    const adminUniversityMatch   = path.match(/^\/admin\/content\/universities\/([^/]+)$/)
    const adminNeighborhoodMatch = path.match(/^\/admin\/content\/neighborhoods\/([^/]+)$/)
    const adminModuleMatch       = path.match(/^\/admin\/content\/modules\/([^/]+)$/)
    if (method === 'PUT'    && adminCountryMatch)      return await handleAdminPutCountry(event, adminCountryMatch[1])
    if (method === 'DELETE' && adminCountryMatch)      return await handleAdminDeleteCountry(event, adminCountryMatch[1])
    if (method === 'PUT'    && adminCityMatch)         return await handleAdminPutCity(event, adminCityMatch[1])
    if (method === 'DELETE' && adminCityMatch)         return await handleAdminDeleteCity(event, adminCityMatch[1])
    if (method === 'PUT'    && adminUniversityMatch)   return await handleAdminPutUniversity(event, adminUniversityMatch[1])
    if (method === 'DELETE' && adminUniversityMatch)   return await handleAdminDeleteUniversity(event, adminUniversityMatch[1])
    if (method === 'PUT'    && adminNeighborhoodMatch) return await handleAdminPutNeighborhood(event, adminNeighborhoodMatch[1])
    if (method === 'DELETE' && adminNeighborhoodMatch) return await handleAdminDeleteNeighborhood(event, adminNeighborhoodMatch[1])
    if (method === 'PUT'    && adminModuleMatch)       return await handleAdminPutModule(event, adminModuleMatch[1])
    if (method === 'DELETE' && adminModuleMatch)       return await handleAdminDeleteModule(event, adminModuleMatch[1])

    console.error(`[Handler] No route matched for ${method} ${path}`)
    return fail(404, 'Not found')
  } catch (error) {
    console.error(`${method} ${path} error:`, error)
    return fail(500, 'Internal server error')
  }
}
