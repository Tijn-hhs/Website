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
    { id: 'choose-university', label: 'Choose university and program' },
    { id: 'check-requirements', label: 'Check admission requirements' },
    { id: 'prepare-documents', label: 'Prepare application documents' },
    { id: 'language-test', label: 'Complete language tests (if needed)' },
    { id: 'submit-application', label: 'Submit application' },
    { id: 'track-status', label: 'Track application status' },
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
    { id: 'arrange-accommodation', label: 'Arrange accommodation' },
    { id: 'book-flight', label: 'Book flight' },
    { id: 'arrange-insurance', label: 'Arrange travel insurance' },
    { id: 'notify-bank', label: 'Notify bank of travel' },
    { id: 'check-documents', label: 'Check all documents are ready' },
    { id: 'pack', label: 'Pack and prepare' },
  ],
  'immigration-registration': [
    { id: 'research-requirements', label: 'Research registration requirements' },
    { id: 'prepare-documents', label: 'Prepare registration documents' },
    { id: 'visit-office', label: 'Visit immigration office' },
    { id: 'submit-documents', label: 'Submit required documents' },
    { id: 'register-address', label: 'Register residential address' },
    { id: 'get-confirmation', label: 'Get registration confirmation' },
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
