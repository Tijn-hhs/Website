import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function LegalBankingInsurancePage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 7"
        title="Legal, Banking & Insurance"
        subtitle="Get legal basics, banking access, and insurance coverage in place."
        showActions={false}
        infoBox={
          <UserInfoBox
            title="Your Legal & Banking Status"
            fields={[
              { key: 'destinationCountry', label: 'Country' },
              { key: 'bankAccountNeeded', label: 'Bank Account Needed' },
              { key: 'insuranceProvider', label: 'Insurance Provider' },
              { key: 'legalDocsReady', label: 'Legal Documents Ready' },
              { key: 'residencePermitNeeded', label: 'Residence Permit Needed' },
            ]}
          />
        }
      />
    </DashboardLayout>
  )
}
