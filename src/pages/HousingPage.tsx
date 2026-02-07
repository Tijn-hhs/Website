import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'

export default function HousingPage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 6"
        title="Housing"
        subtitle="Review housing options and secure a place to live."
        showActions={false}
      />
    </DashboardLayout>
  )
}
