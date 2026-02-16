import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function ArrivalFirstDaysPage() {
  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 5"
        title="Arrival & First Days"
        subtitle="Settle in, handle essentials, and get oriented in your new city."
        checklistPageType="arrival-first-days"
        infoBox={
          <UserInfoBox
            title="Your Arrival Details"
            fields={[
              { key: 'destinationCity', label: 'City' },
              { key: 'arrivalDate', label: 'Arrival Date', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
              { key: 'accommodationType', label: 'Housing Type' },
              { key: 'localTransport', label: 'Local Transport' },
              { key: 'universityName', label: 'University' },
            ]}
          />
        }
      >
      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
