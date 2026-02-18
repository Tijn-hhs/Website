import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import InfoCard from '../components/InfoCard'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:before-departure'

export default function BeforeDeparturePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('before-departure')
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
  const requirements = getStepRequirements('before-departure') || []
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
          stepTitle="Before Departure"
          stepDescription="Get vaccinations, arrange travel, and prepare for your move."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={3}
          totalSteps={12}
          stepLabel="STEP 3"
          title="Before Departure"
          subtitle="Get your plans, paperwork, and essentials ready before you fly."
          userInfoTitle="Your Travel Information"
          userInfoFields={[
            { key: 'destinationCity', label: 'Destination' },
            { key: 'travelDate', label: 'Travel Date', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
            { key: 'flightsBooked', label: 'Flights Booked' },
            { key: 'arrivalDate', label: 'Arrival Date', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
            { key: 'startDate', label: 'Program Start', formatter: (val) => val ? new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Not set' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
        >
          <InfoCard title="Overview">
            <p>
              Plan your travel, organize paperwork, and prepare practical items so
              your arrival goes smoothly.
            </p>
          </InfoCard>

          <InfoCard title="Checklist">
            <ul className="space-y-2">
              <li>Pack core documents in your carry-on.</li>
              <li>Confirm housing details and arrival instructions.</li>
              <li>Arrange international banking access.</li>
              <li>Share your itinerary with a trusted contact.</li>
            </ul>
          </InfoCard>

          <InfoCard title="Travel planning">
            <ul className="space-y-2">
              <li>Book flights to arrive before key orientation dates.</li>
              <li>Plan temporary housing if your lease starts later.</li>
              <li>Map the route from the airport to your accommodation.</li>
            </ul>
          </InfoCard>

          <InfoCard title="Tips &amp; reminders">
            <ul className="space-y-2">
              <li>Keep digital copies of documents in secure storage.</li>
              <li>Prepare emergency contacts and local SIM options.</li>
              <li>Pack power adapters and essential medications.</li>
            </ul>
          </InfoCard>
        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
