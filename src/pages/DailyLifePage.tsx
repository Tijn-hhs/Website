import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function DailyLifePage() {
  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 11"
        title="Daily Life"
        subtitle="Set up everyday routines, transport, and local services."
        checklistPageType="daily-life"
        infoBox={
          <UserInfoBox
            title="Your Daily Life Setup"
            fields={[
              { key: 'destinationCity', label: 'City' },
              { key: 'localTransport', label: 'Local Transport' },
              { key: 'communityInterest', label: 'Community Interest' },
              { key: 'supportNeeds', label: 'Support Needs' },
            ]}
          />
        }
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
