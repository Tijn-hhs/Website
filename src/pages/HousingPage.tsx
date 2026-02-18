import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import FindYourNeighborhood from '../components/FindYourNeighborhood'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { fetchMe } from '../lib/api'
import { getStepRequirements } from '../onboarding/stepRequirements'
import type { UserProfile } from '../types/user'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:housing'

export default function HousingPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('housing')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
    const loadUserData = async () => {
      try {
        const data = await fetchMe()
        setProfile(data.profile || {})
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Get checklist items from step requirements
  const requirements = getStepRequirements('housing') || []
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
          stepTitle="Find your apartment"
          stepDescription="Find and secure accommodation for your stay. Get personalized neighborhood recommendations and housing resources."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
        stepNumber={7}
        totalSteps={13}
        stepLabel="STEP 7"
        title="Find your apartment"
        subtitle="Discover the perfect neighborhood and secure a place to live."
        useGradientBar={true}
        userInfoTitle="Your Housing Information"
        userInfoFields={[
          { key: 'destinationCity', label: 'City' },
          { key: 'destinationUniversity', label: 'University' },
          { key: 'housingPreference', label: 'Preference' },
          { key: 'programStartMonth', label: 'Program Start' },
        ]}
        checklistItems={checklistItems}
        onChecklistItemToggle={handleChecklistToggle}
      >
        {isLoading ? (
          <div className="col-span-full">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            </article>
          </div>
        ) : (
          <FindYourNeighborhood profile={profile} />
        )}
        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
