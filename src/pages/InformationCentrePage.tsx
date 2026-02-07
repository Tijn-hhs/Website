import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'

export default function InformationCentrePage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 9"
        title="Information Centre"
        subtitle="Find key services, contacts, and student resources quickly."
        showActions={false}
      />
    </DashboardLayout>
  )
}
