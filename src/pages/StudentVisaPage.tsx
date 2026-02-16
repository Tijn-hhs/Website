import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import InfoCard from '../components/InfoCard'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'
import { fetchMe } from '../lib/api'
import type { OnboardingDraft } from '../onboarding/types'

export default function StudentVisaPage() {
  const [isEuCitizen, setIsEuCitizen] = useState(false)

  useEffect(() => {
    const checkEuCitizenStatus = async () => {
      try {
        const data = await fetchMe()
        if (data?.profile?.onboardingDraftJson) {
          const draft: OnboardingDraft = JSON.parse(data.profile.onboardingDraftJson)
          setIsEuCitizen(draft.isEuCitizen === 'yes')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    checkEuCitizenStatus()
  }, [])

  if (isEuCitizen) {
    return (
      <>
        <FeedbackWidget />
        <DashboardLayout>
          <StepPageLayout
            stepLabel="Step 2"
            title="Student Visa"
            subtitle="Prepare, apply, and track your visa with confidence."
          >
            <StepChecklist pageType="student-visa" />

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
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepLabel="Step 2"
          title="Student Visa"
          subtitle="Prepare, apply, and track your visa with confidence."
          checklistPageType="student-visa"
          secondaryActionLabel="Save for later"
        infoBox={
          <UserInfoBox
            title="Your Visa Information"
            fields={[
              { key: 'nationality', label: 'Nationality' },
              { key: 'destinationCountry', label: 'Destination' },
              { key: 'visaType', label: 'Visa Type' },
              { key: 'passportExpiry', label: 'Passport Expiry', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
              { key: 'visaAppointmentDate', label: 'Appointment', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
            ]}
          />
        }
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
