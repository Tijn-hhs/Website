import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:healthcare'

export default function HealthcarePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('healthcare')
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
  const requirements = getStepRequirements('healthcare') || []
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
          stepTitle="Healthcare"
          stepDescription="Register with healthcare providers and understand the system. Learn about student health coverage options."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepNumber={9}
        totalSteps={12}
        stepLabel="STEP 9"
        title="Healthcare"
        subtitle="Understand healthcare access, providers, and student coverage."
        userInfoTitle="Your Healthcare Information"
        userInfoFields={[
          { key: 'destinationCountry', label: 'Country' },
          { key: 'healthCoverage', label: 'Health Coverage' },
          { key: 'insuranceProvider', label: 'Insurance Provider' },
          { key: 'doctorPreference', label: 'Doctor Preference' },
        ]}
        checklistItems={checklistItems}
        onChecklistItemToggle={handleChecklistToggle}
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
