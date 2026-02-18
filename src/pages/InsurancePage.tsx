import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:insurance'

export default function InsurancePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('insurance')
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
  const requirements = getStepRequirements('insurance') || []
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
          stepTitle="Insurance"
          stepDescription="Arrange insurance coverage for health and personal protection. Understand what insurance you need as a student."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepNumber={8}
        totalSteps={12}
        stepLabel="STEP 8"
        title="Insurance"
        subtitle="Arrange insurance coverage for health and personal protection."
        userInfoTitle="Your Insurance Status"
        userInfoFields={[
          { key: 'destinationCountry', label: 'Country' },
          { key: 'insuranceProvider', label: 'Insurance Provider' },
          { key: 'legalDocsReady', label: 'Legal Documents Ready' },
        ]}
        checklistItems={checklistItems}
        onChecklistItemToggle={handleChecklistToggle}
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
