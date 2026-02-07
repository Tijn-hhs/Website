import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'

export default function ImmigrationRegistrationPage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 4"
        title="Immigration & Registration"
        subtitle="Complete local registrations and immigration formalities after arrival."
        showActions={false}
      />
    </DashboardLayout>
  )
}
