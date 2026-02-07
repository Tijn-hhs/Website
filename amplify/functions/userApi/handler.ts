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
    const response = await dynamoClient.send(new GetItemCommand(params))
    if (response.Item) {
      return unmarshall(response.Item) as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
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
    await dynamoClient.send(new PutItemCommand(params))
  } catch (error) {
    console.error('Error saving user profile:', error)
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

  // Handle CORS preflight
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'OK' }),
    }
  }

  // Extract userId from Cognito claims
  const authorizer = event.requestContext.authorizer

  if (!authorizer || !authorizer.claims) {
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Unauthorized' }),
    }
  }

  const userId = authorizer.claims.sub

  const method = event.requestContext.http.method
  const path = event.requestContext.http.path

  try {
    // GET /user/me - get user profile and progress
    if (method === 'GET' && path === '/user/me') {
      const profile = await getUserProfile(userId)
      const progress = await getUserProgress(userId)

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
          profile: profile || {},
          progress: progress || [],
        }),
      }
    }

    // PUT /user/me - save user profile
    if (method === 'PUT' && path === '/user/me') {
      const body = JSON.parse(event.body || '{}')
      await saveUserProfile(userId, body)

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

    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    }
  }
}
