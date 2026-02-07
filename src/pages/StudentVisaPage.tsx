import DashboardLayout from '../components/DashboardLayout'
import InfoCard from '../components/InfoCard'
import StepPageLayout from '../components/StepPageLayout'

export default function StudentVisaPage() {
  return (
    <DashboardLayout>
      <StepPageLayout
        stepLabel="Step 2"
        title="Student Visa"
        subtitle="Prepare, apply, and track your visa with confidence."
        secondaryActionLabel="Save for later"
      >
        <InfoCard title="Overview">
          <p>
            Understand your consulate jurisdiction, timeline, and required
            documents before you book your appointment.
          </p>
        </InfoCard>

        <InfoCard title="Checklist">
          <ul className="space-y-2">
            <li>Confirm the correct consulate and appointment process.</li>
            <li>Book a visa appointment and track processing timelines.</li>
            <li>Prepare financial proof and accommodation evidence.</li>
            <li>Submit biometric data and attend the interview.</li>
          </ul>
        </InfoCard>

        <InfoCard title="Required documents">
          <ul className="space-y-2">
            <li>Valid passport and recent photos.</li>
            <li>University acceptance letter.</li>
            <li>Financial proof (bank statements or sponsor letter).</li>
            <li>Health insurance coverage certificate.</li>
            <li>Proof of accommodation.</li>
          </ul>
        </InfoCard>

        <InfoCard title="Tips &amp; common mistakes">
          <ul className="space-y-2">
            <li>Check document validity dates before submitting.</li>
            <li>Allow extra time for peak-season processing delays.</li>
            <li>Bring originals and copies to the appointment.</li>
            <li>Keep receipts and tracking numbers for follow-up.</li>
          </ul>
        </InfoCard>
      </StepPageLayout>
    </DashboardLayout>
  )
}
