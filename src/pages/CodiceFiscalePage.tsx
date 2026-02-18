import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import InfoCard from '../components/InfoCard'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:codice-fiscale'

export default function CodiceFiscalePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('codice-fiscale')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})

  // Load checklist state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
      if (saved) {
        try {
          setChecklistState(JSON.parse(saved))
        } catch {
          setChecklistState({})
        }
      }
    }
  }, [])

  // Get checklist items from step requirements
  const requirements = getStepRequirements('codice-fiscale') || []
  const checklistItems = requirements.map((req) => ({
    ...req,
    completed: checklistState[req.id] || false,
  }))

  // Handle checklist item toggle
  const handleChecklistToggle = (id: string, completed: boolean) => {
    const newState = {
      ...checklistState,
      [id]: completed,
    }
    setChecklistState(newState)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(newState))
    }
  }

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Codice Fiscale"
          stepDescription="Obtain your Italian tax identification number (codice fiscale)."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={3}
          totalSteps={12}
          stepLabel="STEP 3"
          title="Codice Fiscale"
          subtitle="Get your Italian tax identification number - essential for daily life in Italy."
          useGradientBar={true}
          userInfoTitle="Your Information"
          userInfoFields={[
            { key: 'destinationCity', label: 'City' },
            { key: 'nationality', label: 'Nationality' },
            { key: 'hasCodiceFiscale', label: 'Has Codice Fiscale' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
        >
          <InfoCard title="What is a Codice Fiscale?">
            <p>
              The codice fiscale is your Italian tax identification number, similar to a social security number. 
              You'll need it for almost everything in Italy: opening a bank account, signing a lease, getting a phone contract, 
              accessing healthcare, and more.
            </p>
          </InfoCard>

          <InfoCard title="How to get it">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Option 1: Apply online (before arrival)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  You can request your codice fiscale from the Italian consulate in your home country before arriving in Italy.
                </p>
                <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                  <li>Check the Italian consulate website in your country</li>
                  <li>Prepare: passport, birth certificate, proof of address</li>
                  <li>Processing time: typically 2-4 weeks</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Option 2: Get it in Italy (recommended)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Visit the local Agenzia delle Entrate (tax office) after arriving in Milan.
                </p>
                <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                  <li>Find your nearest office on agenziaentrate.gov.it</li>
                  <li>Bring: passport, proof of address in Italy (housing contract or university letter)</li>
                  <li>Processing: usually issued immediately or within a few days</li>
                  <li>Cost: Free</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Option 3: Through your university</h3>
                <p className="text-sm text-gray-600">
                  Some universities offer assistance with obtaining your codice fiscale during orientation. 
                  Check with your international student office.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Required documents">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">📄</span>
                <span>Valid passport with visa (if required)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🏠</span>
                <span>Proof of address in Italy (rental contract, university letter, or temporary accommodation confirmation)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📋</span>
                <span>Completed application form (available at the office)</span>
              </li>
            </ul>
          </InfoCard>

          <InfoCard title="Important notes">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ The codice fiscale is free and takes about 15-30 minutes to obtain at the office</li>
              <li>✓ You'll receive a small plastic card with your code - keep it safe</li>
              <li>✓ Make several photocopies - many places will ask for it</li>
              <li>✓ Once assigned, your codice fiscale never changes</li>
              <li>✓ You can also calculate your code online, but the official document from the tax office is still required for most procedures</li>
            </ul>
          </InfoCard>

          <InfoCard title="Agenzia delle Entrate offices in Milan">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-gray-900">Main office (City Center)</h4>
                <p className="text-gray-600">Via Carlo Freguglia, 1 - Metro: Turati (M3)</p>
                <p className="text-gray-600">Hours: Mon-Fri 8:30-12:30</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Zona Sempione</h4>
                <p className="text-gray-600">Via Giuseppe Meda, 2 - Metro: De Angeli (M1)</p>
                <p className="text-gray-600">Hours: Mon-Fri 8:30-12:30</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Arrive early (before opening) to avoid long queues, especially at the start of the academic year.
              </p>
            </div>
          </InfoCard>
        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
