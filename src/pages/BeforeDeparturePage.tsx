import DashboardLayout from '../components/DashboardLayout'
import InfoCard from '../components/InfoCard'
import StepPageLayout from '../components/StepPageLayout'
import UserInfoBox from '../components/UserInfoBox'

export default function BeforeDeparturePage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 3"
        title="Before Departure"
        subtitle="Get your plans, paperwork, and essentials ready before you fly."
        secondaryActionLabel="Save for later"
        infoBox={
          <UserInfoBox
            title="Your Travel Information"
            fields={[
              { key: 'destinationCity', label: 'Destination' },
              { key: 'travelDate', label: 'Travel Date', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
              { key: 'flightsBooked', label: 'Flights Booked' },
              { key: 'arrivalDate', label: 'Arrival Date', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Not set' },
              { key: 'startDate', label: 'Program Start', formatter: (val) => val ? new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Not set' },
            ]}
          />
        }
      >
        <InfoCard title="Overview">
          <p>
            Plan your travel, organize paperwork, and prepare practical items so
            your arrival goes smoothly.
          </p>
        </InfoCard>

        <InfoCard title="Checklist">
          <ul className="space-y-2">
            <li>Pack core documents in your carry-on.</li>
            <li>Confirm housing details and arrival instructions.</li>
            <li>Arrange international banking access.</li>
            <li>Share your itinerary with a trusted contact.</li>
          </ul>
        </InfoCard>

        <InfoCard title="Travel planning">
          <ul className="space-y-2">
            <li>Book flights to arrive before key orientation dates.</li>
            <li>Plan temporary housing if your lease starts later.</li>
            <li>Map the route from the airport to your accommodation.</li>
          </ul>
        </InfoCard>

        <InfoCard title="Tips &amp; reminders">
          <ul className="space-y-2">
            <li>Keep digital copies of documents in secure storage.</li>
            <li>Prepare emergency contacts and local SIM options.</li>
            <li>Pack power adapters and essential medications.</li>
          </ul>
        </InfoCard>
      </StepPageLayout>
    </DashboardLayout>
  )
}
