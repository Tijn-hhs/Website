# Step Onboarding Pattern

This document explains the guided onboarding pop-up system used for dashboard steps (first implemented on the Cost of Living page). Follow this guide to add the same flow to any other step.

---

## Overview of the Flow

When a user opens a step page for the **first time**, the following sequence happens:

```
User navigates to step page
        ↓
DB check: has the step been started before?
        ↓ NO
StepIntroModal appears ("Yes, Start This Step")
        ↓ User clicks confirm
Guided Onboarding modal opens (multi-step wizard)
        ↓ User clicks "Complete"
  markStepStarted(stepKey) called → DB updated
  User lands on the normal step page
        ↓
Next visit: DB shows started → no modal shown
```

If the user **exits** the guided onboarding, they are sent back to the dashboard and the step is **not** marked as started.

---

## Components Involved

| Component | File | Purpose |
|-----------|------|---------|
| `StepIntroModal` | `src/components/StepIntroModal.tsx` | First pop-up: "Ready to start?" |
| `YourStepOnboarding` | `src/components/YourStepOnboarding.tsx` | Full-screen wizard (you build this per step) |
| `markStepStarted` | `src/lib/api.ts` | API call that writes to the DB |
| `fetchMe` | `src/lib/api.ts` | Fetches user data + step progress |

---

## Step-by-Step: Adding the Pattern to a New Step

### 1. Build your `<StepNameOnboarding />` component

Create `src/components/YourStepOnboarding.tsx`. Use `CostOfLivingOnboarding.tsx` as the reference.

**Required props interface:**
```tsx
interface YourStepOnboardingProps {
  onComplete: () => void   // called when user finishes all steps
  onExit?: () => void      // called when user clicks the X button and confirms exit
  // add any step-specific props (e.g. city, initialValues)
}
```

**Required behaviours inside the component:**

**a) Scroll lock** — add this `useEffect` at the top of the component:
```tsx
useEffect(() => {
  const originalOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  return () => {
    document.body.style.overflow = originalOverflow
  }
}, [])
```

**b) Exit button with confirmation** — show a round X button in the header:
```tsx
// State
const [showExitConfirm, setShowExitConfirm] = useState(false)

// Handler
const handleExitConfirm = () => {
  if (onExit) onExit()
}
```
Render a confirmation dialog before calling `onExit`, so the user doesn't lose progress accidentally.

**c) Call `onComplete()` when the user finishes the last step.** This is where the DB write happens (in the page, not the component).

**d) Tour overlay (optional)** — if you want a 3–4 step tooltip tour on the first screen, copy the `tourSteps` array and `renderTourTooltip()` pattern from `CostOfLivingOnboarding.tsx`. Apply highlight rings to actual elements using a helper like:
```tsx
const getHighlightClass = (targetId: string) => {
  if (!showTour) return ''
  const currentTarget = tourSteps[tourStep]?.target
  if (currentTarget === targetId) {
    return 'relative z-[25] rounded-xl shadow-2xl ring-4 ring-blue-500 ring-offset-2 animate-pulse'
  }
  if (currentTarget) return 'opacity-30'
  return ''
}
```

---

### 2. Update the step's page component

Open `src/pages/YourStepPage.tsx` and make the following changes.

**a) Add imports:**
```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StepIntroModal from '../components/StepIntroModal'
import YourStepOnboarding from '../components/YourStepOnboarding'
import { fetchMe, markStepStarted } from '../lib/api'
```

**b) Add state variables** at the top of the component:
```tsx
const navigate = useNavigate()
const [showIntroModal, setShowIntroModal] = useState(false)
const [isCheckingStatus, setIsCheckingStatus] = useState(true)
const [showGuidedOnboarding, setShowGuidedOnboarding] = useState(false)
```

**c) Add a `useEffect` to check the DB on mount:**
```tsx
useEffect(() => {
  const checkStepStatus = async () => {
    try {
      const data = await fetchMe()
      const stepProgress = data.progress?.find(p => p.stepKey === 'your-step-key')

      if (!stepProgress || !stepProgress.started) {
        setShowIntroModal(true)
        // Clear any stale localStorage flags for this step
        window.localStorage.removeItem('your-step-onboarding-completed')
      }
    } catch (error) {
      console.error('Error checking step status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }
  checkStepStatus()
}, [])
```
> **Important:** The `stepKey` string (e.g. `'cost-of-living'`) must match exactly what is registered in the backend. Check `amplify/functions/userApi/handler.ts` for the list of valid step keys.

**d) Add the three handlers:**
```tsx
// User clicks "Yes, Start This Step" on the intro modal
const handleConfirm = async () => {
  setShowIntroModal(false)
  setTimeout(() => {
    setShowGuidedOnboarding(true)
  }, 100)  // small delay lets the intro modal fully unmount first
}

// User exits the guided onboarding (X button → confirm)
const handleOnboardingExit = () => {
  setShowGuidedOnboarding(false)
  navigate('/dashboard')  // send them back, step NOT marked as started
}

// User completes the guided onboarding
const handleOnboardingComplete = async () => {
  setShowGuidedOnboarding(false)
  try {
    await markStepStarted('your-step-key')
  } catch (error) {
    console.error('Error marking step as started:', error)
  }
}
```

**e) Render the modals** at the very top of the JSX return, before the page layout:
```tsx
return (
  <>
    {showIntroModal && (
      <StepIntroModal
        stepTitle="Your Step Title"
        stepDescription="Short one-line description of what this step is about."
        onConfirm={handleConfirm}
        onBack={() => window.history.back()}
      />
    )}
    {showGuidedOnboarding && (
      <YourStepOnboarding
        onComplete={handleOnboardingComplete}
        onExit={handleOnboardingExit}
        // pass any other props your component needs
      />
    )}

    {/* rest of the page layout */}
  </>
)
```

---

## Key Rules

| Rule | Why |
|------|-----|
| `markStepStarted` is only called inside `handleOnboardingComplete` | Ensures the DB flag is set only after the user has actually gone through the onboarding, not just clicked "start" |
| `handleOnboardingExit` calls `navigate('/dashboard')` | Prevents the user from landing on the raw step page before completing setup |
| Scroll is locked inside the component (not the page) | The component is responsible for its own side-effects; the page doesn't need to know |
| DB is the source of truth, not localStorage | localStorage can persist across sessions and lead to the modal never showing again; always clear it when the DB says `started = false` |
| `setTimeout(..., 100)` between closing intro modal and opening onboarding | Prevents a visual flicker where both modals are briefly mounted/unmounted at the same time |

---

## Reference Files

- Onboarding component: [src/components/CostOfLivingOnboarding.tsx](../src/components/CostOfLivingOnboarding.tsx)
- Page integration: [src/pages/CostOfLivingPage.tsx](../src/pages/CostOfLivingPage.tsx)
- Intro modal (shared, no changes needed): [src/components/StepIntroModal.tsx](../src/components/StepIntroModal.tsx)
- API functions: [src/lib/api.ts](../src/lib/api.ts)
