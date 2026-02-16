import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const dynamoClient = new DynamoDBClient({})
const sesClient = new SESClient({})

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
  // Cost of Living detailed breakdown
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

interface ApiResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const params = {
    TableName: process.env.USER_PROFILE_TABLE_NAME || 'UserProfileTable',
    Key: marshall({ userId }),
  }

  try {
    console.log('Getting user profile for userId:', userId, 'from table:', params.TableName)
    const response = await dynamoClient.send(new GetItemCommand(params))
    
    if (response.Item) {
      const rawItem = unmarshall(response.Item)
      
      console.log('RAW unmarshalled item from DynamoDB:', {
        userId,
        rawKeys: Object.keys(rawItem),
        rawKeyCount: Object.keys(rawItem).length,
        rawSample: {
          destinationCountry: rawItem.destinationCountry,
          universityName: rawItem.universityName,
          studyLevel: rawItem.studyLevel,
          nationality: rawItem.nationality,
        },
        firstFewKeys: Object.keys(rawItem).slice(0, 10),
        rawItemStringLength: JSON.stringify(rawItem).length,
      })
      
      // IMPORTANT: Exclude system fields (userId, updatedAt) from the profile
      // These should not be returned to the client or they'll be re-saved
      const { userId: _, updatedAt: __, ...profile } = rawItem
      
      console.log('Retrieved profile from DynamoDB (after removing system fields):', {
        userId,
        hasItem: true,
        keys: Object.keys(profile || {}),
        keyCount: Object.keys(profile || {}).length,
        nonEmptyKeys: Object.keys(profile).filter(k => profile[k as keyof UserProfile] !== undefined && profile[k as keyof UserProfile] !== ''),
        sampleFields: {
          destinationCountry: profile.destinationCountry,
          universityName: profile.universityName,
          studyLevel: profile.studyLevel,
          nationality: profile.nationality,
          monthlyBudget: profile.monthlyBudget,
        },
      })
      return profile as UserProfile
    }
    
    console.log('No profile found for userId:', userId)
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    console.error('GetItem error details:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      tableName: params.TableName,
    })
    throw error
  }
}

async function saveUserProfile(userId: string, profileUpdates: UserProfile): Promise<void> {
  try {
    // CRITICAL: Validate that profileUpdates is actually an object
    console.log('saveUserProfile - validating input:', {
      userId,
      profileUpdatesType: typeof profileUpdates,
      isArray: Array.isArray(profileUpdates),
      isNull: profileUpdates === null,
      isUndefined: profileUpdates === undefined,
    })
    
    if (!profileUpdates || typeof profileUpdates !== 'object' || Array.isArray(profileUpdates)) {
      console.error('Invalid profileUpdates type:', {
        type: typeof profileUpdates,
        isArray: Array.isArray(profileUpdates),
        value: profileUpdates,
      })
      throw new Error('profileUpdates must be a non-array object')
    }
    
    console.log('Saving user profile to DynamoDB:', {
      userId,
      tableName: process.env.USER_PROFILE_TABLE_NAME,
      profileKeys: Object.keys(profileUpdates || {}),
      keyCount: Object.keys(profileUpdates || {}).length,
      nonEmptyKeys: Object.keys(profileUpdates).filter(k => profileUpdates[k as keyof UserProfile] !== undefined && profileUpdates[k as keyof UserProfile] !== ''),
      sampleFields: {
        destinationCountry: profileUpdates.destinationCountry,
        universityName: profileUpdates.universityName,
        studyLevel: profileUpdates.studyLevel,
        nationality: profileUpdates.nationality,
        monthlyBudget: profileUpdates.monthlyBudget,
      },
    })
    
    // CRITICAL: Get existing profile first and merge with updates
    // This prevents overwriting fields that aren't in the update
    let existingProfile: Record<string, any> = {}
    const getParams = {
      TableName: process.env.USER_PROFILE_TABLE_NAME || 'UserProfileTable',
      Key: marshall({ userId }),
    }
    
    try {
      const getResponse = await dynamoClient.send(new GetItemCommand(getParams))
      if (getResponse.Item) {
        const rawItem = unmarshall(getResponse.Item)
        // Exclude system fields
        const { userId: _, updatedAt: __, ...existing } = rawItem
        existingProfile = existing
        console.log('Found existing profile, will merge updates:', {
          existingFieldCount: Object.keys(existingProfile).length,
          existingFields: Object.keys(existingProfile),
        })
      } else {
        console.log('No existing profile found, will create new one')
      }
    } catch (getError) {
      console.warn('Failed to fetch existing profile, will use updates only:', getError)
      // Continue with empty existingProfile - we'll just save the updates
    }
    
    // Merge existing with updates (updates take precedence)
    const mergedProfile = { ...existingProfile, ...profileUpdates }
    
    console.log('After merge:', {
      mergedFieldCount: Object.keys(mergedProfile).length,
      mergedFields: Object.keys(mergedProfile),
      sampleMergedValues: {
        destinationCountry: mergedProfile.destinationCountry,
        universityName: mergedProfile.universityName,
        studyLevel: mergedProfile.studyLevel,
      },
    })
    
    // Remove any fields that are explicitly set to empty string or undefined
    // but keep false and 0 values
    const cleanedProfile: Record<string, any> = {}
    Object.entries(mergedProfile).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedProfile[key] = value
      }
    })
    
    console.log('After cleaning:', {
      cleanedFieldCount: Object.keys(cleanedProfile).length,
      cleanedFields: Object.keys(cleanedProfile),
      sampleCleanedValues: {
        destinationCountry: cleanedProfile.destinationCountry,
        universityName: cleanedProfile.universityName,
        studyLevel: cleanedProfile.studyLevel,
      },
    })
    
    const putParams = {
      TableName: process.env.USER_PROFILE_TABLE_NAME || 'UserProfileTable',
      Item: marshall({
        userId,
        ...cleanedProfile,
        updatedAt: new Date().toISOString(),
      }),
    }
    
    console.log('Saving to DynamoDB with item:', {
      userId,
      fieldCount: Object.keys(cleanedProfile).length + 2, // +2 for userId and updatedAt
      fields: ['userId', ...Object.keys(cleanedProfile), 'updatedAt'],
    })
    
    await dynamoClient.send(new PutItemCommand(putParams))
    
    console.log('✓ Successfully saved profile to DynamoDB for userId:', userId)
  } catch (error) {
    console.error('✗ Error saving user profile:', error)
    console.error('PutItem error details:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      tableName: process.env.USER_PROFILE_TABLE_NAME,
      profileKeysAttempted: Object.keys(profileUpdates || {}),
    })
    throw error
  }
}

async function getUserProgress(userId: string): Promise<StepProgress[]> {
  const params = {
    TableName: process.env.USER_PROGRESS_TABLE_NAME || 'UserProgressTable',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: marshall({
      ':userId': userId,
    }),
  }

  try {
    const response = await dynamoClient.send(new QueryCommand(params))
    if (response.Items) {
      return response.Items.map((item) => unmarshall(item) as StepProgress)
    }
    return []
  } catch (error) {
    console.error('Error getting user progress:', error)
    throw error
  }
}

async function saveStepProgress(
  userId: string,
  stepKey: string,
  completed: boolean
): Promise<void> {
  const params = {
    TableName: process.env.USER_PROGRESS_TABLE_NAME || 'UserProgressTable',
    Item: marshall({
      userId,
      stepKey,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    }),
  }

  try {
    await dynamoClient.send(new PutItemCommand(params))
  } catch (error) {
    console.error('Error saving step progress:', error)
    throw error
  }
}

async function saveFeedback(userId: string, message: string): Promise<void> {
  const feedbackId = uuidv4()
  const timestamp = Date.now()
  
  const params = {
    TableName: process.env.FEEDBACK_TABLE_NAME || 'FeedbackTable',
    Item: marshall({
      feedbackId,
      userId,
      message,
      timestamp,
      createdAt: new Date().toISOString(),
    }),
  }

  try {
    await dynamoClient.send(new PutItemCommand(params))
    console.log('Feedback saved to DynamoDB:', { feedbackId, userId })
  } catch (error) {
    console.error('Error saving feedback to DynamoDB:', error)
    throw error
  }
}

async function sendFeedbackEmail(userId: string, message: string): Promise<void> {
  const feedbackEmail = process.env.FEEDBACK_EMAIL || 'tijn@eendenburg.eu'
  
  console.log('Attempting to send feedback email to:', feedbackEmail)
  
  const emailParams = {
    Source: feedbackEmail,
    Destination: {
      ToAddresses: [feedbackEmail],
    },
    Message: {
      Subject: {
        Data: `[LiveCity Feedback] New user feedback from ${userId}`,
      },
      Body: {
        Text: {
          Data: `User ID: ${userId}\n\nFeedback Message:\n${message}`,
        },
      },
    },
  }

  try {
    const result = await sesClient.send(new SendEmailCommand(emailParams))
    console.log('✅ Feedback email sent successfully to:', feedbackEmail, 'MessageId:', result.$metadata?.requestId)
  } catch (error) {
    console.error('❌ Error sending feedback email:', {
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode: (error as any)?.Code || 'No error code',
      feedbackEmail,
      userId,
    })
    // Don't throw - we want to keep the feedback even if email fails
    console.log('Feedback was saved to database despite email delivery issue. Check SES settings.')
  }
}

export async function handler(event: any): Promise<ApiResponse> {
  console.log('Event:', event)

  // Determine API Gateway version and extract method and path accordingly
  const isHttpApi = !!event.requestContext?.http
  const method = isHttpApi 
    ? event.requestContext.http.method 
    : event.requestContext?.httpMethod || event.httpMethod || 'UNKNOWN'
  const path = isHttpApi 
    ? event.requestContext.http.path 
    : event.requestContext?.resourcePath || event.path || event.rawPath || 'UNKNOWN'

  console.log('API Gateway version:', isHttpApi ? 'HTTP API (v2)' : 'REST API (v1)')
  console.log('Method:', method)
  console.log('Path:', path)

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'OK' }),
    }
  }

  // Check if this is a feedback endpoint (doesn't require authentication)
  if (method === 'POST' && path === '/feedback') {
    let body
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {})
    } catch (parseError) {
      console.error('Error parsing feedback request body:', parseError, 'Raw body:', event.body)
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      }
    }

    const { message } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Message is required and must be a non-empty string' }),
      }
    }

    // Use 'guest' as userId for unauthenticated users
    const feedbackUserId = 'guest-' + Date.now()

    try {
      // Save feedback to database and send email in parallel
      await Promise.all([
        saveFeedback(feedbackUserId, message.trim()),
        sendFeedbackEmail(feedbackUserId, message.trim()),
      ])

      console.log('POST /feedback - Feedback processed successfully for userId:', feedbackUserId)
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Feedback received and will be processed' }),
      }
    } catch (feedbackError) {
      console.error('POST /feedback - Error processing feedback:', feedbackError)
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          error: feedbackError instanceof Error ? feedbackError.message : 'Failed to process feedback',
        }),
      }
    }
  }

  // Extract userId from Cognito claims for other authenticated endpoints
  // Note: REST API v1 with Cognito authorizer puts claims directly on authorizer object
  // HTTP API v2 puts them under authorizer.claims
  const authorizer = event.requestContext?.authorizer || event.authorizer

  // For REST API v1: authorizer.sub
  // For HTTP API v2 or others: authorizer.claims.sub
  let userId = authorizer?.sub || authorizer?.claims?.sub

  console.log('Authorizer structure:', {
    hasAuthorizer: !!authorizer,
    hasDirectSub: !!authorizer?.sub,
    hasClaimsSub: !!authorizer?.claims?.sub,
    extractedUserId: userId,
    authorizerKeys: authorizer ? Object.keys(authorizer) : [],
  })

  if (!userId) {
    console.log('Authorization check failed: Could not extract userId')
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Unauthorized - userId not found' }),
    }
  }

  console.log('Authenticated user:', userId)

  try {
    // GET /user/me - get user profile and progress
    if (method === 'GET' && path === '/user/me') {
      console.log('GET /user/me - fetching profile for userId:', userId)
      const profile = await getUserProfile(userId)
      const progress = await getUserProgress(userId)

      const response = {
        profile: profile || {},
        progress: progress || [],
      }

      console.log('GET /user/me - returning response:', {
        hasProfile: !!profile,
        profileKeys: Object.keys(response.profile).length,
        progressItems: response.progress.length,
        sampleProfileFields: {
          destinationCountry: response.profile.destinationCountry,
          universityName: response.profile.universityName,
          studyLevel: response.profile.studyLevel,
        },
        responseStringLength: JSON.stringify(response).length,
      })
      
      const responseBody = JSON.stringify(response)
      console.log('GET /user/me - response body preview:', responseBody.substring(0, 500))

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: responseBody,
      }
    }

    // PUT /user/me - save user profile
    if (method === 'PUT' && path === '/user/me') {
      let body
      try {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {})
      } catch (parseError) {
        console.error('Error parsing request body:', parseError, 'Raw body:', event.body)
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Invalid JSON in request body' }),
        }
      }
      
      console.log('PUT /user/me - received request for userId:', userId)
      console.log('PUT /user/me - received body structure:', {
        keys: Object.keys(body || {}),
        keyCount: Object.keys(body || {}).length,
        nonEmptyKeys: Object.keys(body).filter(k => body[k] !== undefined && body[k] !== ''),
        bodyDataLength: JSON.stringify(body).length,
        bodyType: typeof body,
        bodyIsArray: Array.isArray(body),
        sampleFields: {
          destinationCountry: body.destinationCountry,
          universityName: body.universityName,
          studyLevel: body.studyLevel,
          nationality: body.nationality,
        },
      })
      
      try {
        await saveUserProfile(userId, body)
        console.log('PUT /user/me - profile saved successfully for userId:', userId)
      } catch (saveError) {
        console.error('PUT /user/me - Error saving profile:', saveError)
        return {
          statusCode: 500,
          headers: corsHeaders(),
          body: JSON.stringify({ 
            error: saveError instanceof Error ? saveError.message : 'Failed to save profile',
            details: saveError instanceof Error ? saveError.stack : String(saveError)
          }),
        }
      }

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Profile saved' }),
      }
    }

    // PUT /progress - save step progress
    if (method === 'PUT' && path === '/progress') {
      const body = JSON.parse(event.body || '{}')
      const { stepKey, completed } = body

      if (!stepKey) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'stepKey is required' }),
        }
      }

      await saveStepProgress(userId, stepKey, completed)

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Progress saved' }),
      }
    }

    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Not found' }),
    }
  } catch (error) {
    console.error('Handler error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    }
  }
}
