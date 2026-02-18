# API Reference - Student Hub (Leavs)

> **Complete REST API endpoint documentation**  
> Last updated: February 18, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Common Response Codes](#common-response-codes)
5. [Endpoints](#endpoints)
   - [User Profile](#user-profile)
   - [Progress Tracking](#progress-tracking)
   - [Deadlines](#deadlines)
   - [Feedback](#feedback)
6. [Error Responses](#error-responses)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

---

## Overview

The Leavs API is a REST API that provides access to user profiles, progress tracking, deadlines, and feedback functionality. The API uses JSON for request and response bodies.

**API Type**: REST API  
**Protocol**: HTTPS only  
**Format**: JSON  
**Authentication**: AWS Cognito JWT tokens

---

## Base URL

The API base URL is dynamically generated per environment and included in `amplify_outputs.json`:

```json
{
  "custom": {
    "API": {
      "endpoint": "https://{api-id}.execute-api.eu-north-1.amazonaws.com/prod/",
      "region": "eu-north-1",
      "apiName": "leavsRest"
    }
  }
}
```

**Example Base URLs**:
- **Production**: `https://abc123.execute-api.eu-north-1.amazonaws.com/prod/`
- **Sandbox**: `https://xyz789.execute-api.eu-north-1.amazonaws.com/sandbox/`

**Region**: `eu-north-1` (Stockholm, Sweden)

---

## Authentication

### Overview

All endpoints except `/feedback` require authentication via AWS Cognito JWT tokens.

### Obtaining Tokens

1. **Sign In** using AWS Amplify SDK:
   ```javascript
   import { signIn } from 'aws-amplify/auth'
   
   const { isSignedIn, nextStep } = await signIn({
     username: 'user@example.com',
     password: 'password123'
   })
   ```

2. **Get Current Session**:
   ```javascript
   import { fetchAuthSession } from 'aws-amplify/auth'
   
   const session = await fetchAuthSession()
   const idToken = session.tokens?.idToken?.toString()
   ```

### Using Tokens

Include the ID token in the `Authorization` header:

```http
Authorization: Bearer eyJraWQiOiJ...{long JWT token}...
```

### Token Claims

The JWT token contains important claims:
```json
{
  "sub": "abc-123-def-456",  // User ID (used by API)
  "email": "user@example.com",
  "cognito:username": "user@example.com",
  "exp": 1708272000,         // Expiration timestamp
  "iat": 1708268400          // Issued at timestamp
}
```

**Key Claim**: `sub` (subject) - This is the `userId` used throughout the API.

### Token Expiration

- **Lifetime**: 1 hour (default)
- **Refresh**: Automatically handled by Amplify SDK
- **Expired Token**: Returns `401 Unauthorized`

---

## Common Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource successfully created |
| `400` | Bad Request | Invalid request body or parameters |
| `401` | Unauthorized | Missing or invalid authentication token |
| `404` | Not Found | Endpoint or resource not found |
| `500` | Internal Server Error | Server error (check CloudWatch logs) |

---

## Endpoints

### User Profile

#### Get User Profile and Progress

Retrieves the authenticated user's profile and progress data.

```http
GET /user/me
```

**Authentication**: Required

**Request Headers**:
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "nationality": "USA",
    "dateOfBirth": "2000-01-15",
    "destinationCountry": "Italy",
    "destinationCity": "Milan",
    "universityName": "Bocconi University",
    "programName": "Master in Finance",
    "studyLevel": "Master",
    "startDate": "2024-09-01",
    "admissionStatus": "accepted",
    "visaType": "Student Visa (Type D)",
    "passportExpiry": "2030-12-31",
    "monthlyBudget": "1200",
    "budgetCurrency": "EUR",
    "housingType": "Student Residence",
    "rentCost": 600,
    "transportCost": 50,
    "groceriesCost": 250
  },
  "progress": [
    {
      "stepKey": "visa",
      "completed": true,
      "completedAt": "2024-02-15T10:30:00Z",
      "started": true,
      "startedAt": "2024-02-14T14:20:00Z"
    },
    {
      "stepKey": "housing",
      "completed": false,
      "started": true,
      "startedAt": "2024-02-16T09:00:00Z"
    }
  ]
}
```

**Profile Fields** (all optional):

| Field | Type | Description |
|-------|------|-------------|
| `firstName` | String | User's first name |
| `lastName` | String | User's last name |
| `nationality` | String | Country of citizenship |
| `dateOfBirth` | String (ISO date) | Birth date |
| `destinationCountry` | String | Study destination country |
| `destinationCity` | String | Study destination city |
| `universityName` | String | University name |
| `programName` | String | Study program name |
| `studyLevel` | String | bachelor, master, phd, exchange |
| `startDate` | String (ISO date) | Program start date |
| `admissionStatus` | String | exploring, applying, accepted, enrolled |
| `visaType` | String | Type of visa |
| `passportExpiry` | String (ISO date) | Passport expiration date |
| `visaAppointmentDate` | String (ISO date) | Visa appointment date |
| `travelDate` | String (ISO date) | Planned travel date |
| `flightsBooked` | Boolean | Whether flights are booked |
| `packingNotes` | String | Notes about packing |
| `registrationStatus` | String | Registration status notes |
| `residencePermitNeeded` | Boolean | Whether residence permit needed |
| `accommodationType` | String | Type of accommodation |
| `housingBudget` | String | Housing budget |
| `leaseStart` | String (ISO date) | Lease start date |
| `bankAccountNeeded` | Boolean | Whether bank account needed |
| `insuranceProvider` | String | Insurance provider name |
| `legalDocsReady` | Boolean | Whether legal documents ready |
| `healthCoverage` | String | Health coverage details |
| `doctorPreference` | String | Doctor preferences |
| `arrivalDate` | String (ISO date) | Actual arrival date |
| `localTransport` | String | Local transport notes |
| `dailyLifeNotes` | String | General daily life notes |
| `monthlyBudget` | String | Monthly budget amount |
| `budgetCurrency` | String | Budget currency (EUR, USD, etc.) |
| `budgetingNotes` | String | Budgeting notes |
| `communityInterest` | String | Community interests |
| `supportNeeds` | String | Support needs description |
| `housingType` | String | Type of housing |
| `rentCost` | Number | Monthly rent cost |
| `utilitiesCost` | Number | Monthly utilities cost |
| `internetCost` | Number | Monthly internet cost |
| `mobileCost` | Number | Monthly mobile cost |
| `transportCost` | Number | Monthly transport cost |
| `groceriesCost` | Number | Monthly groceries cost |
| `diningOutCost` | Number | Monthly dining out cost |
| `entertainmentCost` | Number | Monthly entertainment cost |
| `clothingCost` | Number | Monthly clothing cost |
| `personalCareCost` | Number | Monthly personal care cost |
| `booksCost` | Number | Monthly books cost |

**Progress Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `stepKey` | String | Unique step identifier (e.g., 'visa', 'housing') |
| `completed` | Boolean | Whether step is completed |
| `completedAt` | String (ISO timestamp) | When step was completed |
| `started` | Boolean | Whether step was started |
| `startedAt` | String (ISO timestamp) | When step was started |

---

#### Update User Profile

Updates the authenticated user's profile. Performs a merge operation (only updates provided fields).

```http
PUT /user/me
```

**Authentication**: Required

**Request Headers**:
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "universityName": "Bocconi University",
  "monthlyBudget": "1200",
  "rentCost": 600
}
```

**Notes**:
- Only include fields you want to update
- Existing fields not included in the request remain unchanged
- Empty strings, `null`, and `undefined` values are removed
- Numbers `0` and boolean `false` are preserved

**Response** (200 OK):
```json
{
  "message": "Profile saved"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Profile updates must be a non-array object"
}
```

---

### Progress Tracking

#### Mark Step as Completed

Marks an onboarding or information step as completed.

```http
PUT /progress
```

**Authentication**: Required

**Request Headers**:
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "stepKey": "visa",
  "completed": true
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stepKey` | String | Yes | Unique step identifier |
| `completed` | Boolean | Yes | Completion status |

**Common Step Keys**:
- `onboarding-1` - Destination
- `onboarding-2` - Origin & Citizenship
- `onboarding-3` - Program Basics
- `onboarding-3.5` - Application Requirements
- `onboarding-5` - Visa & Documents
- `onboarding-6` - Current Progress
- `onboarding-8` - Review & Finish
- `visa` - Student Visa Page
- `housing` - Housing Page
- `banking` - Banking Page
- `codice-fiscale` - Codice Fiscale Page
- `insurance` - Insurance Page
- `healthcare` - Healthcare Page
- Plus more info pages...

**Response** (200 OK):
```json
{
  "message": "Progress saved"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "stepKey is required"
}
```

---

#### Mark Step as Started

Marks a step as started (used for tracking when users begin reading content).

```http
PUT /progress/start
```

**Authentication**: Required

**Request Headers**:
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "stepKey": "visa"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stepKey` | String | Yes | Unique step identifier |

**Response** (200 OK):
```json
{
  "message": "Step started",
  "stepKey": "visa",
  "started": true
}
```

**Error** (400 Bad Request):
```json
{
  "error": "stepKey is required"
}
```

**Note**: This automatically creates a progress record with `started: true`, `startedAt: {timestamp}`, and `completed: false`.

---

### Deadlines

#### Get User Deadlines

Retrieves all deadlines for the authenticated user.

```http
GET /deadlines
```

**Authentication**: Required

**Request Headers**:
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "deadlines": [
    {
      "deadlineId": "d47e9a12-3f56-4b8c-9d2e-1a2b3c4d5e6f",
      "userId": "abc-123-def-456",
      "title": "Visa Appointment",
      "dueDate": "2024-03-15",
      "sendReminder": true,
      "note": "Bring passport and acceptance letter",
      "createdAt": "2024-02-18T10:00:00Z",
      "updatedAt": "2024-02-18T10:00:00Z"
    },
    {
      "deadlineId": "e58f0b23-4g67-5c9d-0e3f-2b3c4d5e6f7g",
      "userId": "abc-123-def-456",
      "title": "Housing Application Deadline",
      "dueDate": "2024-04-01",
      "sendReminder": false,
      "createdAt": "2024-02-18T11:30:00Z",
      "updatedAt": "2024-02-18T11:30:00Z"
    }
  ]
}
```

**Deadline Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `deadlineId` | String (UUID) | Unique deadline identifier |
| `userId` | String | User ID (owner) |
| `title` | String | Deadline title |
| `dueDate` | String (ISO date) | Due date (YYYY-MM-DD) |
| `sendReminder` | Boolean | Whether to send email reminder |
| `note` | String (optional) | Additional notes |
| `createdAt` | String (ISO timestamp) | When deadline was created |
| `updatedAt` | String (ISO timestamp) | When deadline was last updated |

---

#### Create Deadline

Creates a new deadline for the authenticated user.

```http
POST /deadlines
```

**Authentication**: Required

**Request Headers**:
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Visa Appointment",
  "dueDate": "2024-03-15",
  "sendReminder": true,
  "note": "Bring passport and acceptance letter"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Deadline title (non-empty) |
| `dueDate` | String (ISO date) | Yes | Due date (YYYY-MM-DD, cannot be in past) |
| `sendReminder` | Boolean | Yes | Whether to send email reminder |
| `note` | String | No | Additional notes (trimmed) |

**Validation Rules**:
- `title` must be non-empty string (whitespace trimmed)
- `dueDate` must be valid ISO date format
- `dueDate` cannot be in the past (before today)
- `sendReminder` must be boolean

**Response** (201 Created):
```json
{
  "deadline": {
    "deadlineId": "d47e9a12-3f56-4b8c-9d2e-1a2b3c4d5e6f",
    "userId": "abc-123-def-456",
    "title": "Visa Appointment",
    "dueDate": "2024-03-15",
    "sendReminder": true,
    "note": "Bring passport and acceptance letter",
    "createdAt": "2024-02-18T10:00:00Z",
    "updatedAt": "2024-02-18T10:00:00Z"
  }
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Title is required and must be a non-empty string"
}
```

```json
{
  "error": "Due date is required and must be a valid date string"
}
```

```json
{
  "error": "Invalid date format"
}
```

```json
{
  "error": "Due date cannot be in the past"
}
```

```json
{
  "error": "sendReminder must be a boolean"
}
```

**Note**: The `deadlineId` is automatically generated using UUID v4.

---

### Feedback

#### Submit Feedback

Submits public feedback (no authentication required). Stores feedback in DynamoDB and sends email notification.

```http
POST /feedback
```

**Authentication**: Not required (public endpoint)

**Request Headers**:
```http
Content-Type: application/json
```

**Request Body**:
```json
{
  "message": "Great app! The cost of living calculator is very helpful."
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | String | Yes | Feedback message (non-empty, trimmed) |

**Response** (200 OK):
```json
{
  "message": "Feedback received"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Message is required and must be a non-empty string"
}
```

**Note**: 
- Feedback is stored with a guest ID: `guest-{timestamp}`
- Email is sent to `FEEDBACK_EMAIL` environment variable (currently: tijn@eendenburg.eu)
- Email failures are logged but do not cause the request to fail (feedback still saved)

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Errors

#### 401 Unauthorized

**Cause**: Missing, invalid, or expired JWT token

**Example Response**:
```json
{
  "error": "Unauthorized"
}
```

**How to Fix**:
1. Check that `Authorization` header is present
2. Verify token is valid (not expired)
3. Sign in again to get new token

---

#### 400 Bad Request

**Cause**: Invalid request body, missing required fields, or validation failure

**Example Responses**:
```json
{
  "error": "stepKey is required"
}
```

```json
{
  "error": "Due date cannot be in the past"
}
```

**How to Fix**:
1. Check request body matches expected format
2. Ensure all required fields are present
3. Validate data before sending (dates, booleans, etc.)

---

#### 404 Not Found

**Cause**: Endpoint doesn't exist or route not matched

**Example Response**:
```json
{
  "error": "Not found"
}
```

**How to Fix**:
1. Verify endpoint URL is correct
2. Check HTTP method matches documentation
3. Ensure base URL includes correct environment

---

#### 500 Internal Server Error

**Cause**: Server error (DynamoDB failure, Lambda exception, etc.)

**Example Response**:
```json
{
  "error": "Internal server error"
}
```

**How to Fix**:
1. Check AWS CloudWatch logs for Lambda function
2. Verify DynamoDB tables exist and are accessible
3. Contact support if issue persists

---

## Rate Limiting

**Current Status**: No rate limiting implemented

**Recommendations for Production**:
- API Gateway throttling: 1,000 requests/second per user
- Burst capacity: 2,000 requests
- DynamoDB: On-demand capacity (auto-scales)

**Rate Limit Response** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

---

## Examples

### Example 1: Complete User Flow

#### 1. Sign In (Frontend)

```javascript
import { signIn } from 'aws-amplify/auth'

const { isSignedIn } = await signIn({
  username: 'user@example.com',
  password: 'SecurePassword123!'
})
```

#### 2. Get Auth Token

```javascript
import { fetchAuthSession } from 'aws-amplify/auth'

const session = await fetchAuthSession()
const idToken = session.tokens?.idToken?.toString()
```

#### 3. Fetch User Profile

```javascript
const response = await fetch(
  'https://abc123.execute-api.eu-north-1.amazonaws.com/prod/user/me',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  }
)

const data = await response.json()
console.log(data.profile) // User profile object
console.log(data.progress) // Progress array
```

#### 4. Update Profile

```javascript
const response = await fetch(
  'https://abc123.execute-api.eu-north-1.amazonaws.com/prod/user/me',
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      universityName: 'Bocconi University',
      monthlyBudget: '1200',
    }),
  }
)

const data = await response.json()
console.log(data.message) // "Profile saved"
```

#### 5. Mark Step as Started

```javascript
const response = await fetch(
  'https://abc123.execute-api.eu-north-1.amazonaws.com/prod/progress/start',
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stepKey: 'visa',
    }),
  }
)

const data = await response.json()
console.log(data.message) // "Step started"
```

#### 6. Mark Step as Completed

```javascript
const response = await fetch(
  'https://abc123.execute-api.eu-north-1.amazonaws.com/prod/progress',
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stepKey: 'visa',
      completed: true,
    }),
  }
)

const data = await response.json()
console.log(data.message) // "Progress saved"
```

#### 7. Create Deadline

```javascript
const response = await fetch(
  'https://abc123.execute-api.eu-north-1.amazonaws.com/prod/deadlines',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Visa Appointment',
      dueDate: '2024-03-15',
      sendReminder: true,
      note: 'Bring passport and acceptance letter',
    }),
  }
)

const data = await response.json()
console.log(data.deadline) // Newly created deadline object
```

#### 8. Get All Deadlines

```javascript
const response = await fetch(
  'https://abc123.execute-api.eu-north-1.amazonaws.com/prod/deadlines',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  }
)

const data = await response.json()
console.log(data.deadlines) // Array of deadline objects
```

---

### Example 2: Public Feedback Submission

```javascript
// No authentication required
const response = await fetch(
  'https://abc123.execute-api.eu-north-1.amazonaws.com/prod/feedback',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Great app! The cost of living calculator is very helpful.',
    }),
  }
)

const data = await response.json()
console.log(data.message) // "Feedback received"
```

---

### Example 3: Using Reusable API Client

Recommended approach for frontend applications:

```javascript
// src/lib/api.ts
import { fetchAuthSession } from 'aws-amplify/auth'

const API_BASE_URL = 'https://abc123.execute-api.eu-north-1.amazonaws.com/prod'

async function fetchWithAuth(endpoint, options = {}) {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `API error: ${response.status}`)
  }

  return response.json()
}

export const api = {
  // User Profile
  getUserProfile: () => 
    fetchWithAuth('/user/me', { method: 'GET' }),
  
  updateUserProfile: (data) => 
    fetchWithAuth('/user/me', { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  // Progress
  markStepStarted: (stepKey) => 
    fetchWithAuth('/progress/start', {
      method: 'PUT',
      body: JSON.stringify({ stepKey })
    }),
  
  markStepCompleted: (stepKey) => 
    fetchWithAuth('/progress', {
      method: 'PUT',
      body: JSON.stringify({ stepKey, completed: true })
    }),
  
  // Deadlines
  getDeadlines: () => 
    fetchWithAuth('/deadlines', { method: 'GET' }),
  
  createDeadline: (title, dueDate, sendReminder, note) => 
    fetchWithAuth('/deadlines', {
      method: 'POST',
      body: JSON.stringify({ title, dueDate, sendReminder, note })
    }),
  
  // Feedback (public, no auth)
  submitFeedback: (message) => 
    fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }).then(r => r.json()),
}
```

**Usage**:
```javascript
import { api } from './lib/api'

// Fetch profile
const { profile, progress } = await api.getUserProfile()

// Update profile
await api.updateUserProfile({ firstName: 'John', lastName: 'Doe' })

// Mark step completed
await api.markStepCompleted('visa')

// Create deadline
await api.createDeadline(
  'Visa Appointment',
  '2024-03-15',
  true,
  'Bring passport'
)

// Get all deadlines
const { deadlines } = await api.getDeadlines()

// Submit feedback
await api.submitFeedback('Great app!')
```

---

### Example 4: Error Handling

```javascript
import { api } from './lib/api'

async function saveProfile(profileData) {
  try {
    await api.updateUserProfile(profileData)
    console.log('Profile saved successfully')
  } catch (error) {
    if (error.message.includes('401')) {
      // Token expired, redirect to login
      console.error('Session expired. Please sign in again.')
      window.location.href = '/auth'
    } else if (error.message.includes('400')) {
      // Validation error
      console.error('Invalid data:', error.message)
      alert('Please check your inputs and try again.')
    } else if (error.message.includes('500')) {
      // Server error
      console.error('Server error:', error.message)
      alert('Something went wrong. Please try again later.')
    } else {
      // Unknown error
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred.')
    }
  }
}
```

---

### Example 5: CORS Preflight (OPTIONS)

Browsers automatically send preflight requests for cross-origin requests:

```http
OPTIONS /user/me HTTP/1.1
Host: abc123.execute-api.eu-north-1.amazonaws.com
Origin: https://yourdomain.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization, Content-Type
```

**Response**:
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Content-Length: 0
```

After successful preflight, the actual request is sent.

---

## Testing the API

### Using cURL

```bash
# Get auth token (replace with your credentials)
AUTH_TOKEN="your-jwt-token-here"

# Get profile
curl -X GET \
  https://abc123.execute-api.eu-north-1.amazonaws.com/prod/user/me \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"

# Update profile
curl -X PUT \
  https://abc123.execute-api.eu-north-1.amazonaws.com/prod/user/me \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe"}'

# Mark step completed
curl -X PUT \
  https://abc123.execute-api.eu-north-1.amazonaws.com/prod/progress \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stepKey":"visa","completed":true}'

# Create deadline
curl -X POST \
  https://abc123.execute-api.eu-north-1.amazonaws.com/prod/deadlines \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Visa Appointment","dueDate":"2024-03-15","sendReminder":true}'

# Submit feedback (no auth)
curl -X POST \
  https://abc123.execute-api.eu-north-1.amazonaws.com/prod/feedback \
  -H "Content-Type: application/json" \
  -d '{"message":"Great app!"}'
```

### Using Postman

1. **Import Collection** (create JSON file):
```json
{
  "info": {
    "name": "Leavs API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
        ],
        "url": "{{base_url}}/user/me"
      }
    },
    {
      "name": "Update Profile",
      "request": {
        "method": "PUT",
        "header": [
          { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"firstName\":\"John\",\"lastName\":\"Doe\"}"
        },
        "url": "{{base_url}}/user/me"
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "https://abc123.execute-api.eu-north-1.amazonaws.com/prod"
    },
    {
      "key": "jwt_token",
      "value": "your-jwt-token-here"
    }
  ]
}
```

2. **Import into Postman** → File → Import → Paste JSON
3. **Set Variables** → Collection → Variables → Set `base_url` and `jwt_token`
4. **Send Requests**

---

## Changelog

### v1.0.0 (February 2024)
- Initial API release
- User profile management
- Progress tracking
- Deadline management
- Public feedback submission

### Upcoming Features
- Update/delete deadline endpoints
- Bulk progress updates
- User profile export (PDF)
- Admin endpoints (view all users, analytics)
- WebSocket support for real-time updates
- Email reminder system for deadlines

---

**For support, contact: tijn@eendenburg.eu**
