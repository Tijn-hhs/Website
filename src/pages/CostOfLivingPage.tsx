import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function CostOfLivingPage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 11"
        title="Cost of Living"
        subtitle="Estimate expenses and build a realistic monthly budget."
        showActions={false}
        infoBox={
          <UserInfoBox
            title="Your Budget Information"
            fields={[
              { key: 'destinationCity', label: 'City' },
              { key: 'monthlyBudget', label: 'Monthly Budget' },
              { key: 'budgetCurrency', label: 'Currency' },
              { key: 'housingBudget', label: 'Housing Budget' },
              { key: 'accommodationType', label: 'Housing Type' },
            ]}
          />
        }
      />
    </DashboardLayout>
  )
}
