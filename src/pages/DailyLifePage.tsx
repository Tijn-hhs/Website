import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:daily-life'

export default function DailyLifePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('daily-life')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})

  // Load checklist state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) {
        try {
          setChecklistState(JSON.parse(saved))
        } catch {
          setChecklistState({})
        }
      }
    }
  }, [])

  // Get checklist items from step requirements
  const requirements = getStepRequirements('daily-life') || []
  const checklistItems = requirements.map((req) => ({
    ...req,
    completed: checklistState[req.id] || false,
  }))

  // Handle checklist item toggle
  const handleChecklistToggle = (id: string, completed: boolean) => {
    const newState = {
      ...checklistState,
      [id]: completed,
    }
    setChecklistState(newState)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState))
    }
  }
  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Daily Life"
          stepDescription="Learn about culture, transportation, and local customs."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepNumber={11}
        totalSteps={12}
        stepLabel="STEP 11"
        title="Daily Life"
        subtitle="Set up everyday routines, transport, and local services."
        userInfoTitle="Your Daily Life Setup"
        userInfoFields={[
          { key: 'destinationCity', label: 'City' },
          { key: 'localTransport', label: 'Local Transport' },
          { key: 'mobileProvider', label: 'Mobile Provider' },
        ]}
        checklistItems={checklistItems}
        onChecklistItemToggle={handleChecklistToggle}
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
