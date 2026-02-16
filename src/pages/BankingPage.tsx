import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function BankingPage() {
  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 7"
        title="Banking"
        subtitle="Set up bank accounts and manage financial essentials."
        checklistPageType="banking"
        infoBox={
          <UserInfoBox
            title="Your Banking Status"
            fields={[
              { key: 'destinationCountry', label: 'Country' },
              { key: 'bankAccountNeeded', label: 'Bank Account Needed' },
              { key: 'destinationCity', label: 'City' },
            ]}
          />
        }
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
