# Database Schema - Student Hub (Leavs)

> **Complete DynamoDB schema, access patterns, and best practices**  
> Last updated: February 18, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Database Architecture](#database-architecture)
3. [Table Schemas](#table-schemas)
4. [Access Patterns](#access-patterns)
5. [Data Modeling Decisions](#data-modeling-decisions)
6. [Query Examples](#query-examples)
7. [Indexes](#indexes)
8. [Backup & Recovery](#backup--recovery)
9. [Capacity Planning](#capacity-planning)
10. [Best Practices](#best-practices)

---

## Overview

**Database**: Amazon DynamoDB  
**Type**: NoSQL key-value and document database  
**Region**: `eu-north-1` (Stockholm, Sweden)  
**Billing Mode**: On-Demand (pay-per-request)  
**Consistency Model**: Eventually consistent (default)

### Why DynamoDB?

- **Serverless**: No server management, auto-scaling
- **Low Latency**: Single-digit millisecond response times
- **Cost-Effective**: Pay only for what you use
- **Highly Available**: Multi-AZ replication
- **Amplify Integration**: Native support in Amplify Gen 2

---

## Database Architecture

### Tables Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT HUB DATABASE                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┬────────────────┐
                ▼               ▼               ▼                ▼
        ┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌────────────┐
        │   PROFILES  │ │  PROGRESS   │ │ DEADLINES  │ │  FEEDBACK  │
        │             │ │             │ │            │ │            │
        │ User info   │ │ Step status │ │ Due dates  │ │ User input │
        │ 50+ fields  │ │ Completion  │ │ Reminders  │ │ Messages   │
        └─────────────┘ └─────────────┘ └────────────┘ └────────────┘
             1:1              1:N             1:N            1:N
         (per user)      (per step)       (per deadline)  (per feedback)
```

### Table Count

- **Total Tables**: 4
- **Per Environment**: 4 (each environment has separate tables)
- **Naming Pattern**: `leavs-{env}-{table-name}`

**Example (production)**:
- `leavs-main-user-profiles`
- `leavs-main-user-progress`
- `leavs-main-deadlines`
- `leavs-main-feedback`

---

## Table Schemas

### Table 1: User Profiles

**Table Name**: `leavs-{env}-user-profiles`

**Purpose**: Store user profile data (personal info, university, program, budget, etc.)

**Schema**:
```typescript
{
  // Keys
  userId: string                    // Partition Key (Cognito sub UUID)
  
  // Profile Fields (all optional)
  firstName?: string
  lastName?: string
  nationality?: string
  dateOfBirth?: string              // ISO date
  destinationCountry?: string       // "Italy"
  destinationCity?: string          // "Milan"
  universityName?: string
  programName?: string
  studyLevel?: string               // "bachelor", "master", "phd", "exchange"
  startDate?: string                // ISO date
  admissionStatus?: string          // "exploring", "applying", "accepted", "enrolled"
  visaType?: string
  passportExpiry?: string           // ISO date
  visaAppointmentDate?: string      // ISO date
  travelDate?: string               // ISO date
  flightsBooked?: boolean
  packingNotes?: string
  registrationStatus?: string
  residencePermitNeeded?: boolean
  accommodationType?: string
  housingBudget?: string
  leaseStart?: string               // ISO date
  bankAccountNeeded?: boolean
  insuranceProvider?: string
  legalDocsReady?: boolean
  healthCoverage?: string
  doctorPreference?: string
  arrivalDate?: string              // ISO date
  localTransport?: string
  dailyLifeNotes?: string
  monthlyBudget?: string
  budgetCurrency?: string           // "EUR", "USD", etc.
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
  
  // Metadata
  updatedAt: string                 // ISO timestamp
}
```

**Partition Key**: `userId` (String)  
**Sort Key**: None  
**Indexes**: None

**Storage**:
- **Average Item Size**: ~2-5 KB (depends on text fields)
- **Expected Items**: ~1,000-10,000 (number of users)

---

### Table 2: User Progress

**Table Name**: `leavs-{env}-user-progress`

**Purpose**: Track completion status for onboarding steps and information pages

**Schema**:
```typescript
{
  // Keys
  userId: string                    // Partition Key (Cognito sub UUID)
  stepKey: string                   // Sort Key (e.g., "visa", "housing", "onboarding-1")
  
  // Progress Fields
  completed: boolean                // Whether step is completed
  completedAt?: string              // ISO timestamp (null if not completed)
  started?: boolean                 // Whether step was started
  startedAt?: string                // ISO timestamp (null if not started)
  
  // Metadata
  updatedAt: string                 // ISO timestamp
}
```

**Partition Key**: `userId` (String)  
**Sort Key**: `stepKey` (String)  
**Indexes**: None

**Common Step Keys**:
- `onboarding-1`, `onboarding-2`, `onboarding-3`, `onboarding-3.5`, `onboarding-5`, `onboarding-6`, `onboarding-8`
- `visa`, `housing`, `banking`, `codice-fiscale`, `insurance`, `healthcare`, `daily-life`, `cost-of-living`, etc.

**Storage**:
- **Average Item Size**: ~0.3 KB
- **Expected Items**: ~20-50 per user (20-50K total for 1K users)

---

### Table 3: Deadlines

**Table Name**: `leavs-{env}-deadlines`

**Purpose**: Store user-created deadlines (visa appointments, application due dates, etc.)

**Schema**:
```typescript
{
  // Keys
  userId: string                    // Partition Key (Cognito sub UUID)
  deadlineId: string                // Sort Key (UUID v4)
  
  // Deadline Fields
  title: string                     // Deadline title (required)
  dueDate: string                   // ISO date (YYYY-MM-DD, required)
  sendReminder: boolean             // Whether to send email reminder (required)
  note?: string                     // Optional notes
  
  // Metadata
  createdAt: string                 // ISO timestamp
  updatedAt: string                 // ISO timestamp
}
```

**Partition Key**: `userId` (String)  
**Sort Key**: `deadlineId` (String)  
**Indexes**: None (future: GSI on `dueDate` for reminder system)

**Storage**:
- **Average Item Size**: ~0.5 KB
- **Expected Items**: ~5-10 per user (5-10K total for 1K users)

---

### Table 4: Feedback

**Table Name**: `leavs-{env}-feedback`

**Purpose**: Store public feedback submissions from users (no authentication required)

**Schema**:
```typescript
{
  // Keys
  feedbackId: string                // Partition Key (UUID v4)
  timestamp: number                 // Sort Key (Unix timestamp in milliseconds)
  
  // Feedback Fields
  userId: string                    // "guest-{timestamp}" or actual userId if authenticated
  message: string                   // Feedback message text (required)
  
  // Metadata
  createdAt: string                 // ISO timestamp
}
```

**Partition Key**: `feedbackId` (String)  
**Sort Key**: `timestamp` (Number)  
**Indexes**: None (future: GSI on `userId` if needed)

**Storage**:
- **Average Item Size**: ~0.5-1 KB
- **Expected Items**: Unlimited (grows over time)

**Note**: This table is not user-scoped, so admin access would require Scan operation (expensive). Consider adding GSI by date range for admin dashboard.

---

## Access Patterns

### Pattern 1: Get User Profile

**Use Case**: Fetch user's profile when they visit dashboard

**Query**:
```typescript
GetItem({
  TableName: 'leavs-main-user-profiles',
  Key: { userId: 'abc-123-def-456' }
})
```

**Performance**: ~5-10ms

---

### Pattern 2: Update User Profile

**Use Case**: User updates their profile information

**Query**:
```typescript
PutItem({
  TableName: 'leavs-main-user-profiles',
  Item: {
    userId: 'abc-123-def-456',
    firstName: 'John',
    lastName: 'Doe',
    universityName: 'Bocconi University',
    // ... other fields
    updatedAt: '2024-02-18T10:00:00Z'
  }
})
```

**Performance**: ~10-15ms

**Note**: This is a full replace operation. The Lambda handler merges existing + new data before calling PutItem.

---

### Pattern 3: Get All User Progress

**Use Case**: Display progress overview on dashboard

**Query**:
```typescript
Query({
  TableName: 'leavs-main-user-progress',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': 'abc-123-def-456' }
})
```

**Performance**: ~10-20ms (returns all steps at once)

**Example Response**:
```typescript
[
  { userId: 'abc-123', stepKey: 'visa', completed: true, completedAt: '...' },
  { userId: 'abc-123', stepKey: 'housing', completed: false, started: true },
  // ... more steps
]
```

---

### Pattern 4: Mark Step as Completed

**Use Case**: User completes an information page

**Query**:
```typescript
PutItem({
  TableName: 'leavs-main-user-progress',
  Item: {
    userId: 'abc-123-def-456',
    stepKey: 'visa',
    completed: true,
    completedAt: '2024-02-18T10:00:00Z',
    updatedAt: '2024-02-18T10:00:00Z'
  }
})
```

**Performance**: ~10-15ms

---

### Pattern 5: Get User Deadlines

**Use Case**: Display deadlines on dashboard

**Query**:
```typescript
Query({
  TableName: 'leavs-main-deadlines',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': 'abc-123-def-456' }
})
```

**Performance**: ~10-20ms

---

### Pattern 6: Create Deadline

**Use Case**: User adds a new deadline

**Query**:
```typescript
PutItem({
  TableName: 'leavs-main-deadlines',
  Item: {
    userId: 'abc-123-def-456',
    deadlineId: 'd47e9a12-3f56-4b8c-9d2e-1a2b3c4d5e6f',
    title: 'Visa Appointment',
    dueDate: '2024-03-15',
    sendReminder: true,
    note: 'Bring passport',
    createdAt: '2024-02-18T10:00:00Z',
    updatedAt: '2024-02-18T10:00:00Z'
  }
})
```

**Performance**: ~10-15ms

---

### Pattern 7: Submit Feedback

**Use Case**: User submits feedback via public form

**Query**:
```typescript
PutItem({
  TableName: 'leavs-main-feedback',
  Item: {
    feedbackId: 'f58a9c23-4g67-5c9d-0e3f-2b3c4d5e6f7g',
    timestamp: 1708268400000,
    userId: 'guest-1708268400000',
    message: 'Great app!',
    createdAt: '2024-02-18T10:00:00Z'
  }
})
```

**Performance**: ~10-15ms

---

## Data Modeling Decisions

### Why Single-Table Design NOT Used?

DynamoDB best practice is often "single-table design" (store all entities in one table). We chose **multi-table design** instead:

**Reasons**:
1. **Simplicity**: Easier to understand and maintain
2. **Different Access Patterns**: Each table has distinct query patterns
3. **Schema Flexibility**: Each table evolves independently
4. **No Complex GSIs**: No need for complex index overloading
5. **Small Scale**: At < 100K items per table, multi-table is fine

**Trade-offs**:
- **Cost**: Slightly higher (4 tables vs 1), but minimal at this scale
- **Transactions**: Can't use transactions across tables (not needed here)

---

### Primary Key Design

#### User Profiles

**Key**: `userId` (Partition Key only)

**Rationale**: 
- One profile per user (1:1 relationship)
- Access by userId only (no range queries needed)

#### User Progress

**Keys**: `userId` (Partition Key) + `stepKey` (Sort Key)

**Rationale**:
- Multiple steps per user (1:N relationship)
- Query all steps for a user: `Query(userId)`
- Query specific step: `GetItem(userId, stepKey)`

#### Deadlines

**Keys**: `userId` (Partition Key) + `deadlineId` (Sort Key)

**Rationale**:
- Multiple deadlines per user (1:N relationship)
- Query all deadlines for a user: `Query(userId)`
- Sort key is UUID (not `dueDate`) because:
  - UUIDs guarantee uniqueness
  - Multiple deadlines can have same `dueDate`
  - Future: Add GSI on `dueDate` for reminder system

#### Feedback

**Keys**: `feedbackId` (Partition Key) + `timestamp` (Sort Key)

**Rationale**:
- Feedback not scoped to users (public submissions)
- Sort key `timestamp` allows chronological ordering
- Future: Add GSI on `userId` if needed (though userId is often "guest-...")

---

### Data Types

| Type | DynamoDB Type | Example |
|------|---------------|---------|
| **User ID** | String | `"abc-123-def-456"` |
| **Dates** | String (ISO 8601) | `"2024-02-18"` |
| **Timestamps** | String (ISO 8601) | `"2024-02-18T10:00:00Z"` |
| **Unix Time** | Number | `1708268400000` |
| **Booleans** | Boolean | `true` / `false` |
| **Numbers** | Number | `600` (rent cost) |
| **Text** | String | `"Bocconi University"` |
| **UUID** | String | `"d47e9a12-3f56-..."` |

**Why ISO Strings for Dates?**
- Human-readable
- Sortable lexicographically
- Easy to parse in frontend/backend

**When to Use Numbers?**
- Unix timestamps for sort keys (efficient sorting)
- Numeric values (costs, counts)

---

## Query Examples

### Example 1: Full User Data Fetch

**Scenario**: User logs in, dashboard loads

**Queries** (parallel):
```typescript
// 1. Get profile
const profile = await dynamoDB.getItem({
  TableName: 'leavs-main-user-profiles',
  Key: { userId }
})

// 2. Get progress
const progress = await dynamoDB.query({
  TableName: 'leavs-main-user-progress',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': userId }
})

// 3. Get deadlines
const deadlines = await dynamoDB.query({
  TableName: 'leavs-main-deadlines',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': userId }
})
```

**Total Time**: ~20-30ms (parallel execution)

---

### Example 2: Update Multiple Fields

**Scenario**: User completes onboarding, saves profile

**Strategy**: Merge + Replace

```typescript
// 1. Get existing profile
const existing = await getUserProfile(userId)

// 2. Merge with new data
const merged = { ...existing, ...newData }

// 3. Clean up (remove null/undefined/empty strings)
const cleaned = Object.fromEntries(
  Object.entries(merged).filter(([_, v]) => 
    v !== undefined && v !== null && v !== ''
  )
)

// 4. Save
await dynamoDB.putItem({
  TableName: 'leavs-main-user-profiles',
  Item: { userId, ...cleaned, updatedAt: new Date().toISOString() }
})
```

**Why not UpdateItem?**
- UpdateItem is more complex (requires building update expressions)
- PutItem is simpler (full replace)
- Item size is small (~5KB), so no performance penalty

---

### Example 3: Batch Get Progress

**Scenario**: Dashboard shows progress for multiple steps

**Current Approach**: Query all steps for user
```typescript
const allProgress = await dynamoDB.query({
  TableName: 'leavs-main-user-progress',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': userId }
})
```

**Alternative (not used)**: BatchGetItem for specific steps
```typescript
const specificSteps = await dynamoDB.batchGetItem({
  RequestItems: {
    'leavs-main-user-progress': {
      Keys: [
        { userId, stepKey: 'visa' },
        { userId, stepKey: 'housing' },
        { userId, stepKey: 'banking' }
      ]
    }
  }
})
```

**Why Query instead of BatchGet?**
- Fewer steps (~20) than BatchGetItem limit (100)
- Query is simpler
- No significant performance difference

---

## Indexes

### Current Indexes

**None** (no Global Secondary Indexes or Local Secondary Indexes)

**Reason**: Current access patterns don't require indexes. All queries are by userId (partition key) or userId + stepKey/deadlineId (composite key).

---

### Future Index Recommendations

#### GSI 1: Deadlines by Due Date

**Purpose**: Find all deadlines due today/tomorrow (for reminder system)

**Index Key**:
- Partition Key: `dueDate` (String, YYYY-MM-DD)
- Sort Key: `userId` (String)

**Use Case**:
```typescript
// Find all deadlines due on 2024-03-15
const deadlinesToRemind = await dynamoDB.query({
  TableName: 'leavs-main-deadlines',
  IndexName: 'DueDateIndex',
  KeyConditionExpression: 'dueDate = :date',
  ExpressionAttributeValues: { ':date': '2024-03-15' }
})

// Send reminder emails to those users
for (const deadline of deadlinesToRemind) {
  if (deadline.sendReminder) {
    await sendReminderEmail(deadline.userId, deadline)
  }
}
```

**Cost**: Minimal (indexed attributes are small)

---

#### GSI 2: Feedback by User (Admin View)

**Purpose**: View all feedback from a specific user (admin dashboard)

**Index Key**:
- Partition Key: `userId` (String)
- Sort Key: `timestamp` (Number)

**Use Case**:
```typescript
// Get all feedback from a user
const userFeedback = await dynamoDB.query({
  TableName: 'leavs-main-feedback',
  IndexName: 'UserIdIndex',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': userId }
})
```

**Note**: Not needed unless building admin dashboard.

---

## Backup & Recovery

### Point-in-Time Recovery (PITR)

**Status**: Not enabled (default)

**Recommendation**: Enable for production

**How to Enable**:
1. Go to DynamoDB Console
2. Select table → Backups → Point-in-time recovery
3. Click "Enable"

**Cost**: ~20% of table storage cost (minimal for small tables)

**Benefit**: Restore table to any point in time within last 35 days

---

### On-Demand Backups

**Strategy**: Manual backups before major changes

**How to Create**:
```bash
aws dynamodb create-backup \
  --table-name leavs-main-user-profiles \
  --backup-name leavs-profiles-backup-2024-02-18
```

**Frequency**: Before major updates or migrations

---

### Export to S3

**Purpose**: Long-term archival, analytics

**How to Export**:
1. DynamoDB Console → Table → Exports
2. Click "Export to S3"
3. Choose S3 bucket and format (DynamoDB JSON or ION)

**Use Cases**:
- Data analysis (BigQuery, Athena)
- Compliance (long-term storage)
- Disaster recovery

---

## Capacity Planning

### Current Mode: On-Demand

**How It Works**: Pay per request, auto-scales to any load

**Pricing** (eu-north-1):
- **Writes**: $1.50 per million write requests
- **Reads**: $0.30 per million read requests
- **Storage**: $0.29 per GB-month

**When to Use**: Unpredictable or spiky traffic (perfect for MVP)

---

### Provisioned Capacity (Alternative)

**How It Works**: Pre-allocate read/write capacity units (RCUs/WCUs)

**When to Use**: Predictable, consistent traffic (cost-effective at scale)

**Example Pricing**:
- 100 RCUs + 100 WCUs = ~$0.65/day (~$20/month)
- Handles ~8.6M reads + ~8.6M writes per day

**Recommendation**: Switch to provisioned at 1M+ requests/month for cost savings.

---

### Capacity Estimation

**Assumptions**:
- 1,000 active users
- 10 dashboard visits per user per month
- 5 profile updates per user per month

**Calculations**:

| Operation | Count/Month | Requests | Cost |
|-----------|-------------|----------|------|
| **Get Profile** | 1,000 users × 10 visits | 10,000 reads | $0.003 |
| **Get Progress** | 1,000 users × 10 visits | 10,000 reads | $0.003 |
| **Get Deadlines** | 1,000 users × 10 visits | 10,000 reads | $0.003 |
| **Update Profile** | 1,000 users × 5 updates | 5,000 writes | $0.008 |
| **Mark Step Complete** | 1,000 users × 20 steps | 20,000 writes | $0.030 |
| **Create Deadline** | 1,000 users × 3 deadlines | 3,000 writes | $0.005 |
| **Submit Feedback** | 200 submissions | 200 writes | $0.0003 |
| **Storage** (5GB) | - | - | $1.45 |
| **Total** | | | **~$1.50/month** |

**At 10,000 users**: ~$15/month  
**At 100,000 users**: ~$150/month

---

## Best Practices

### 1. Use Batch Operations When Possible

**Bad** (multiple GetItem calls):
```typescript
for (const stepKey of ['visa', 'housing', 'banking']) {
  const progress = await dynamoDB.getItem({
    TableName: 'user-progress',
    Key: { userId, stepKey }
  })
}
```

**Good** (single Query):
```typescript
const allProgress = await dynamoDB.query({
  TableName: 'user-progress',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': userId }
})
```

---

### 2. Handle Eventually Consistent Reads

**Default**: DynamoDB reads are eventually consistent (~1 second delay)

**When to Use Strongly Consistent Reads**:
- Immediately after write, need to read back
- Critical data consistency required

**How to Request**:
```typescript
await dynamoDB.getItem({
  TableName: 'user-profiles',
  Key: { userId },
  ConsistentRead: true  // ← Strongly consistent (costs 2× reads)
})
```

**Current App**: Eventually consistent is fine (no critical real-time requirements)

---

### 3. Don't Store Large Objects

**Limit**: 400 KB per item (hard limit)

**Recommendation**: Keep items < 10 KB for performance

**Current App**: All items < 5 KB ✓

**If Larger Data Needed**:
- Store file in S3
- Store S3 URL in DynamoDB

---

### 4. Use Sparse Indexes

**Concept**: Only items with a specific attribute are included in GSI

**Example**: If adding GSI on `sendReminder`:
- Only index deadlines where `sendReminder = true`
- Reduces index size and cost

**Not implemented yet** (no GSIs currently)

---

### 5. Avoid Scans

**Scan**: Reads entire table (very expensive, slow)

**Current App**: No scans used ✓

**When Scan Is Necessary**:
- Admin dashboard (view all users)
- Data export
- Analytics queries

**Alternatives to Scan**:
- Add GSI for specific query patterns
- Export to S3 + query with Athena
- Stream data to analytics database

---

### 6. Monitor Throttling

**Throttling**: When requests exceed capacity (rare with on-demand)

**How to Monitor**:
- CloudWatch metrics: `UserErrors` (throttling errors)
- Lambda errors: `ProvisionedThroughputExceededException`

**Solutions**:
- Exponential backoff in Lambda
- Increase provisioned capacity (if using provisioned mode)
- Spread writes over time (don't burst)

---

### 7. Clean Up Empty Fields

**Bad** (stores empty strings, null):
```typescript
await dynamoDB.putItem({
  Item: {
    userId: 'abc-123',
    firstName: '',        // ← Empty string
    lastName: null,       // ← Null
    university: undefined // ← Undefined
  }
})
```

**Good** (remove empty fields):
```typescript
const cleaned = Object.fromEntries(
  Object.entries(data).filter(([_, v]) => 
    v !== undefined && v !== null && v !== ''
  )
)

await dynamoDB.putItem({
  Item: { userId: 'abc-123', ...cleaned }
})
```

**Current App**: Lambda handler already does this ✓

---

## Migration Strategy

### Adding New Fields

**Example**: Add `phoneNumber` field to user profiles

**Steps**:
1. Update TypeScript interface in `handler.ts`
2. Update frontend forms
3. Deploy (no migration needed!)

**Why No Migration?**: DynamoDB is schemaless. New field is optional, old items don't have it (undefined).

---

### Changing Field Types

**Example**: Change `monthlyBudget` from string to number

**Steps**:
1. Create Lambda function to scan table
2. For each item, convert string → number
3. Update item with new value
4. Update code to use number

**Code Example**:
```typescript
// Migration Lambda
const items = await scanAllItems('user-profiles')
for (const item of items) {
  if (typeof item.monthlyBudget === 'string') {
    item.monthlyBudget = parseFloat(item.monthlyBudget)
    await updateItem(item)
  }
}
```

**Downtime**: Zero (migration runs in background)

---

### Adding Indexes

**Example**: Add GSI on `dueDate`

**Steps**:
1. Update `amplify/backend.ts` to define GSI:
```typescript
const deadlinesTable = new dynamodb.Table(stack, 'DeadlinesTable', {
  // ... existing config
  globalSecondaryIndexes: [{
    indexName: 'DueDateIndex',
    partitionKey: { name: 'dueDate', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  }]
})
```

2. Deploy (CloudFormation updates table)
3. DynamoDB backfills index (automatic, takes ~minutes to hours)
4. Index becomes available

**Downtime**: Zero (table remains available during backfill)

---

## Troubleshooting

### Issue: "ConditionalCheckFailedException"

**Cause**: Using `ConditionExpression` that evaluated to false

**Solution**: Check condition logic, ensure item state matches expectation

---

### Issue: "Item size exceeds 400 KB"

**Cause**: Trying to store too much data in one item

**Solution**: 
- Split into multiple items
- Store large data in S3
- Remove unnecessary fields

---

### Issue: "ProvisionedThroughputExceededException"

**Cause**: Exceeded read/write capacity (only in provisioned mode)

**Solution**:
- Increase provisioned capacity
- Switch to on-demand mode
- Implement exponential backoff

---

### Issue: "Table not found"

**Cause**: Table name mismatch (wrong environment)

**Solution**:
- Verify environment variable: `USER_PROFILE_TABLE_NAME`
- Check table exists in DynamoDB console
- Ensure backend deployed successfully

---

## Tools & Resources

### AWS Console

- [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
- [CloudWatch Metrics](https://console.aws.amazon.com/cloudwatch/)

### Local Testing

**DynamoDB Local** (for offline development):
```bash
# Download and run
docker run -p 8000:8000 amazon/dynamodb-local

# Use in code
const dynamoDB = new DynamoDBClient({
  endpoint: 'http://localhost:8000'
})
```

### Useful AWS CLI Commands

```bash
# List tables
aws dynamodb list-tables

# Describe table
aws dynamodb describe-table --table-name leavs-main-user-profiles

# Get item
aws dynamodb get-item \
  --table-name leavs-main-user-profiles \
  --key '{"userId": {"S": "abc-123"}}'

# Scan table (all items, use with caution)
aws dynamodb scan --table-name leavs-main-user-profiles

# Count items
aws dynamodb scan --table-name leavs-main-user-profiles --select COUNT
```

---

**End of Database Schema Documentation**
