import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function HousingPage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 6"
        title="Housing"
        subtitle="Review housing options and secure a place to live."
        showActions={false}
        infoBox={
          <UserInfoBox
            title="Your Housing Information"
            fields={[
              { key: 'destinationCity', label: 'City' },
              { key: 'accommodationType', label: 'Housing Type' },
              { key: 'housingBudget', label: 'Budget' },
              { key: 'leaseStart', label: 'Lease Start', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
              { key: 'startDate', label: 'Program Start', formatter: (val) => val ? new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Not set' },
            ]}
          />
        }
      />
    </DashboardLayout>
  )
}
