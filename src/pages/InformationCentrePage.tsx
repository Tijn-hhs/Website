import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import StepIntroModal from '../components/StepIntroModal'
import { useStepIntro } from '../hooks/useStepIntro'
import { ChevronDown } from 'lucide-react'

export default function InformationCentrePage() {
  const { showModal, handleConfirm, handleBack } = useStepIntro('information-centre')

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs: { question: string; answer: string }[] = [
    {
      question: 'What documents do I need when I arrive in Italy?',
      answer:
        'Bring your passport, university acceptance letter, proof of accommodation, proof of financial means, and health insurance documents. You will need these for your residence permit (permesso di soggiorno) application at the Questura.',
    },
    {
      question: 'What is a codice fiscale and how do I get one?',
      answer:
        'The codice fiscale is your Italian tax identification number — you need it for almost everything: opening a bank account, signing a lease, and accessing health services. You can get it at the Agenzia delle Entrate office with your passport. It takes about 15–30 minutes and is free.',
    },
    {
      question: 'How do I apply for a residence permit (permesso di soggiorno)?',
      answer:
        'Non-EU students must apply within 8 working days of arriving in Italy. Get the kit from a post office, fill it in, and submit it at a post office (Sportello Amico). Your receipt acts as a temporary permit. Book a Questura appointment for fingerprinting via sportelloimm.it.',
    },
    {
      question: 'Do I need to register my address in Milan?',
      answer:
        'Yes. If you plan to stay longer than three months, register at the Anagrafe (city registry office). It is not always legally required for students renting short-term, but it is needed for a full residency permit, Italian driving licence conversion, and some contracts.',
    },
    {
      question: 'How do I open a bank account in Italy?',
      answer:
        'You will need your passport, codice fiscale, and proof of address. Digital banks like N26, Revolut, and Wise are the easiest to open as an international student — no Italian address required. For a traditional Italian account, try Unicredit or Intesa Sanpaolo with your university enrollment certificate.',
    },
    {
      question: 'What health coverage do I have as a student?',
      answer:
        'EU students covered by EHIC can access the Italian National Health Service (SSN) for free. Non-EU students should register with SSN at their local ASL office (bring codice fiscale and residence permit). Alternatively, private student health insurance is accepted. The university may also have an on-campus health clinic.',
    },
    {
      question: 'How does public transport work in Milan?',
      answer:
        'Milan has an excellent metro, tram, and bus network run by ATM. A monthly pass costs around €39 (€22 with a student discount under 26). Download the ATM Milano app for journey planning and tickets. Bikes and e-scooters (BikeMi, Lime) are popular for short distances.',
    },
    {
      question: 'What student discounts are available in Milan?',
      answer:
        'With a valid student ID you get discounts on public transport (ATM pass), museums (many are free under 26), cinema tickets, gym memberships, and software (Microsoft 365, Adobe, Spotify). The ESN card gives additional discounts on travel and events across Europe.',
    },
    {
      question: 'Where can I find affordable food in Milan?',
      answer:
        'University canteens (mense) offer subsidised meals for enrolled students — typically €3–5 for a full meal. Other budget options include local markets (Mercato Metropolitano), supermarkets like Esselunga and Lidl, and neighbourhood trattorias with a fixed lunch menu (menù fisso).',
    },
    {
      question: 'What should I do if I have a mental health concern?',
      answer:
        'Bocconi offers free psychological counselling for enrolled students — ask at the Student Services desk or check the university portal. You can also call Telefono Amico (02 2327 2327) anonymously, or contact your local ASL for referrals to public mental health services (CPS).',
    },
    {
      question: 'How do I find housing in Milan?',
      answer:
        'Start with the university housing office, which maintains a list of vetted landlords. For private rentals, use Idealista, Immobiliare.it, or Uniplaces. Avoid paying deposits via bank transfer without a signed contract. Check our Housing page for a full guide on leases, scams, and neighbourhoods.',
    },
    {
      question: 'What is SPID and do I need it?',
      answer:
        'SPID (Sistema Pubblico di Identità Digitale) is Italy\'s digital identity system used to log in to government portals — including the Questura appointment system, tax office, and social security. Get it through PosteID (at a post office with your passport) or other authorised providers. It is highly recommended.',
    },
    {
      question: 'Is it safe to live and study in Milan?',
      answer:
        'Milan is generally a safe city. Take the usual urban precautions: watch for pickpockets on the metro and in tourist areas, avoid leaving bags unattended, and be aware of your surroundings at night. The emergency number is 112. Save your consulate number and the university security desk before you arrive.',
    },
    {
      question: 'How do I meet people and make friends?',
      answer:
        'Join ESN (Erasmus Student Network) for regular events and travel trips. Attend your faculty orientation and university club fairs. Language exchange events (Tandem, HelloTalk) are great for meeting Italians. The Bocconi student associations and sports clubs are also popular ways to build a social network quickly.',
    },
  ]

  return (
    <>
      {showModal && (
        <StepIntroModal
          stepTitle="Information Centre"
          stepDescription="Access comprehensive guides and local resources."
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepNumber={11}
        totalSteps={13}
        stepLabel="STEP 10"
        title="Information Centre"
        subtitle="Find key services, contacts, and student resources quickly."
        useGradientBar={true}
        showChecklist={false}
      >

        {/* FAQ */}
        <div className="col-span-full divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-sm font-medium text-slate-900">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>


      </StepPageLayout>
      </DashboardLayout>
    </>
  )
}
