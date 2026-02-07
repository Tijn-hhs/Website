import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'

export default function LegalBankingInsurancePage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 7"
        title="Legal, Banking & Insurance"
        subtitle="Get legal basics, banking access, and insurance coverage in place."
        showActions={false}
      />
    </DashboardLayout>
  )
}
