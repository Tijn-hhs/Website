import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'

export default function CostOfLivingPage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 11"
        title="Cost of Living"
        subtitle="Estimate expenses and build a realistic monthly budget."
        showActions={false}
      />
    </DashboardLayout>
  )
}
