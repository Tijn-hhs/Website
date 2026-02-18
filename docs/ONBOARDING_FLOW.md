# Onboarding Flow - Student Hub (Leavs)

> **Complete guide to the onboarding system architecture and implementation**  
> Last updated: February 18, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Flow Diagram](#flow-diagram)
3. [Step Configuration](#step-configuration)
4. [Data Model](#data-model)
5. [State Management](#state-management)
6. [Step Pages](#step-pages)
7. [Validation Rules](#validation-rules)
8. [Conditional Logic](#conditional-logic)
9. [Draft Sync to Backend](#draft-sync-to-backend)
10. [User Experience](#user-experience)
11. [Implementation Details](#implementation-details)

---

## Overview

The onboarding system guides new users through a personalized questionnaire to understand their:
- Study destination and program details
- Origin country and citizenship status
- Application and admission status
- Visa requirements and progress
- Current status (housing, banking, documents, etc.)
- Budget and financial planning

### Key Features

- **8 Interactive Steps**: Progressive disclosure of information
- **Conditional Steps**: Steps 3.5 and 5 appear only when relevant
- **Smart Validation**: Each step has custom validation rules
- **Draft Auto-Save**: Changes saved to localStorage every 2 seconds
- **Backend Sync**: Final draft synced to DynamoDB on submission
- **Progress Tracking**: Track which step user is on
- **Unknown Option**: Allow users to proceed even with incomplete information

### Goals

1. **Personalize Experience**: Tailor dashboard to user's situation
2. **Identify Needs**: Understand what guidance user needs
3. **Prioritize Content**: Show most relevant information first
4. **Track Progress**: Know where user is in their journey
5. **Reduce Friction**: Allow "I don't know" answers

---

## Flow Diagram

```
START
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Destination                                         │
│ - Country: Italy (locked)                                   │
│ - City: Milan (locked)                                      │
│ - University: [dropdown selection]                          │
│                                                             │
│ Validation: University must be selected                     │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Origin & Citizenship                                │
│ - Nationality: [country selector]                           │
│ - Residence Country: [country selector]                     │
│ - EU Citizen: Yes / No / Unknown                            │
│                                                             │
│ Validation: All fields must be filled                       │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Program Basics                                      │
│ - Degree Type: Bachelor / Master / PhD / Exchange / Other   │
│ - Field of Study: [text or "I don't know yet"]             │
│ - Program Start Month: [month picker or unknown]           │
│ - Applied: Yes / No                                         │
│ - IF Applied=Yes: Accepted: Yes / No                        │
│                                                             │
│ Validation: Degree type and applied status required         │
└─────────────────────────────────────────────────────────────┘
  │
  ├─ IF Applied = No ──────────────────────────┐
  │                                             ▼
  │                      ┌─────────────────────────────────────────────────┐
  │                      │ Step 3.5: Application Requirements (CONDITIONAL)│
  │                      │ - GMAT/Entrance Test: Yes / No                  │
  │                      │   IF Yes: Score                                 │
  │                      │ - English Test: Yes / No                        │
  │                      │   IF Yes: Type (TOEFL/IELTS) + Score            │
  │                      │ - Recommendation Letters: Yes / No              │
  │                      │ - CV: Yes / No                                  │
  │                      │                                                 │
  │                      │ Validation: All yes/no questions answered       │
  │                      └─────────────────────────────────────────────────┘
  │                                             │
  │◄────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Visa & Documents (CONDITIONAL: non-EU only)         │
│ - Passport Expiry: [date picker]                            │
│ - Visa Type: [text field]                                   │
│ - Visa Appointment Needed: Yes / No / Unknown               │
│ - Has Visa: Yes / No                                        │
│                                                             │
│ Validation: None (all fields optional)                      │
│ Shown Only If: isEuCitizen !== 'yes'                        │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Current Progress                                    │
│ - Codice Fiscale: Yes / No                                  │
│ - Residence Permit: Yes / No                                │
│ - Housing: Yes / No                                         │
│ - Bank Account: Need / Have / No                            │
│ - Phone Number: Need / Have / No                            │
│ - Travel Insurance: Yes / No                                │
│ - Health Insurance: Yes / No                                │
│ - Monthly Budget Range: [ranges]                            │
│ - Scholarship Need: Yes / No / Maybe                        │
│ - Funding Source: [options]                                 │
│ - Housing Preference: [options]                             │
│ - Move-in Window: [date range]                              │
│ - Housing Support Needed: Yes / No / Unknown                │
│                                                             │
│ Validation: None (all fields optional)                      │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 8: Review & Finish                                     │
│ - Show summary of all collected information                 │
│ - Allow user to go back and edit any step                   │
│ - "Finish" button:                                          │
│   1. Sync draft to backend (PUT /user/me)                   │
│   2. Clear localStorage draft                               │
│   3. Navigate to /dashboard                                 │
│                                                             │
│ Validation: None (review only)                              │
└─────────────────────────────────────────────────────────────┘
  │
  ▼
DASHBOARD
```

---

## Step Configuration

Steps are configured in `src/onboarding/steps.ts`:

```typescript
export type StepConfig = {
  id: number                                    // Step number (can be decimal, e.g., 3.5)
  title: string                                 // Step title shown in UI
  subtitle: string                              // Step description/subtitle
  isEnabled: (draft: OnboardingDraft) => boolean // Whether step should appear
  isDisabled?: (draft: OnboardingDraft) => boolean // Whether step should be disabled
  validate: (draft: OnboardingDraft) => boolean  // Validation function
}
```

### All Steps

| Step | ID | Title | Conditional | Validation |
|------|-----|-------|-------------|------------|
| Step 1 | `1` | Destination | Always shown | University selected |
| Step 2 | `2` | Origin and citizenship | Always shown | Nationality, residence, EU status filled |
| Step 3 | `3` | Program basics | Always shown | Degree type and application status filled |
| Step 3.5 | `3.5` | Application requirements | Only if `programApplied === 'no'` | All yes/no questions answered |
| Step 5 | `5` | Visa and documents | Only if `isEuCitizen !== 'yes'` | None (optional) |
| Step 6 | `6` | Current progress | Always shown | None (optional) |
| Step 8 | `8` | Review and finish | Always shown | None (review only) |

**Note**: Step 4 and Step 7 were removed from the flow.

---

## Data Model

### OnboardingDraft Type

The complete type is defined in `src/onboarding/types.ts`:

```typescript
export type OnboardingDraft = {
  // Step 1: Destination
  destinationCountry: string                    // Always "Italy"
  destinationCity: string                       // Always "Milan"
  destinationUniversity: string                 // University name
  destinationUnknownCountry: boolean            // Unused (country locked)
  destinationUnknownCity: boolean               // Unused (city locked)
  destinationUnknownUniversity: boolean         // Can skip university selection
  
  // Step 2: Origin & Citizenship
  nationality: string                           // Country of citizenship
  residenceCountry: string                      // Current country of residence
  isEuCitizen: 'yes' | 'no' | 'unknown'         // EU citizenship status
  
  // Step 3: Program Basics
  degreeType: 'bachelor' | 'master' | 'phd' | 'exchange' | 'other' | ''
  fieldOfStudy: string                          // Field/major
  fieldOfStudyUnknown: boolean                  // "I don't know yet"
  programStartMonth: string                     // Month (e.g., "September 2024")
  programStartMonthUnknown: boolean             // Unknown start date
  programApplied: 'yes' | 'no' | ''             // Whether already applied
  programAccepted: 'yes' | 'no' | ''            // If applied, acceptance status
  
  // Step 3.5: Application Requirements (conditional)
  hasGmatOrEntranceTest: 'yes' | 'no' | ''      // GMAT/entrance test
  gmatScore: string                             // Score (if hasGmat='yes')
  hasEnglishTest: 'yes' | 'no' | ''             // English proficiency test
  englishTestType: string                       // TOEFL, IELTS, etc.
  englishTestScore: string                      // Score
  hasRecommendationLetters: 'yes' | 'no' | ''   // Recommendation letters
  hasCv: 'yes' | 'no' | ''                      // CV/Resume
  
  // Step 5: Visa & Documents (conditional)
  admissionStatus: 'exploring' | 'applying' | 'accepted' | 'enrolled' | ''
  deadlinesKnown: 'yes' | 'no' | 'unknown'
  passportExpiry: string                        // Date
  visaType: string                              // Visa type description
  visaAppointmentNeeded: 'yes' | 'no' | 'unknown'
  hasVisa: 'yes' | 'no' | ''
  
  // Step 6: Current Progress
  hasCodiceFiscale: 'yes' | 'no' | ''
  hasResidencePermit: 'yes' | 'no' | ''
  hasHousing: 'yes' | 'no' | ''
  needsBankAccount: 'yes' | 'no' | ''
  hasBankAccount: 'yes' | 'no' | ''
  needsPhoneNumber: 'yes' | 'no' | ''
  hasPhoneNumber: 'yes' | 'no' | ''
  hasTravelInsurance: 'yes' | 'no' | ''
  hasHealthInsurance: 'yes' | 'no' | ''
  monthlyBudgetRange: 'lt500' | '500-900' | '900-1300' | '1300+' | 'unknown'
  scholarshipNeed: 'yes' | 'no' | 'maybe'
  fundingSource: 'parents' | 'savings' | 'work' | 'scholarship' | 'mixed' | 'unknown'
  housingPreference: 'dorm' | 'private' | 'roommates' | 'unknown'
  moveInWindow: string                          // Date range
  housingSupportNeeded: 'yes' | 'no' | 'unknown'
  
  // Metadata
  lastCompletedStep: number                     // Track progress
  checklistItems: Record<number, Record<string, boolean>> // Checklist state
  updatedAt?: string                            // Last update timestamp
}
```

**Total Fields**: 45+ fields

---

## State Management

### Local State (Draft)

The draft is managed by the `useOnboardingDraft` hook:

```typescript
// src/onboarding/useOnboardingDraft.ts

export function useOnboardingDraft() {
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    // 1. Try to load from localStorage
    const saved = localStorage.getItem('onboardingDraft')
    if (saved) return JSON.parse(saved)
    
    // 2. Otherwise, use default empty draft
    return defaultDraft
  })
  
  // Auto-save to localStorage (debounced 2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('onboardingDraft', JSON.stringify(draft))
    }, 2000)
    return () => clearTimeout(timer)
  }, [draft])
  
  const updateDraft = (updates: Partial<OnboardingDraft>) => {
    setDraft(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }))
  }
  
  const clearDraft = () => {
    localStorage.removeItem('onboardingDraft')
    setDraft(defaultDraft)
  }
  
  return { draft, updateDraft, clearDraft }
}
```

### Persistence Strategy

```
User Input
    │
    ▼
updateDraft() called
    │
    ▼
React state updated (immediate UI update)
    │
    ▼
useEffect triggers (2s debounce)
    │
    ▼
localStorage.setItem('onboardingDraft', JSON.stringify(draft))
    │
    ● Draft persisted across sessions ●
    │
    ▼
User completes Step 8 → "Finish" button
    │
    ▼
syncDraftToBackend(draft)
    │
    ├─ Map draft fields → UserProfile fields
    ├─ PUT /user/me { ...profile }
    └─ Clear localStorage
    │
    ▼
Navigate to /dashboard
```

### Why localStorage?

- **Offline-first**: Works without backend connection
- **Instant save**: No API delays
- **Cross-session**: Survives browser refresh
- **Privacy**: Data stays on user's device until submission

---

## Step Pages

Each step is implemented as a React component in `src/onboarding/pages/`:

### Step 1: Destination

**File**: `Step1Destination.tsx`

**Purpose**: Collect destination information (country, city, university)

**UI Elements**:
- Country selector (disabled, shows "Italy")
- City selector (disabled, shows "Milan")
- University dropdown (active selection)
- "I don't know yet" checkbox

**Validation**: University must be selected OR "I don't know" checked

---

### Step 2: Origin & Citizenship

**File**: `Step2Origin.tsx`

**Purpose**: Understand where user is coming from and citizenship status

**UI Elements**:
- Nationality country selector
- Residence country selector
- EU citizenship radio buttons (Yes / No / Unknown)

**Validation**: All three fields must be filled

**Impact**: Determines if Step 5 (Visa) will be shown

---

### Step 3: Program Basics

**File**: `Step3Program.tsx`

**Purpose**: Collect program details and application status

**UI Elements**:
- Degree type radio buttons
- Field of study text input (with "I don't know yet" checkbox)
- Program start month picker (with "Unknown" checkbox)
- Application status: "Yes, I've applied" / "No, not yet"
- Conditional: If "Yes", show "Have you been accepted?" (Yes/No)

**Validation**: 
- Degree type required
- Application status required
- If applied=yes, acceptance status required

**Impact**: If programApplied='no', show Step 3.5

---

### Step 3.5: Application Requirements (Conditional)

**File**: `Step3bApplication.tsx`

**Purpose**: Gather application progress for students who haven't applied yet

**Shown When**: `draft.programApplied === 'no'`

**UI Elements**:
- GMAT/Entrance test: Yes/No (if yes, show score input)
- English test: Yes/No (if yes, show type selector + score input)
- Recommendation letters: Yes/No
- CV: Yes/No

**Validation**: All yes/no questions must be answered

---

### Step 5: Visa & Documents (Conditional)

**File**: `Step5Visa.tsx`

**Purpose**: Collect visa and document information (for non-EU citizens)

**Shown When**: `draft.isEuCitizen !== 'yes'`

**UI Elements**:
- Passport expiry date picker
- Visa type text input
- Visa appointment needed: Yes / No / Unknown
- Has visa: Yes / No

**Validation**: None (all optional)

---

### Step 6: Current Progress

**File**: `Step6Budget.tsx`

**Purpose**: Understand where user is in the process right now

**UI Elements**:
- Documents: Codice Fiscale, Residence Permit (Yes/No)
- Housing: Secured housing? (Yes/No)
- Banking: Need/Have bank account
- Phone: Need/Have phone number
- Insurance: Travel insurance, health insurance (Yes/No)
- Budget: Monthly budget range selector
- Funding: Scholarship need, funding source
- Housing: Preference (dorm/private/roommates), move-in window
- Support: Need housing support? (Yes/No/Unknown)

**Validation**: None (all optional)

---

### Step 8: Review & Finish

**File**: `Step8ReviewFinish.tsx`

**Purpose**: Review all collected information and submit

**UI Elements**:
- Summary cards for each step (read-only)
- "Edit" buttons to go back to specific steps
- "Finish" button to sync and complete onboarding

**Actions on "Finish"**:
1. Call `syncDraftToBackend(draft)`
2. Clear localStorage draft
3. Navigate to `/dashboard`

**Validation**: None (review only)

---

## Validation Rules

Validation is defined in the `validate` function of each `StepConfig`:

### Step 1 Validation

```typescript
validate: (draft) => {
  return hasValue(draft.destinationUniversity)
}
```

**Rule**: User must select a university (or check "I don't know")

---

### Step 2 Validation

```typescript
validate: (draft) => {
  return hasValue(draft.nationality) && 
         hasValue(draft.residenceCountry) && 
         (draft.isEuCitizen === 'yes' || draft.isEuCitizen === 'no')
}
```

**Rules**:
- Nationality must be filled
- Residence country must be filled
- EU citizenship must be 'yes' or 'no' (not 'unknown')

---

### Step 3 Validation

```typescript
validate: (draft) => {
  if (draft.degreeType === '' || draft.programApplied === '') return false
  if (draft.programApplied === 'yes' && draft.programAccepted === '') return false
  return true
}
```

**Rules**:
- Degree type required
- Program applied status required
- If applied='yes', acceptance status required

---

### Step 3.5 Validation

```typescript
validate: (draft) => {
  return draft.hasGmatOrEntranceTest !== '' && 
         draft.hasEnglishTest !== '' &&
         draft.hasRecommendationLetters !== '' &&
         draft.hasCv !== ''
}
```

**Rules**: All four yes/no questions must be answered

---

### Steps 5, 6, 8 Validation

```typescript
validate: () => true
```

**Rules**: No validation (all fields optional)

---

## Conditional Logic

### Step 3.5: Application Requirements

**Condition**: `draft.programApplied === 'no'`

**Reason**: If user hasn't applied yet, we want to know what application materials they have ready.

**Implementation**:
```typescript
{
  id: 3.5,
  title: 'Application requirements',
  subtitle: 'Let us know about your application progress.',
  isEnabled: (draft) => draft.programApplied === 'no',
  validate: (draft) => { /* ... */ }
}
```

---

### Step 5: Visa & Documents

**Condition**: `draft.isEuCitizen !== 'yes'`

**Reason**: EU citizens don't need a visa to study in Italy.

**Implementation**:
```typescript
{
  id: 5,
  title: 'Visa and documents',
  subtitle: 'Needed for non-EU students or if you are unsure.',
  isEnabled: (draft) => draft.isEuCitizen !== 'yes',
  validate: () => true
}
```

---

## Draft Sync to Backend

After user completes Step 8 and clicks "Finish", the draft is synced to the backend.

### Sync Process

```typescript
// src/onboarding/sync.ts

export async function syncDraftToBackend(draft: OnboardingDraft) {
  // 1. Map draft fields → UserProfile fields
  const profile = {
    universityName: draft.destinationUniversity,
    nationality: draft.nationality,
    studyLevel: draft.degreeType,
    programName: draft.fieldOfStudy,
    startDate: draft.programStartMonth,
    admissionStatus: draft.admissionStatus,
    visaType: draft.visaType,
    passportExpiry: draft.passportExpiry,
    monthlyBudget: mapBudgetRange(draft.monthlyBudgetRange),
    // ... more mappings
  }
  
  // 2. Send to backend
  await api.updateUserProfile(profile)
  
  // 3. Mark onboarding as complete (optional)
  await api.markStepCompleted('onboarding-complete')
}
```

### Field Mapping

| Draft Field | Profile Field |
|-------------|---------------|
| `destinationUniversity` | `universityName` |
| `nationality` | `nationality` |
| `degreeType` | `studyLevel` |
| `fieldOfStudy` | `programName` |
| `programStartMonth` | `startDate` |
| `admissionStatus` | `admissionStatus` |
| `visaType` | `visaType` |
| `passportExpiry` | `passportExpiry` |
| `monthlyBudgetRange` | `monthlyBudget` (converted to number) |
| `hasHousing` | `accommodationType` (mapped to description) |
| `hasBankAccount` | `bankAccountNeeded` |
| `hasHealthInsurance` | `healthCoverage` |
| ... | ... |

**Note**: Not all draft fields map directly to profile fields. Some are used for internal logic only.

---

## User Experience

### Navigation

Users move through steps using:
- **"Continue" button**: Advances to next enabled step
- **"Back" button**: Returns to previous step
- **Direct navigation**: Clicking step numbers in progress bar (if step unlocked)

### Progress Indicator

```
[●]──[●]──[●]──[○]──[○]──[○]──[○]
 1    2    3    3.5  5    6    8
```

- **Filled circle (●)**: Completed step
- **Empty circle (○)**: Upcoming step
- **Current step**: Highlighted

### Validation Feedback

- **Green checkmark**: Step validated successfully
- **Red error**: Validation failed, show error message
- **Disabled "Continue"**: Cannot proceed until validation passes

### Auto-Save Indicator

- **"Saving..."**: Shown while debouncing
- **"Saved"**: Shown after localStorage write
- **No indicator**: Default state (draft saved)

### Conditional Step UI

- **Step 3.5**: Only appears in progress bar if `programApplied === 'no'`
- **Step 5**: Only appears in progress bar if `isEuCitizen !== 'yes'`
- **Numbering adjusted dynamically**

---

## Implementation Details

### File Structure

```
src/onboarding/
├── index.ts                  # Public API exports
├── types.ts                  # OnboardingDraft type
├── defaultDraft.ts           # Empty draft template
├── steps.ts                  # Step configuration
├── stepRequirements.ts       # Checklist items per dashboard page
├── useOnboardingDraft.ts     # Draft state hook
├── sync.ts                   # Backend sync logic
├── ui.ts                     # Shared UI components
├── OnboardingLayout.tsx      # Layout wrapper
│
├── pages/                    # Step pages
│   ├── OnboardingStart.tsx   # Welcome page (before Step 1)
│   ├── Step1Destination.tsx
│   ├── Step2Origin.tsx
│   ├── Step3Program.tsx
│   ├── Step3bApplication.tsx
│   ├── Step5Visa.tsx
│   ├── Step6Budget.tsx
│   └── Step8ReviewFinish.tsx
│
└── components/               # Onboarding-specific components
    ├── DestinationForm.tsx
    ├── OriginForm.tsx
    ├── ProgramForm.tsx
    ├── ApplicationForm.tsx
    ├── VisaForm.tsx
    ├── BudgetForm.tsx
    └── ReviewSummary.tsx
```

### Routing

Defined in `src/App.tsx`:

```typescript
<Routes>
  <Route path="/onboarding" element={<OnboardingStart />} />
  <Route path="/onboarding/1" element={<Step1Destination />} />
  <Route path="/onboarding/2" element={<Step2Origin />} />
  <Route path="/onboarding/3" element={<Step3Program />} />
  <Route path="/onboarding/3.5" element={<Step3bApplication />} />
  <Route path="/onboarding/5" element={<Step5Visa />} />
  <Route path="/onboarding/6" element={<Step6Budget />} />
  <Route path="/onboarding/8" element={<Step8ReviewFinish />} />
</Routes>
```

### Navigation Logic

```typescript
// In each step page
const navigate = useNavigate()
const { draft, updateDraft } = useOnboardingDraft()

const handleContinue = () => {
  // Validate current step
  const currentStep = getStepConfig(currentStepId)
  if (!currentStep.validate(draft)) {
    setError('Please complete all required fields')
    return
  }
  
  // Find next enabled step
  const nextStep = onboardingSteps.find(step => 
    step.id > currentStepId && step.isEnabled(draft)
  )
  
  if (nextStep) {
    navigate(`/onboarding/${nextStep.id}`)
  } else {
    // No more steps, go to dashboard
    navigate('/dashboard')
  }
}
```

### Default Values

```typescript
// src/onboarding/defaultDraft.ts

export const defaultDraft: OnboardingDraft = {
  destinationCountry: 'Italy',
  destinationCity: 'Milan',
  destinationUniversity: '',
  destinationUnknownCountry: false,
  destinationUnknownCity: false,
  destinationUnknownUniversity: false,
  nationality: '',
  residenceCountry: '',
  isEuCitizen: 'unknown',
  degreeType: '',
  fieldOfStudy: '',
  fieldOfStudyUnknown: false,
  programStartMonth: '',
  programStartMonthUnknown: false,
  programApplied: '',
  programAccepted: '',
  hasGmatOrEntranceTest: '',
  gmatScore: '',
  hasEnglishTest: '',
  englishTestType: '',
  englishTestScore: '',
  hasRecommendationLetters: '',
  hasCv: '',
  // ... all other fields initialized to empty strings or booleans
}
```

---

## Testing Checklist

### Manual Testing

1. **Happy Path**: Complete all steps with valid data
2. **Validation**: Try to proceed without filling required fields
3. **Conditional Logic**: Test different answers to trigger/hide steps
4. **Auto-Save**: Refresh page mid-flow, verify draft restored
5. **Backend Sync**: Complete onboarding, check DynamoDB for profile
6. **Navigation**: Use Back button, direct step navigation
7. **Unknown Options**: Select "I don't know" for various fields
8. **Mobile**: Test on small screens

### Edge Cases

1. **Empty localStorage**: First-time user
2. **Corrupted draft**: Invalid JSON in localStorage
3. **Network failure**: Backend sync fails
4. **Token expiration**: Auth token expires during onboarding
5. **Rapid changes**: Type quickly, verify debounce works
6. **Browser back button**: Pressing browser back/forward
7. **Multiple tabs**: Two tabs open to same onboarding step

---

## Future Enhancements

### Planned Features

1. **Resume from Dashboard**: Allow users to re-enter onboarding to update answers
2. **Progress API**: Sync `lastCompletedStep` to backend
3. **Smart Defaults**: Pre-fill fields based on user's IP or profile
4. **Field Dependencies**: More dynamic conditional fields
5. **Multi-Language**: Translate all steps to Italian
6. **Accessibility**: Full screen reader support
7. **Analytics**: Track completion rates per step

### Possible Improvements

1. **Step 4 & 7**: Re-introduce removed steps if needed
2. **Tooltip Help**: Add help icons with explanations
3. **Inline Validation**: Real-time validation as user types
4. **Progress Percentage**: Show "45% complete" indicator
5. **Save & Exit**: Allow users to pause and resume later
6. **Email Reminders**: Remind users to complete onboarding
7. **A/B Testing**: Test different question orders

---

**End of Onboarding Flow Documentation**
