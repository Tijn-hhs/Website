import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb'

const dynamoClient = new DynamoDBClient({})

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
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
      const profile = unmarshall(response.Item) as UserProfile
      console.log('Retrieved profile from DynamoDB:', {
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
      return profile
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

async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const params = {
    TableName: process.env.USER_PROFILE_TABLE_NAME || 'UserProfileTable',
    Item: marshall({
      userId,
      ...profile,
      updatedAt: new Date().toISOString(),
    }),
  }

  try {
    console.log('Saving user profile to DynamoDB:', {
      userId,
      tableName: params.TableName,
      profileKeys: Object.keys(profile || {}),
      keyCount: Object.keys(profile || {}).length,
      nonEmptyKeys: Object.keys(profile).filter(k => profile[k as keyof UserProfile] !== undefined && profile[k as keyof UserProfile] !== ''),
      marshalledItemSize: JSON.stringify(params.Item).length,
      sampleFields: {
        destinationCountry: profile.destinationCountry,
        universityName: profile.universityName,
        studyLevel: profile.studyLevel,
        nationality: profile.nationality,
        monthlyBudget: profile.monthlyBudget,
      },
    })
    
    await dynamoClient.send(new PutItemCommand(params))
    
    console.log('✓ Successfully saved profile to DynamoDB for userId:', userId)
  } catch (error) {
    console.error('✗ Error saving user profile:', error)
    console.error('PutItem error details:', {
      message: error instanceof Error ? error.message : String(error),
      userId,
      tableName: params.TableName,
      profileKeysAttempted: Object.keys(profile || {}),
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

  // Extract userId from Cognito claims
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
      })

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(response),
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
        sampleFields: {
          destinationCountry: body.destinationCountry,
          universityName: body.universityName,
          studyLevel: body.studyLevel,
          nationality: body.nationality,
        },
      })
      
      await saveUserProfile(userId, body)
      
      console.log('PUT /user/me - profile saved successfully for userId:', userId)

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
