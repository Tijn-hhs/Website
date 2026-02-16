import { Link } from 'react-router-dom'
import Accordion from '../components/Accordion'
import CalloutCard from '../components/CalloutCard'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import InfoSectionCard from '../components/InfoSectionCard'
import StepHeader from '../components/StepHeader'
import UserInfoBox from '../components/UserInfoBox'
import StepChecklist from '../onboarding/components/StepChecklist'

export default function UniversityApplicationPage() {
  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
        <section className="space-y-8">
        <StepHeader
          stepLabel="STEP 1"
          title="University Application"
          subtitle="A practical checklist to choose the right university and submit a strong application."
        />

        <UserInfoBox
          title="Your Study Plan"
          fields={[
            { key: 'destinationCountry', label: 'Country' },
            { key: 'destinationCity', label: 'City' },
            { key: 'universityName', label: 'University' },
            { key: 'programName', label: 'Program' },
            { key: 'studyLevel', label: 'Degree Type' },
            { key: 'startDate', label: 'Start Date', formatter: (val) => val ? new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Not set' },
            { key: 'admissionStatus', label: 'Status' },
          ]}
        />

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50 whitespace-nowrap"
            >
              Back to Dashboard
            </Link>
            <div className="w-full relative">
              <StepChecklist pageType="university-application" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">On this page</p>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
            <a className="hover:text-blue-700" href="#clarify-goal">
              Clarify your goal
            </a>
            <a className="hover:text-blue-700" href="#choose-field">
              Choose your field and degree type
            </a>
            <a className="hover:text-blue-700" href="#degree-recognition">
              Degree recognition
            </a>
            <a className="hover:text-blue-700" href="#eligible-universities">
              Identify eligible universities
            </a>
            <a className="hover:text-blue-700" href="#accreditation-check">
              Accreditation check
            </a>
            <a className="hover:text-blue-700" href="#language-requirements">
              Language requirements
            </a>
            <a className="hover:text-blue-700" href="#admission-requirements">
              Admission requirements
            </a>
            <a className="hover:text-blue-700" href="#application-documents">
              Application documents
            </a>
            <a className="hover:text-blue-700" href="#application-timeline">
              Application timeline
            </a>
            <a className="hover:text-blue-700" href="#tuition-fees">
              Tuition and fees
            </a>
            <a className="hover:text-blue-700" href="#scholarships">
              Scholarships and funding
            </a>
            <a className="hover:text-blue-700" href="#cost-of-living">
              Cost of living
            </a>
            <a className="hover:text-blue-700" href="#visa-compatibility">
              Visa compatibility
            </a>
            <a className="hover:text-blue-700" href="#work-while-studying">
              Work while studying
            </a>
            <a className="hover:text-blue-700" href="#post-graduation">
              Post-graduation options
            </a>
            <a className="hover:text-blue-700" href="#housing-support">
              Housing support
            </a>
            <a className="hover:text-blue-700" href="#student-support">
              Student support services
            </a>
            <a className="hover:text-blue-700" href="#inclusivity-safety">
              Inclusivity and safety
            </a>
            <a className="hover:text-blue-700" href="#campus-life">
              Campus and city life
            </a>
            <a className="hover:text-blue-700" href="#reputation-beyond-rankings">
              Reputation beyond rankings
            </a>
            <a className="hover:text-blue-700" href="#golden-rules">
              Golden rules
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InfoSectionCard
            id="clarify-goal"
            title="Clarify your goal"
            items={[
              'Define why Europe, and why a specific country or city (for example, Milan for design, fashion, and business).',
              'Set your academic goal: specialization, research depth, or career switch.',
              'Map the long-term plan: job market, further study, or relocation goals.',
            ]}
          />

          <InfoSectionCard
            id="choose-field"
            title="Choose your field and degree type"
            items={[
              'Bachelor, Master, or PhD based on your current qualification.',
              'Academic vs applied focus depending on career direction.',
              'Taught vs research structure and supervision style.',
              'Full-time vs part-time and weekly workload expectations.',
              'Language of instruction and support for non-native speakers.',
              'Internship or thesis requirement and industry links.',
            ]}
          />

          <InfoSectionCard
            id="degree-recognition"
            title="Degree recognition"
            items={[
              'Confirm recognition in your home country or target industry bodies.',
              'Check Bologna Process alignment for easier mobility in Europe.',
            ]}
          >
            <Accordion title="Tools and references">
              <ul className="list-disc space-y-2 pl-4">
                <li>ENIC-NARIC networks</li>
                <li>National education ministry websites</li>
                <li>Professional body requirements</li>
              </ul>
            </Accordion>
          </InfoSectionCard>

          <InfoSectionCard
            id="eligible-universities"
            title="Identify eligible universities"
            items={[
              'Public vs private funding models and fees.',
              'Polytechnic vs classical universities by teaching style.',
              'Campus-based vs city-integrated environments.',
              'Large cohorts vs small classes and mentorship levels.',
              'Balance rankings with teaching quality and outcomes.',
              'Italy note: Milan has high program variety and strong industry links.',
            ]}
          />

          <InfoSectionCard
            id="accreditation-check"
            title="Accreditation check (mandatory)"
            items={[
              'Verify accreditation from the national authority.',
              'Avoid diploma mills and unrecognized providers.',
            ]}
          >
            <Accordion title="Tools to verify accreditation">
              <ul className="list-disc space-y-2 pl-4">
                <li>National ministry or accreditation agency sites</li>
                <li>World Higher Education Database (WHED)</li>
              </ul>
            </Accordion>
          </InfoSectionCard>

          <InfoSectionCard
            id="language-requirements"
            title="Language requirements"
            items={[
              'Confirm teaching language and any bilingual tracks.',
              'Check IELTS or TOEFL minimums and waiver options.',
              'Assess local language needs for daily life.',
              'Look for free or subsidized language courses.',
            ]}
          />

          <InfoSectionCard
            id="admission-requirements"
            title="Admission requirements"
            items={[
              'Minimum GPA or grade thresholds.',
              'Prior degree and prerequisite modules.',
              'Portfolio or audition where applicable.',
              'Entrance exams, common in some Italian programs.',
              'Interview or selection committee review.',
              'Age limits in specific countries or scholarships.',
            ]}
          />

          <InfoSectionCard
            id="application-documents"
            title="Application documents checklist"
            items={[
              'Passport, transcripts, and diploma certificates.',
              'Certified translations if required.',
              'CV (EU format may be preferred).',
              'Motivation letter and recommendations.',
              'Portfolio or work samples if requested.',
              'Language test results or proof of waiver.',
            ]}
          />

          <InfoSectionCard
            id="application-timeline"
            title="Application timeline"
            items={[
              'Track opening, priority, and final deadlines.',
              'Understand rolling admissions vs round-based intakes.',
              'Add a visa processing buffer to your schedule.',
            ]}
          />

          <InfoSectionCard
            id="tuition-fees"
            title="Tuition and fees"
            items={[
              'Annual tuition range by program and institution type.',
              'Registration, exam, and graduation fees.',
              'Non-EU tuition differences and surcharges.',
              'Installment schedules and payment deadlines.',
            ]}
          />

          <InfoSectionCard
            id="scholarships"
            title="Scholarships and funding"
            items={[
              'University, government, and regional scholarships (Italy-focused options).',
              'Merit-based vs income-based criteria.',
              'Fee waivers, stipends, and tuition reductions.',
              'Use official portals, university pages, and welfare agencies.',
            ]}
          />

          <InfoSectionCard
            id="cost-of-living"
            title="Cost of living"
            items={[
              'Estimate rent, utilities, transport, food, insurance, and materials.',
              'Milan note: higher rent but student transport discounts are common.',
            ]}
          />

          <InfoSectionCard
            id="visa-compatibility"
            title="Visa compatibility"
            items={[
              'Confirm the university issues visa support documents.',
              'Check program length and visa alignment.',
              'Verify attendance rules and reporting requirements.',
              'Confirm work-hour limits on your student visa.',
            ]}
          />

          <InfoSectionCard
            id="work-while-studying"
            title="Work while studying"
            items={[
              'Legal work limits for student visas.',
              'On-campus roles and internships requirements.',
              'Local language requirements for part-time roles.',
              'Career services and placement support.',
            ]}
          />

          <InfoSectionCard
            id="post-graduation"
            title="Post-graduation options"
            items={[
              'Post-study work visas or job-seeking permits.',
              'Employer sponsorship requirements.',
              'Residency pathways and timelines.',
              'Alumni outcomes and placement rates.',
            ]}
          />

          <InfoSectionCard
            id="housing-support"
            title="Housing support"
            items={[
              'University dorms and waiting lists.',
              'Housing office support and verified listings.',
              'Private market guidance and contracts.',
              'Scam awareness and safe payment practices.',
            ]}
          />

          <InfoSectionCard
            id="student-support"
            title="Student support services"
            items={[
              'International office and visa renewal help.',
              'Mental health services and counseling.',
              'Disability support and accommodations.',
              'Tutoring, academic support, and legal guidance.',
            ]}
          />

          <InfoSectionCard
            id="inclusivity-safety"
            title="Inclusivity and safety"
            items={[
              'Anti-discrimination policies and reporting channels.',
              'LGBTQ+ friendliness and student communities.',
              'Accessibility on campus and in the city.',
              'International community and safety resources.',
            ]}
          />

          <InfoSectionCard
            id="campus-life"
            title="Campus and city life"
            items={[
              'Clubs, sports, and cultural societies.',
              'City integration and local community access.',
              'International and local student mix.',
            ]}
          />

          <InfoSectionCard
            id="reputation-beyond-rankings"
            title="Reputation beyond rankings"
            items={[
              'Alumni network strength and mentoring.',
              'Employer reputation in your field.',
              'Industry links and internship pipelines.',
              'Local vs global recognition by region.',
            ]}
          />

          <div className="lg:col-span-2">
            <CalloutCard
              id="golden-rules"
              title="Golden rules"
              items={[
                'Never rely on one source for decision-making.',
                'Confirm details on official university websites.',
                'Contact international offices for clarity.',
                'Plan 12 months ahead for applications and visas.',
              ]}
            />
          </div>
        </div>
        </section>
      </DashboardLayout>
    </>
  )
}
