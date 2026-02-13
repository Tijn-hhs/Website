import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function HealthcarePage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 8"
        title="Healthcare"
        subtitle="Understand healthcare access, providers, and student coverage."
        showActions={false}
        infoBox={
          <UserInfoBox
            title="Your Healthcare Information"
            fields={[
              { key: 'destinationCountry', label: 'Country' },
              { key: 'healthCoverage', label: 'Health Coverage' },
              { key: 'insuranceProvider', label: 'Insurance Provider' },
              { key: 'doctorPreference', label: 'Doctor Preference' },
            ]}
          />
        }
      />
    </DashboardLayout>
  )
}
