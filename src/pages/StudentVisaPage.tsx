import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import InfoCard from '../components/InfoCard'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { fetchMe } from '../lib/api'
import { getStepRequirements } from '../onboarding/stepRequirements'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:student-visa'

export default function StudentVisaPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('student-visa')
  const [isEuCitizen, setIsEuCitizen] = useState(false)
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

  useEffect(() => {
    const checkEuCitizenStatus = async () => {
      try {
        const data = await fetchMe()
        // Read from individual profile fields
        if (data?.profile?.isEuCitizen !== undefined) {
          setIsEuCitizen(data.profile.isEuCitizen === 'yes')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    checkEuCitizenStatus()
  }, [])

  // Get checklist items from step requirements
  const requirements = getStepRequirements('student-visa') || []
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

  if (isEuCitizen) {
    return (
      <>
        {showModal && (
          <StepIntroModal
            stepTitle="Student Visa"
            stepDescription="Apply for your student visa and prepare all required documentation."
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        )}
        <FeedbackWidget />
        <DashboardLayout>
          <StepPageLayout
            stepNumber={2}
            totalSteps={13}
            stepLabel="STEP 2"
            title="Student Visa"
            subtitle="Prepare, apply, and track your visa with confidence."
            checklistItems={checklistItems}
            onChecklistItemToggle={handleChecklistToggle}
            useGradientBar={true}
          >

            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Not applicable for EU citizens</h3>
              <p className="text-amber-700">
                Since you're an EU citizen, you don't need to go through the student visa process. 
                You have freedom of movement within the EU and can travel and study freely.
              </p>
            </div>
          </StepPageLayout>
        </DashboardLayout>
      </>
    )
  }

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Student Visa"
          stepDescription="Apply for your student visa and prepare all required documentation."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={2}
          totalSteps={13}
          stepLabel="STEP 2"
          title="Student Visa"
          subtitle="Prepare, apply, and track your visa with confidence."
          useGradientBar={true}
          userInfoTitle="Your Visa Information"
          userInfoFields={[
            { key: 'nationality', label: 'Nationality' },
            { key: 'destinationCountry', label: 'Destination' },
            { key: 'isEuCitizen', label: 'EU Citizen', formatter: (val) => val ? 'Yes' : 'No' },
            { key: 'hasVisa', label: 'Has Visa', formatter: (val) => val ? 'Yes' : 'No' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
        >
        <InfoCard title="Overview">
          <p>
            Understand your consulate jurisdiction, timeline, and required
            documents before you book your appointment.
          </p>
        </InfoCard>

        <InfoCard title="Checklist">
          <ul className="space-y-2">
            <li>Confirm the correct consulate and appointment process.</li>
            <li>Book a visa appointment and track processing timelines.</li>
            <li>Prepare financial proof and accommodation evidence.</li>
            <li>Submit biometric data and attend the interview.</li>
          </ul>
        </InfoCard>

        <InfoCard title="Required documents">
          <ul className="space-y-2">
            <li>Valid passport and recent photos.</li>
            <li>University acceptance letter.</li>
            <li>Financial proof (bank statements or sponsor letter).</li>
            <li>Health insurance coverage certificate.</li>
            <li>Proof of accommodation.</li>
          </ul>
        </InfoCard>

        <InfoCard title="Tips &amp; common mistakes">
          <ul className="space-y-2">
            <li>Check document validity dates before submitting.</li>
            <li>Allow extra time for peak-season processing delays.</li>
            <li>Bring originals and copies to the appointment.</li>
            <li>Keep receipts and tracking numbers for follow-up.</li>
          </ul>
        </InfoCard>
        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
