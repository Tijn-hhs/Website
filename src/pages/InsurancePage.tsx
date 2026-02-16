import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function InsurancePage() {
  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 8"
        title="Insurance"
        subtitle="Arrange insurance coverage for health and personal protection."
        checklistPageType="insurance"
        infoBox={
          <UserInfoBox
            title="Your Insurance Status"
            fields={[
              { key: 'destinationCountry', label: 'Country' },
              { key: 'insuranceProvider', label: 'Insurance Provider' },
              { key: 'legalDocsReady', label: 'Legal Documents Ready' },
            ]}
          />
        }
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
