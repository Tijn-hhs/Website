import DashboardLayout from '../components/DashboardLayout'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function ArrivalFirstDaysPage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 5"
        title="Arrival & First Days"
        subtitle="Settle in, handle essentials, and get oriented in your new city."
        showActions={false}
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
      />
    </DashboardLayout>
  )
}
