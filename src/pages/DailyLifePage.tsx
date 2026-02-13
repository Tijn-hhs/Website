import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function DailyLifePage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 10"
        title="Daily Life"
        subtitle="Set up everyday routines, transport, and local services."
        showActions={false}
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
      />
    </DashboardLayout>
  )
}
