import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getPrevEnabledStepId, getStepConfig, isStepValid, stepIdToRoute } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

// List of countries for nationality dropdown
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
]

export default function Step2Origin() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(2)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={2}
        title="Origin and citizenship"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const isValid = isStepValid(2, draft)
  const nextStepId = getNextEnabledStepId(2, draft)
  const prevStepId = getPrevEnabledStepId(2, draft)

  const handleNext = () => {
    if (!isValid) return
    setLastCompletedStep(2)
    const routePath = stepIdToRoute(nextStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const handleBack = () => {
    const routePath = stepIdToRoute(prevStepId)
    navigate(`/onboarding/${routePath}`)
  }

  return (
    <OnboardingLayout
      stepId={2}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <div className={cardBase}>
        <label className={labelBase} htmlFor="nationality">
          Nationality
        </label>
        <select
          id="nationality"
          value={draft.nationality}
          onChange={(event) => updateField('nationality', event.target.value)}
          className={selectBase}
        >
          <option value="">Select your nationality…</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="residenceCountry">
          Current country of residence
        </label>
        <select
          id="residenceCountry"
          value={draft.residenceCountry}
          onChange={(event) => updateField('residenceCountry', event.target.value)}
          className={selectBase}
        >
          <option value="">Select your country of residence…</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="isEuCitizen">
          EU citizenship
        </label>
        <select
          id="isEuCitizen"
          value={draft.isEuCitizen}
          onChange={(event) => updateField('isEuCitizen', event.target.value as 'yes' | 'no' | 'unknown')}
          className={selectBase}
        >
          <option value="unknown">Select your EU citizenship status…</option>
          <option value="yes">Yes, I am an EU citizen</option>
          <option value="no">No, I am not an EU citizen</option>
        </select>
      </div>
    </OnboardingLayout>
  )
}
