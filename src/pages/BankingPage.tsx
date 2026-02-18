import { useState, useEffect } from 'react'
import Accordion from '../components/Accordion'
import CalloutCard from '../components/CalloutCard'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import InfoSectionCard from '../components/InfoSectionCard'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { getStepRequirements } from '../onboarding/stepRequirements'

const CHECKLIST_STORAGE_KEY = 'dashboard-checklist:banking'

export default function BankingPage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('banking')
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
  const requirements = getStepRequirements('banking') || []
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
          stepTitle="Banking"
          stepDescription="Set up bank accounts and manage financial essentials."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
        <StepPageLayout
          stepNumber={8}
          totalSteps={13}
          stepLabel="STEP 8"
          title="Banking"
          subtitle="Set up bank accounts and manage financial essentials."
          useGradientBar={true}
          userInfoTitle="Your Banking Status"
          userInfoFields={[
            { key: 'destinationCountry', label: 'Country' },
            { key: 'destinationCity', label: 'City' },
            { key: 'bankAccountNeeded', label: 'Bank Account Needed' },
          ]}
          checklistItems={checklistItems}
          onChecklistItemToggle={handleChecklistToggle}
        >

          <div className="col-span-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">On this page</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
              <a className="hover:text-blue-700" href="#banking-options-overview">
                Banking options overview
              </a>
              <a className="hover:text-blue-700" href="#digital-banking-students">
                Digital banking for students
              </a>
              <a className="hover:text-blue-700" href="#required-documents">
                Required documents
              </a>
              <a className="hover:text-blue-700" href="#opening-account">
                Opening an account
              </a>
              <a className="hover:text-blue-700" href="#international-transfers">
                International transfers
              </a>
              <a className="hover:text-blue-700" href="#managing-finances">
                Managing your finances
              </a>
              <a className="hover:text-blue-700" href="#tax-identification">
                Tax identification
              </a>
              <a className="hover:text-blue-700" href="#budgeting-tips">
                Budgeting tips
              </a>
            </div>
          </div>

            <InfoSectionCard
              id="banking-options-overview"
              title="Banking options overview"
              items={[
                'Traditional banks vs digital banks: Choose based on your needs and convenience.',
                'Student-friendly features to look for: Low fees, no minimum balance, mobile banking.',
                'Free accounts and low fees for students: Many banks offer special student accounts.',
                'Multi-currency support for international students: Essential for managing money from home.',
                'English language support availability: Easier onboarding and customer service.',
              ]}
            >
              <Accordion title="Tools and references">
                <ul className="list-disc space-y-2 pl-4">
                  <li>Compare bank fees on trusted financial websites</li>
                  <li>Check student account offerings on local bank websites</li>
                  <li>Read reviews on international student forums</li>
                </ul>
              </Accordion>
            </InfoSectionCard>

            <InfoSectionCard
              id="digital-banking-students"
              title="Digital banking for students"
              description="Modern digital banks offer the best experience for international students with instant setup, no fees, and excellent currency exchange rates."
              items={[
                'Revolut: Multi-currency account, instant setup, great exchange rates, virtual and physical cards',
                'Wise (formerly TransferWise): Best for international transfers, holds 40+ currencies, low fees',
                'N26: European digital bank, free standard account, easy mobile banking',
                'All accounts can be opened before arriving in your destination country',
                'Mobile-first experience with excellent apps',
                'No minimum balance requirements',
              ]}
            >
              <Accordion title="Tools and references">
                <div className="space-y-2">
                  <a
                    href="https://www.revolut.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50"
                  >
                    Open Revolut Account
                  </a>
                  <a
                    href="https://wise.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50"
                  >
                    Open Wise Account
                  </a>
                  <a
                    href="https://n26.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50"
                  >
                    Open N26 Account
                  </a>
                  <p className="text-xs text-slate-500 pt-2">These are affiliate links. We recommend comparing options before choosing.</p>
                </div>
              </Accordion>
            </InfoSectionCard>

            <InfoSectionCard
              id="required-documents"
              title="Required documents"
              items={[
                'Valid passport',
                'Student visa or residence permit',
                'University enrollment letter',
                'Proof of address (rental contract, utility bill)',
                'Tax identification number (varies by country)',
                'For Italy specifically: Codice Fiscale is mandatory',
              ]}
            >
              <Accordion title="Tools and references">
                <ul className="list-disc space-y-2 pl-4">
                  <li>Check your destination country's bank requirements online</li>
                  <li>Contact your university's international office for document guidance</li>
                  <li>Digital document verification is increasingly accepted</li>
                </ul>
              </Accordion>
            </InfoSectionCard>

            <InfoSectionCard
              id="opening-account"
              title="Opening an account"
              items={[
                'Compare options and choose your bank',
                'Gather required documents',
                'Apply online (often possible before arrival)',
                'Complete identity verification',
                'Receive your card (virtual card available immediately)',
                'Activate your account',
                'Set up mobile banking',
              ]}
            >
              <Accordion title="Tools and references">
                <ul className="list-disc space-y-2 pl-4">
                  <li>Most digital banks have step-by-step onboarding apps</li>
                  <li>Video verification is standard for remote onboarding</li>
                  <li>Keep digital copies of all submitted documents</li>
                </ul>
              </Accordion>
            </InfoSectionCard>

            <InfoSectionCard
              id="international-transfers"
              title="International transfers"
              items={[
                'Avoid traditional bank transfers (high fees, poor exchange rates)',
                'Use services like Wise or Revolut for better rates',
                'Understand exchange rates and fees before transferring',
                'Set up regular transfers if receiving money from home',
                'Real exchange rate vs "zero fee" marketing: Compare actual costs',
              ]}
            >
              <Accordion title="Tools and references">
                <ul className="list-disc space-y-2 pl-4">
                  <li>Wise: Compare fees for your specific corridor</li>
                  <li>Revolut: Check multi-currency conversion rates</li>
                  <li>Traditional banks: Get quotes for comparison</li>
                  <li>OANDA or XE.com: Check mid-market exchange rates</li>
                </ul>
              </Accordion>
            </InfoSectionCard>

            <InfoSectionCard
              id="managing-finances"
              title="Managing your finances"
              items={[
                'Set up budget tracking in your banking app',
                'Use spending categories and insights',
                'Set up savings goals',
                'Understand local payment methods (contactless, QR codes)',
                'Mobile payments: Apple Pay, Google Pay',
                'Keep emergency funds accessible',
              ]}
            >
              <Accordion title="Tools and references">
                <ul className="list-disc space-y-2 pl-4">
                  <li>Banking app built-in budgeting tools</li>
                  <li>Spending analytics dashboards</li>
                  <li>Savings goal trackers</li>
                  <li>Payment infrastructure varies by country (e.g., Germany uses SEPA)</li>
                </ul>
              </Accordion>
            </InfoSectionCard>

            <InfoSectionCard
              id="tax-identification"
              title="Tax identification"
              items={[
                'Each country has different tax ID requirements',
                'Italy: Codice Fiscale - obtain from Agenzia delle Entrate',
                'Germany: Steuer-ID',
                'Spain: NIE number',
                'Required for opening bank accounts',
                'Usually free to obtain',
                'Can often be requested online or at local tax office',
              ]}
            >
              <Accordion title="Tools and references">
                <ul className="list-disc space-y-2 pl-4">
                  <li>Italy - Agenzia delle Entrate (www.agenziaentrate.gov.it)</li>
                  <li>Germany - Bundeszentralamt für Steuern</li>
                  <li>Spain - Policía Nacional or consulate</li>
                  <li>Check with your university's tax office</li>
                </ul>
              </Accordion>
            </InfoSectionCard>

            <InfoSectionCard
              id="budgeting-tips"
              title="Budgeting tips"
              items={[
                'Track your spending for the first month to establish baseline',
                'Average student monthly expenses by category: Rent, food, transport, entertainment',
                'Use 50/30/20 rule: 50% needs, 30% wants, 20% savings',
                'Student discounts on banking fees: Many banks offer free accounts',
                'Avoid ATM fees by using your bank\'s network',
                'Emergency fund: Aim for 1-2 months of expenses',
              ]}
            >
              <Accordion title="Tools and references">
                <ul className="list-disc space-y-2 pl-4">
                  <li>Student discount programs offered by banks</li>
                  <li>Mobile apps for expense tracking</li>
                  <li>ATM locators through banking apps</li>
                  <li>Cost of living calculators on student platforms</li>
                </ul>
              </Accordion>
            </InfoSectionCard>

            <div className="col-span-full lg:col-span-2">
              <CalloutCard
                id="banking-tips"
                title="Quick tips for success"
                items={[
                  'Open an account before you arrive - many banks accept remote applications',
                  'Have a backup payment method (credit card) for emergencies',
                  'Keep your banking apps secure with strong passwords and 2FA',
                  'Report lost or stolen cards immediately to your bank',
                  'Understand your bank\'s fees structure - know what costs what',
                  'Connect with other students about their banking experiences',
                ]}
              />
            </div>
        </StepPageLayout>
      </DashboardLayout>
    </>
  )
}