import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:arrival-first-days'

export default function ArrivalFirstDaysPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('arrival-first-days')
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
  const requirements = getStepRequirements('arrival-first-days') || []
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
          stepTitle="Arrival & First Days"
          stepDescription="Navigate your arrival and settle into your new city. Get oriented with essential services and locations."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepNumber={5}
        totalSteps={12}
        stepLabel="STEP 5"
        title="Arrival & First Days"
        subtitle="Settle in, handle essentials, and get oriented in your new city."
        userInfoTitle="Your Arrival Details"
        userInfoFields={[
          { key: 'destinationCity', label: 'City' },
          { key: 'arrivalDate', label: 'Arrival Date', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
          { key: 'accommodationType', label: 'Housing Type' },
          { key: 'localTransport', label: 'Local Transport' },
          { key: 'universityName', label: 'University' },
        ]}
        checklistItems={checklistItems}
        onChecklistItemToggle={handleChecklistToggle}
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
