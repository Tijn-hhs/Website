import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function ImmigrationRegistrationPage() {
  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 4"
        title="Immigration & Registration"
        subtitle="Complete local registrations and immigration formalities after arrival."
        checklistPageType="immigration-registration"
        infoBox={
          <UserInfoBox
            title="Your Registration Status"
            fields={[
              { key: 'destinationCountry', label: 'Country' },
              { key: 'destinationCity', label: 'City' },
              { key: 'arrivalDate', label: 'Arrival Date', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
              { key: 'registrationStatus', label: 'Registration Status' },
              { key: 'residencePermitNeeded', label: 'Residence Permit Needed' },
            ]}
          />
        }
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
