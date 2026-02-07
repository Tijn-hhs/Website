import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'

export default function HealthcarePage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 8"
        title="Healthcare"
        subtitle="Understand healthcare access, providers, and student coverage."
        showActions={false}
      />
    </DashboardLayout>
  )
}
