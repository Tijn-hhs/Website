import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'

export default function DailyLifePage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 10"
        title="Daily Life"
        subtitle="Set up everyday routines, transport, and local services."
        showActions={false}
      />
    </DashboardLayout>
  )
}
