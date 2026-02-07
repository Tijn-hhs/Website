import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'

export default function ArrivalFirstDaysPage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 5"
        title="Arrival & First Days"
        subtitle="Settle in, handle essentials, and get oriented in your new city."
        showActions={false}
      />
    </DashboardLayout>
  )
}
