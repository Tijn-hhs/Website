# Architecture - Student Hub (Leavs)

> **Detailed system design, components, and data flows**  
> Last updated: February 18, 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Authentication & Authorization](#authentication--authorization)
6. [State Management](#state-management)
7. [Component Hierarchy](#component-hierarchy)
8. [API Integration](#api-integration)
9. [Storage Strategy](#storage-strategy)
10. [Performance Considerations](#performance-considerations)
11. [Security](#security)
12. [Scalability](#scalability)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    React Application                         │  │
│  │                                                              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │  │
│  │  │   Public   │  │ Onboarding │  │    Dashboard       │    │  │
│  │  │   Pages    │  │   Flow     │  │  + Info Center     │    │  │
│  │  │  Landing   │  │  8 Steps   │  │   13+ Pages        │    │  │
│  │  │   Blog     │  │            │  │                    │    │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘    │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │         State Management Layer                       │  │  │
│  │  │  - localStorage (draft, sidebar state)               │  │  │
│  │  │  - React hooks (user profile, progress)              │  │  │
│  │  │  - Amplify SDK (auth tokens, config)                 │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │         Integration Layer                            │  │  │
│  │  │  - Amplify Auth SDK (Cognito)                        │  │  │
│  │  │  - Fetch API (REST calls)                            │  │  │
│  │  │  - React Router (navigation)                         │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS
                                │ Authorization: Bearer {JWT}
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD SERVICES                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 AWS Amplify Hosting                          │  │
│  │  - CloudFront CDN                                            │  │
│  │  - S3 Static Hosting                                         │  │
│  │  - HTTPS/SSL                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Amazon Cognito User Pools                       │  │
│  │  - User registration & authentication                        │  │
│  │  - JWT token generation & validation                         │  │
│  │  - Password policies & MFA                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Amazon API Gateway (REST API)                   │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │  Cognito Authorizer                                   │  │  │
│  │  │  - Validates JWT tokens                               │  │  │
│  │  │  - Extracts user ID (sub claim)                       │  │  │
│  │  │  - Returns 401 if invalid                             │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │  Routes & Methods                                     │  │  │
│  │  │  - GET  /user/me                                      │  │  │
│  │  │  - PUT  /user/me                                      │  │  │
│  │  │  - PUT  /progress                                     │  │  │
│  │  │  - PUT  /progress/start                               │  │  │
│  │  │  - GET  /deadlines                                    │  │  │
│  │  │  - POST /deadlines                                    │  │  │
│  │  │  - POST /feedback (public, no auth)                   │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              AWS Lambda (Node.js 18)                         │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │  Handler Function (handler.ts)                        │  │  │
│  │  │  - Route parsing & method dispatch                    │  │  │
│  │  │  - Request validation                                 │  │  │
│  │  │  - Business logic                                     │  │  │
│  │  │  - Error handling                                     │  │  │
│  │  │  - Response formatting (JSON)                         │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Amazon DynamoDB                           │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │  │
│  │  │ user-profiles  │  │ user-progress  │  │  deadlines   │  │  │
│  │  │  PK: userId    │  │  PK: userId    │  │  PK: userId  │  │  │
│  │  │                │  │  SK: stepKey   │  │  SK: deadId  │  │  │
│  │  └────────────────┘  └────────────────┘  └──────────────┘  │  │
│  │  ┌────────────────┐                                         │  │
│  │  │   feedback     │                                         │  │
│  │  │  PK: feedId    │                                         │  │
│  │  │  SK: timestamp │                                         │  │
│  │  └────────────────┘                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Amazon SES (Email)                          │  │
│  │  - Send feedback notifications                               │  │
│  │  - Future: deadline reminders                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

- **Framework**: React 18.2 (with TypeScript 5.3)
- **Build Tool**: Vite 5.0 (fast HMR, optimized builds)
- **Styling**: Tailwind CSS 3.4 (utility-first)
- **Routing**: React Router v6.30 (declarative routing)
- **State**: React hooks + localStorage
- **Auth**: AWS Amplify SDK v6.16
- **Icons**: Lucide React (tree-shakeable)
- **Maps**: Leaflet + React Leaflet

### Application Structure

```
App Component (BrowserRouter)
│
├─ AppLayout (Header + Footer wrapper)
│   │
│   ├─ Header (navigation, branding)
│   │
│   ├─ Routes
│   │   │
│   │   ├─ Public Routes
│   │   │   ├─ LandingPage (/)
│   │   │   ├─ AuthPage (/auth)
│   │   │   ├─ BlogOverviewPage (/blog)
│   │   │   └─ BlogPostPage (/blog/:postId)
│   │   │
│   │   ├─ Protected Routes (wrapped in AuthGate)
│   │   │   │
│   │   │   ├─ DashboardPage (/dashboard)
│   │   │   │   └─ DashboardLayout
│   │   │   │       ├─ Sidebar (collapsible, 13 items)
│   │   │   │       └─ DashboardHome (overview cards)
│   │   │   │
│   │   │   ├─ Onboarding Flow (/onboarding/*)
│   │   │   │   └─ OnboardingLayout
│   │   │   │       ├─ StepHeader (progress indicator)
│   │   │   │       ├─ Step Pages (8 pages)
│   │   │   │       └─ Navigation buttons
│   │   │   │
│   │   │   └─ Information Pages (13 pages)
│   │   │       ├─ MySituationPage
│   │   │       ├─ StudentVisaPage
│   │   │       ├─ HousingPage
│   │   │       ├─ BankingPage
│   │   │       ├─ CodiceFiscalePage
│   │   │       ├─ InsurancePage
│   │   │       ├─ HealthcarePage
│   │   │       ├─ CostOfLivingPage (with calculator)
│   │   │       └─ ...
│   │   │
│   │   └─ NotFoundPage (404)
│   │
│   └─ Footer (links, copyright)
```

### Component Design Principles

1. **Separation of Concerns**
   - Pages handle routing and high-level state
   - Components handle UI and local interactions
   - Hooks handle reusable logic (data fetching, side effects)
   - Libraries handle external integrations (API, auth)

2. **Prop Drilling Avoidance**
   - Auth state managed by Amplify SDK (global)
   - User data fetched on-demand per page
   - LocalStorage for persistent UI state (sidebar, drafts)

3. **Responsive Design**
   - Mobile-first Tailwind breakpoints
   - Collapsible sidebar on small screens
   - Touch-friendly UI elements
   - Optimized images and assets

4. **Accessibility**
   - Semantic HTML (nav, main, section, article)
   - ARIA labels for screen readers
   - Keyboard navigation support
   - Focus management in modals

---

## Backend Architecture

### AWS Amplify Gen 2 (Infrastructure as Code)

All infrastructure defined in `amplify/backend.ts` using AWS CDK:

```typescript
// High-level structure
defineBackend({
  auth,      // Cognito User Pool
  userApi,   // Lambda function
})

// Dynamically creates:
// - 4 DynamoDB tables
// - 1 REST API Gateway
// - 1 Cognito Authorizer
// - IAM roles & policies
// - Environment variables
```

### Lambda Function Architecture

**Runtime**: Node.js 18  
**Handler**: `amplify/functions/userApi/handler.ts`

#### Request Flow

```
API Gateway Event
     │
     ▼
extractRoute() ──→ { method, path }
     │
     ▼
extractUserId() ──→ userId (from JWT)
     │
     ▼
Route Dispatcher
     │
     ├─ GET  /user/me        → handleGetUser()
     ├─ PUT  /user/me        → handlePutUser()
     ├─ PUT  /progress       → handlePutProgress()
     ├─ PUT  /progress/start → handlePutProgressStart()
     ├─ GET  /deadlines      → handleGetDeadlines()
     ├─ POST /deadlines      → handlePostDeadline()
     └─ POST /feedback       → handlePostFeedback()
     │
     ▼
Data Access Layer
     │
     ├─ getUserProfile()
     ├─ saveUserProfile()
     ├─ getUserProgress()
     ├─ saveStepProgress()
     ├─ markStepStarted()
     ├─ getUserDeadlines()
     ├─ createDeadline()
     ├─ saveFeedback()
     └─ sendFeedbackEmail()
     │
     ▼
DynamoDB / SES
     │
     ▼
Response (JSON)
```

#### Error Handling Strategy

1. **Validation Errors** → 400 Bad Request
   - Missing required fields
   - Invalid data formats
   - Business rule violations

2. **Authentication Errors** → 401 Unauthorized
   - Missing JWT token
   - Invalid/expired token
   - No userId in claims

3. **Not Found** → 404 Not Found
   - Route doesn't match any handler

4. **Server Errors** → 500 Internal Server Error
   - DynamoDB connection failures
   - Unexpected exceptions
   - SES email failures (logged but not returned)

#### CORS Configuration

```javascript
CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

- Preflight OPTIONS requests return 200 OK
- All responses include CORS headers
- Gateway responses (4XX/5XX) also include CORS headers

---

## Data Flow Patterns

### 1. User Profile Update Flow

```
┌──────────────┐
│   Browser    │
│   (React)    │
└──────┬───────┘
       │
       │ 1. User edits profile form
       │
       ▼
┌──────────────┐
│   useState   │  field values stored locally
└──────┬───────┘
       │
       │ 2. Click "Save"
       │
       ▼
┌──────────────┐
│  api.ts      │  PUT /user/me { ...fields }
│  (fetch)     │  Authorization: Bearer {JWT}
└──────┬───────┘
       │
       │ 3. HTTPS request
       │
       ▼
┌──────────────────┐
│  API Gateway     │  Validates JWT via Cognito Authorizer
└──────┬───────────┘
       │
       │ 4. Authorized, passes userId
       │
       ▼
┌──────────────────┐
│  Lambda Handler  │  handlePutUser(userId, body)
└──────┬───────────┘
       │
       │ 5. Merge existing + new data
       │
       ▼
┌──────────────────┐
│  DynamoDB        │  PutItem(userId, merged_profile)
│  user-profiles   │
└──────┬───────────┘
       │
       │ 6. Success response
       │
       ▼
┌──────────────────┐
│  React           │  Show success toast
│                  │  Refresh profile (optional)
└──────────────────┘
```

### 2. Onboarding Draft Flow

```
┌──────────────┐
│  Component   │  Step1Destination, Step2Origin, etc.
└──────┬───────┘
       │
       │ 1. User fills form
       │
       ▼
┌──────────────────────┐
│ useOnboardingDraft() │  Custom hook managing draft state
└──────┬───────────────┘
       │
       │ 2. updateDraft() called on every change
       │
       ▼
┌──────────────────────┐
│   localStorage       │  Draft saved (debounced, 2s delay)
│   key: onboardingDraft
└──────┬───────────────┘
       │
       │ 3. User clicks "Continue" on Step 8
       │
       ▼
┌──────────────────────┐
│   sync.ts            │  syncDraftToBackend()
└──────┬───────────────┘
       │
       │ 4. Maps draft fields → UserProfile fields
       │
       ▼
┌──────────────────────┐
│   API PUT /user/me   │  Send transformed profile
└──────┬───────────────┘
       │
       │ 5. Profile saved to DynamoDB
       │
       ▼
┌──────────────────────┐
│   Navigate to        │  Redirect to /dashboard
│   Dashboard          │
└──────────────────────┘
```

### 3. Progress Tracking Flow

```
Step Page (e.g., StudentVisaPage)
       │
       │ On mount: PUT /progress/start { stepKey: 'visa' }
       │
       ▼
Lambda → DynamoDB user-progress
       │ Store: { userId, stepKey: 'visa', started: true, startedAt: ... }
       │
       ● User reads page content ●
       │
       │ User clicks "Mark as Complete" button
       │
       ▼
PUT /progress { stepKey: 'visa', completed: true }
       │
       ▼
Lambda → DynamoDB user-progress
       │ Update: { completed: true, completedAt: ... }
       │
       ▼
Dashboard refreshes → shows visa step as completed ✓
```

### 4. Deadline Creation Flow

```
DeadlineModal (component)
       │
       │ User fills: title, date, sendReminder, note
       │
       ▼
POST /deadlines { title, dueDate, sendReminder, note }
       │
       ▼
Lambda validates:
  - title is non-empty
  - dueDate is valid date
  - dueDate is not in past
  - sendReminder is boolean
       │
       ▼
Lambda creates: deadlineId = uuid()
       │
       ▼
DynamoDB deadlines table
  PK: userId
  SK: deadlineId
  Stored: { deadlineId, userId, title, dueDate, sendReminder, note, timestamps }
       │
       ▼
Response: { deadline: {...} }
       │
       ▼
React updates UI → shows new deadline in list
```

---

## Authentication & Authorization

### Authentication Flow

1. **User Sign-Up**
   ```
   User → AuthPage → Amplify UI Authenticator
                  → Cognito.signUp()
                  → Email verification code sent
                  → User confirms code
                  → User created in User Pool
   ```

2. **User Sign-In**
   ```
   User → AuthPage → Amplify UI Authenticator
                  → Cognito.signIn(email, password)
                  → Cognito validates credentials
                  → Returns JWT tokens:
                      - ID Token (user claims)
                      - Access Token (for API calls)
                      - Refresh Token (for token renewal)
                  → Tokens stored in browser (IndexedDB via Amplify)
   ```

3. **Accessing Protected Route**
   ```
   User navigates to /dashboard
      → AuthGate component checks auth state
      → Amplify.getCurrentUser()
      → If no user: redirect to /auth
      → If user: render children (DashboardPage)
   ```

4. **Making API Call**
   ```
   Component → api.ts → fetch(url, {
                            headers: {
                              Authorization: 'Bearer ' + idToken
                            }
                          })
                     → API Gateway
                     → Cognito Authorizer validates token
                     → Extracts userId from token claims
                     → Passes to Lambda
   ```

### Authorization Model

**Current**: User-level isolation (each user can only access their own data)

```javascript
// In Lambda handler
const userId = extractUserId(event) // from JWT
if (!userId) return 401

// All queries scoped to this userId
await getUserProfile(userId)
await getUserProgress(userId)
await getUserDeadlines(userId)
```

**Future Considerations**:
- Admin users (view all users)
- Shared resources (university-specific content)
- Role-based access control (RBAC)

---

## State Management

### State Layers

#### 1. Server State (Source of Truth)
- **Location**: DynamoDB tables
- **Managed by**: Lambda functions
- **Access pattern**: Fetch on-demand via API

#### 2. Client State (React)
- **Location**: Component `useState`, `useEffect`
- **Lifecycle**: Mount → Fetch → Store → Unmount (discard)
- **Example**: User profile, progress list, deadlines

#### 3. Persistent State (localStorage)
- **Location**: Browser localStorage
- **Lifecycle**: Across sessions
- **Use cases**:
  - `onboardingDraft` - Onboarding form state
  - `sidebarCollapsed` - Sidebar UI preference
  - `stepIntroSeen` - Intro modal dismissal

#### 4. Auth State (Amplify SDK)
- **Location**: Browser IndexedDB (managed by Amplify)
- **Contents**: JWT tokens, user session
- **Access**: via `getCurrentUser()`, `fetchAuthSession()`

### State Synchronization Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    State Priority                       │
│                                                         │
│  Server (DynamoDB)  ───────→  Client (React)           │
│         ▲                           │                   │
│         │                           │                   │
│         └───────────────────────────┘                   │
│               On user action                            │
│                                                         │
│  localStorage  ←────────→  React State                  │
│     (draft)                 (form fields)               │
│                                                         │
│  Sync on:                                               │
│  - Page load (localStorage → React)                     │
│  - Input change (React → localStorage, debounced)       │
│  - Submit (React → Server → Clear localStorage)         │
└─────────────────────────────────────────────────────────┘
```

### Data Fetching Patterns

**Pattern 1: Fetch on Mount**
```typescript
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getUserProfile()
    setProfile(data.profile)
  }
  fetchData()
}, [])
```

**Pattern 2: Optimistic Update**
```typescript
const handleSave = async (newData) => {
  setProfile(newData) // Immediate UI update
  try {
    await api.updateUserProfile(newData)
  } catch (err) {
    setProfile(oldData) // Rollback on error
  }
}
```

**Pattern 3: Draft with Auto-Save**
```typescript
const [draft, setDraft] = useState(() => 
  JSON.parse(localStorage.getItem('draft')) || {}
)

useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('draft', JSON.stringify(draft))
  }, 2000) // Debounce 2s
  return () => clearTimeout(timer)
}, [draft])
```

---

## Component Hierarchy

### Layout Components

```
AppLayout
├─ Header
│  ├─ Logo
│  ├─ Navigation (desktop)
│  └─ Mobile Menu Toggle
│
└─ Footer
   ├─ Links
   └─ Copyright

DashboardLayout (extends AppLayout)
├─ Sidebar
│  ├─ Toggle Button
│  ├─ Navigation Items (13)
│  │  ├─ Icon (Lucide React)
│  │  └─ Label (hidden when collapsed)
│  └─ User Info Box
│
└─ Main Content Area
   └─ {children}

OnboardingLayout
├─ StepHeader
│  ├─ Progress Bar
│  └─ Step Title
│
├─ Step Content
│  └─ {children}
│
└─ Navigation Buttons
   ├─ Back
   └─ Continue
```

### Page Component Patterns

**Pattern 1: Static Information Page**
```typescript
export default function StudentVisaPage() {
  useEffect(() => {
    api.markStepStarted('visa')
  }, [])

  return (
    <StepPageLayout
      title="Student Visa"
      onComplete={() => api.markStepCompleted('visa')}
    >
      <InfoContent />
    </StepPageLayout>
  )
}
```

**Pattern 2: Interactive Calculator Page**
```typescript
export default function CostOfLivingPage() {
  const [costs, setCosts] = useState(defaultCosts)
  const total = calculateTotal(costs)

  return (
    <div>
      <CostSlider 
        label="Rent"
        value={costs.rent}
        onChange={(val) => setCosts({...costs, rent: val})}
      />
      <MonthlyCostsSummary total={total} />
    </div>
  )
}
```

**Pattern 3: Data-Driven Dashboard**
```typescript
export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState([])
  const [deadlines, setDeadlines] = useState([])

  useEffect(() => {
    Promise.all([
      api.getUserProfile(),
      api.getDeadlines(),
    ]).then(([profileData, deadlinesData]) => {
      setProfile(profileData.profile)
      setDeadlines(deadlinesData.deadlines)
    })
  }, [])

  if (!profile) return <LoadingSpinner />

  return (
    <DashboardLayout>
      <UserInfoBox profile={profile} />
      <DeadlinesList deadlines={deadlines} />
      <ProgressOverview progress={progress} />
    </DashboardLayout>
  )
}
```

---

## API Integration

### API Client (`src/lib/api.ts`)

Centralized API client using Fetch API:

```typescript
const API_BASE_URL = getApiUrl() // from amplify_outputs.json

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

  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response.json()
}

export const api = {
  getUserProfile: () => fetchWithAuth('/user/me', { method: 'GET' }),
  updateUserProfile: (data) => fetchWithAuth('/user/me', { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  markStepCompleted: (stepKey) => fetchWithAuth('/progress', {
    method: 'PUT',
    body: JSON.stringify({ stepKey, completed: true })
  }),
  // ... more methods
}
```

### Error Handling in API Calls

```typescript
try {
  const data = await api.updateUserProfile(profile)
  showSuccessToast('Profile saved!')
} catch (error) {
  if (error.message.includes('401')) {
    // Token expired, redirect to login
    navigate('/auth')
  } else if (error.message.includes('400')) {
    // Validation error
    showErrorToast('Invalid data. Please check your inputs.')
  } else {
    // Server error
    showErrorToast('Something went wrong. Please try again.')
  }
}
```

---

## Storage Strategy

### DynamoDB Access Patterns

#### Table: `user-profiles`
```
PK: userId (String)

Access Patterns:
1. Get profile by userId: GetItem(PK=userId)
2. Update profile: PutItem(PK=userId, ...fields)
```

#### Table: `user-progress`
```
PK: userId (String)
SK: stepKey (String)

Access Patterns:
1. Get all progress for user: Query(PK=userId)
2. Get specific step: GetItem(PK=userId, SK=stepKey)
3. Update step: PutItem(PK=userId, SK=stepKey, completed, timestamps)
```

#### Table: `deadlines`
```
PK: userId (String)
SK: deadlineId (String)

Access Patterns:
1. Get all deadlines for user: Query(PK=userId)
2. Get specific deadline: GetItem(PK=userId, SK=deadlineId)
3. Create deadline: PutItem(PK=userId, SK=uuid(), ...fields)
```

#### Table: `feedback`
```
PK: feedbackId (String)
SK: timestamp (Number)

Access Patterns:
1. Store feedback: PutItem(PK=uuid(), SK=Date.now(), ...)
2. Query all feedback (admin): Scan() [not yet implemented]
```

### Data Consistency Model

**Consistency Level**: Eventually consistent (DynamoDB default)

**Acceptable because**:
- User data is single-user access (no concurrent writes from multiple sources)
- Slight delays in progress updates are acceptable
- No critical financial transactions

**Trade-off**: Lower latency and cost vs. immediate consistency

---

## Performance Considerations

### Frontend Optimizations

1. **Code Splitting**
   - Vite automatically splits routes into separate chunks
   - Lazy loading not yet implemented (potential improvement)

2. **Asset Optimization**
   - Vite minifies JS/CSS in production
   - Images should be optimized (use WebP format)
   - CDN delivery via CloudFront

3. **Bundle Size**
   - Current: ~300KB (gzipped, including React + dependencies)
   - Largest dependency: Amplify SDK (~100KB)
   - Tree-shaking enabled (Lucide icons, Tailwind CSS)

4. **Rendering Performance**
   - No unnecessary re-renders (proper use of React.memo if needed)
   - Debounced operations (draft auto-save, search inputs)

### Backend Optimizations

1. **Lambda Cold Starts**
   - Current: ~500ms first invocation
   - Warm: ~50ms subsequent calls
   - Mitigation: Provisioned concurrency (not yet enabled, adds cost)

2. **DynamoDB Performance**
   - Single-digit millisecond latency for GetItem/PutItem
   - Query operations: ~10-20ms
   - On-demand billing mode (auto-scales)

3. **API Gateway**
   - Regional endpoint (eu-north-1)
   - CORS preflight cached by browser
   - No rate limiting configured yet

### Monitoring & Metrics

**Current**:
- CloudWatch Logs for Lambda
- CloudWatch Metrics for API Gateway (request count, latency, errors)
- Amplify Console for build/deploy status

**Missing**:
- Frontend error tracking (Sentry, LogRocket)
- User analytics (Amplitude, Mixpanel)
- Performance monitoring (Web Vitals)

---

## Security

### Current Security Measures

1. **Authentication**
   - Cognito handles password hashing/salting
   - JWT tokens with expiration (1 hour)
   - HTTPS-only communication

2. **Authorization**
   - API Gateway validates JWT before Lambda execution
   - Lambda double-checks userId from token
   - User data isolated by userId (no cross-user access)

3. **Input Validation**
   - Lambda validates all request bodies
   - Type checking (string, boolean, date format)
   - Business rule validation (deadline not in past, etc.)

4. **CORS**
   - Configured to allow all origins (`*`) for MVP
   - Should be restricted to specific domains in production

5. **Secrets Management**
   - No hardcoded secrets in code
   - Email address stored as environment variable
   - API keys in Amplify backend (not exposed to frontend)

### Security Considerations for Production

1. **Restrict CORS Origins**
   ```javascript
   allowOrigins: ['https://yourdomain.com']
   ```

2. **Enable MFA** (Multi-Factor Authentication)
   - Optional for users, recommended for admins

3. **Rate Limiting**
   - API Gateway throttling (prevent abuse)
   - DynamoDB read/write capacity limits

4. **Content Security Policy (CSP)**
   - Add CSP headers to prevent XSS attacks

5. **DynamoDB Encryption**
   - Enable encryption at rest (AWS KMS)
   - Already encrypted in transit (HTTPS)

6. **Audit Logging**
   - Log all API calls (CloudTrail)
   - Monitor unusual access patterns

---

## Scalability

### Current Architecture Scalability

| Component | Current Scale | Max Scale (without changes) | Bottleneck |
|-----------|---------------|------------------------------|------------|
| **CloudFront CDN** | Single region | Global | None (AWS scales automatically) |
| **Cognito** | 0 users | 10M+ users | None (AWS managed) |
| **API Gateway** | 0 req/s | 10,000 req/s | Default account limit (can increase) |
| **Lambda** | 0 concurrent | 1,000 concurrent | Default account limit (can increase) |
| **DynamoDB** | On-demand | Unlimited | None (auto-scales with cost increase) |
| **SES** | 0 emails/day | 200 emails/day | Sandbox mode (requires AWS approval) |

### Scaling Strategy

**Phase 1: 0-1,000 users** (Current)
- On-demand everything
- No optimization needed
- Cost: ~$10/month

**Phase 2: 1,000-10,000 users**
- Enable CloudFront caching
- Add DynamoDB Global Secondary Indexes (GSI) if needed
- Monitor Lambda concurrency
- Cost: ~$50-100/month

**Phase 3: 10,000-100,000 users**
- Provisioned Lambda concurrency (reduce cold starts)
- DynamoDB reserved capacity (cost optimization)
- Multi-region deployment (latency optimization)
- Add ElastiCache for frequent queries
- Cost: ~$500-1,000/month

**Phase 4: 100,000+ users**
- Microservices architecture (split Lambda into multiple functions)
- Event-driven architecture (SQS, EventBridge)
- API Gateway REST → HTTP API (lower latency/cost)
- Consider RDS for relational data (if needed)

---

## Diagram: Complete Request Flow

```
User clicks "Save Profile"
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND (Browser)                                              │
│                                                                  │
│  1. Component: handleSave() triggered                            │
│  2. State: Collect form values → profileData                     │
│  3. API Client: api.updateUserProfile(profileData)               │
│  4. Auth: Fetch JWT token from Amplify SDK                       │
│  5. HTTP: fetch(PUT /user/me, {Authorization: Bearer {JWT}})     │
└──────────────────────────────────────────────────────────────────┘
     │
     │ HTTPS (TLS 1.2+)
     ▼
┌──────────────────────────────────────────────────────────────────┐
│  API GATEWAY (AWS)                                               │
│                                                                  │
│  1. Receive: PUT /user/me                                        │
│  2. CORS Check: Preflight passed? Yes                            │
│  3. Authorizer: Validate JWT with Cognito                        │
│     - Decode token                                               │
│     - Verify signature                                           │
│     - Check expiration                                           │
│     - Extract userId (sub claim)                                 │
│  4. Result: Authorized ✓ → Pass to Lambda                        │
│            OR 401 Unauthorized → Return error                    │
└──────────────────────────────────────────────────────────────────┘
     │
     │ Lambda Invocation (JSON event)
     ▼
┌──────────────────────────────────────────────────────────────────┐
│  LAMBDA HANDLER (Node.js)                                        │
│                                                                  │
│  1. extractRoute(event) → {method: 'PUT', path: '/user/me'}     │
│  2. extractUserId(event) → userId = "abc-123-def"               │
│  3. parseBody(event) → { firstName: 'John', ... }                │
│  4. handler() dispatches to handlePutUser(userId, profileData)   │
│  5. handlePutUser():                                             │
│     a. Fetch existing profile: getUserProfile(userId)            │
│     b. Merge: {...existingProfile, ...newProfile}                │
│     c. Save: saveUserProfile(userId, mergedProfile)              │
└──────────────────────────────────────────────────────────────────┘
     │
     │ DynamoDB SDK call
     ▼
┌──────────────────────────────────────────────────────────────────┐
│  DYNAMODB (AWS)                                                  │
│                                                                  │
│  1. Receive: PutItem({ TableName, Item: { userId, ...fields }}) │
│  2. Store: Write to disk in eu-north-1 region                    │
│  3. Respond: Success (200 OK)                                    │
└──────────────────────────────────────────────────────────────────┘
     │
     │ Response propagates back
     ▼
┌──────────────────────────────────────────────────────────────────┐
│  LAMBDA → API GATEWAY → FRONTEND                                 │
│                                                                  │
│  Lambda: return ok({ message: 'Profile saved' })                 │
│  API Gateway: Forward response with CORS headers                 │
│  Frontend: Receive 200 OK                                        │
│            Show success toast                                    │
│            Update UI (profile displayed)                         │
└──────────────────────────────────────────────────────────────────┘
```

---

**End of Architecture Documentation**
