/**
 * Configuration for required documents/checklist items for dashboard pages
 */

export type StepRequirement = {
  id: string
  label: string
  description?: string
}

export const stepRequirements: Record<string, StepRequirement[]> = {
  'university-application': [
    { id: 'choose-program', label: 'Choose your Bocconi program', description: 'BSc, MSc, or Law — and the specific track' },
    { id: 'check-round', label: 'Pick your application round', description: 'Earlier rounds = more places + higher scholarship priority' },
    { id: 'prepare-documents', label: 'Prepare application documents', description: 'Transcripts, passport, motivation letter, CV' },
    { id: 'submit-application', label: 'Submit online application', description: 'Via apply.unibocconi.it' },
    { id: 'complete-test', label: 'Complete the Bocconi online test', description: 'You receive the link by email after submitting' },
    { id: 'gmat-optional', label: 'Submit GMAT/GRE (optional, MSc only)', description: 'Strongly recommended if applying to MSc' },
    { id: 'await-result', label: 'Await admission result', description: 'Results sent by email within a few weeks of the round' },
    { id: 'enroll-language', label: 'Enroll & submit English proof', description: 'IELTS / TOEFL required at enrollment if admitted' },
  ],
  'student-visa': [
    { id: 'check-visa-requirements', label: 'Check visa requirements for your country' },
    { id: 'prepare-documents', label: 'Prepare visa documents' },
    { id: 'open-bank-account', label: 'Open bank account (if needed)' },
    { id: 'arrange-accommodation', label: 'Arrange accommodation proof' },
    { id: 'schedule-appointment', label: 'Schedule visa appointment' },
    { id: 'attend-appointment', label: 'Attend visa appointment' },
  ],
  'codice-fiscale': [
    { id: 'understand-cf', label: 'Understand what a codice fiscale is and why you need it' },
    { id: 'gather-documents', label: 'Gather required documents (passport, proof of address)' },
    { id: 'find-office', label: 'Find nearest Agenzia delle Entrate office' },
    { id: 'visit-office', label: 'Visit office to apply (or apply at consulate before arrival)' },
    { id: 'receive-cf', label: 'Receive your codice fiscale card' },
    { id: 'make-copies', label: 'Make several photocopies for future use' },
  ],
  'before-departure': [
    { id: 'book-flight', label: 'Book flight to Milan', description: 'Aim to arrive a few days before orientation week' },
    { id: 'check-passport', label: 'Check passport validity', description: 'Must be valid 6+ months after your program end date' },
    { id: 'arrange-visa', label: 'Arrange student visa (non-EU only)', description: 'Apply at Italian consulate up to 90 days before departure' },
    { id: 'get-ehic', label: 'Get European Health Insurance Card', description: 'EU/EEA students: free from your national health service' },
    { id: 'arrange-insurance', label: 'Arrange travel & health insurance', description: 'Non-EU: mandatory for visa; all students: strongly recommended' },
    { id: 'prepare-documents', label: 'Prepare and copy all documents', description: 'Passport, visa, acceptance letter, financial proof, housing confirmation' },
    { id: 'notify-bank', label: 'Notify bank of international travel', description: 'Prevent cards from being blocked when used in Italy' },
    { id: 'plan-airport-transfer', label: 'Plan airport transport to accommodation', description: 'Malpensa Express, bus, or taxi from MXP / LIN / BGY' },
  ],
  'immigration-registration': [
    { id: 'check-eu-status', label: 'Check if you need a permesso di soggiorno', description: 'Only non-EU citizens need a residence permit; EU citizens register at the municipality' },
    { id: 'get-kit-giallo', label: 'Get the application kit (kit giallo)', description: 'Available at your university International Office or enabled Poste Italiane offices' },
    { id: 'gather-documents', label: 'Gather all required documents', description: 'Passport, visa, enrollment letter, health insurance, financial proof, passport photos' },
    { id: 'buy-marca-da-bollo', label: 'Buy €16 marca da bollo (revenue stamp)', description: 'Available at any tobacco shop (tabacchi)' },
    { id: 'submit-post-office', label: 'Submit application at Post Office (within 8 working days)', description: 'Go to an enabled Poste Italiane office; pay €70.46 + €30 application fee' },
    { id: 'keep-receipt', label: 'Keep your receipt (Ricevuta mod. 22A)', description: 'This acts as proof of legal stay until your card is ready — carry it at all times' },
    { id: 'attend-questura', label: 'Attend police interview at Questura', description: 'Bring all originals and copies; you\'ll be fingerprinted' },
    { id: 'collect-card', label: 'Collect your permesso di soggiorno card', description: 'Go to the designated location when notified; bring passport + original receipt' },
  ],
  'housing': [
    { id: 'research-areas', label: 'Research neighborhoods' },
    { id: 'set-budget', label: 'Set accommodation budget' },
    { id: 'search-listings', label: 'Search accommodation listings' },
    { id: 'contact-landlord', label: 'Contact landlords' },
    { id: 'arrange-viewing', label: 'Arrange viewings' },
    { id: 'sign-lease', label: 'Sign lease agreement' },
  ],
  'banking': [
    { id: 'open-bank-account', label: 'Open bank account' },
    { id: 'get-tax-number', label: 'Get tax identification number' },
    { id: 'understand-banking-system', label: 'Understand local banking system' },
    { id: 'set-up-transfers', label: 'Set up international transfers' },
    { id: 'register-address', label: 'Register residential address' },
    { id: 'understand-rights', label: 'Understand consumer rights' },
  ],
  'insurance': [
    { id: 'health-insurance', label: 'Arrange health insurance' },
    { id: 'renter-insurance', label: 'Get renter\'s insurance' },
    { id: 'understand-coverage', label: 'Understand insurance coverage' },
    { id: 'compare-providers', label: 'Compare insurance providers' },
    { id: 'register-policy', label: 'Register insurance policy' },
    { id: 'emergency-contacts', label: 'Save emergency contacts' },
  ],
  'legal-banking-insurance': [
    { id: 'open-bank-account', label: 'Open bank account' },
    { id: 'get-tax-number', label: 'Get tax identification number' },
    { id: 'health-insurance', label: 'Arrange health insurance' },
    { id: 'renter-insurance', label: 'Get renter\'s insurance' },
    { id: 'understand-rights', label: 'Understand tenant rights' },
    { id: 'register-address', label: 'Register residential address' },
  ],
  'healthcare': [
    { id: 'register-gp', label: 'Register with general practitioner' },
    { id: 'find-dentist', label: 'Find dentist' },
    { id: 'health-insurance', label: 'Ensure health insurance coverage' },
    { id: 'understand-system', label: 'Understand healthcare system' },
    { id: 'get-pharmacy', label: 'Find local pharmacy' },
    { id: 'emergency-info', label: 'Know emergency procedures' },
  ],
  'information-centre': [
    { id: 'find-office', label: 'Locate information office' },
    { id: 'ask-questions', label: 'Ask about local services' },
    { id: 'get-resources', label: 'Collect helpful resources' },
    { id: 'join-groups', label: 'Join student groups/clubs' },
    { id: 'attend-events', label: 'Attend orientation events' },
    { id: 'network', label: 'Network with other students' },
  ],
  'cost-of-living': [
    { id: 'track-expenses', label: 'Track monthly expenses' },
    { id: 'set-budget', label: 'Set realistic monthly budget' },
    { id: 'find-deals', label: 'Find student discounts' },
    { id: 'compare-prices', label: 'Compare prices for services' },
    { id: 'plan-savings', label: 'Plan savings strategy' },
    { id: 'emergency-fund', label: 'Build emergency fund' },
  ],
}

export function getStepRequirements(pageType: string): StepRequirement[] {
  return stepRequirements[pageType] || []
}
