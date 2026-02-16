import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'

export default function InformationCentrePage() {
  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 10"
        title="Information Centre"
        subtitle="Find key services, contacts, and student resources quickly."
        checklistPageType="information-centre"
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
