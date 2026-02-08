import { useNavigate } from 'react-router-dom'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase, checkboxBase, labelBase, selectBase } from '../ui'
import { getNextEnabledStepId, getStepConfig, isStepValid } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'

// Mock country list
const COUNTRIES = [
  'Italy',
  'Netherlands',
  'Germany',
  'France',
  'Spain',
  'United Kingdom',
  'Switzerland',
  'United States',
  'Canada',
  'Other',
]

// Mock country -> cities mapping
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Italy: ['Milan', 'Rome', 'Bologna', 'Turin'],
  Netherlands: ['Amsterdam', 'Rotterdam', 'Utrecht'],
  Germany: ['Berlin', 'Munich', 'Hamburg'],
  France: ['Paris', 'Lyon'],
  Spain: ['Madrid', 'Barcelona'],
  'United Kingdom': ['London', 'Manchester'],
  Switzerland: ['Zurich', 'Lausanne'],
  'United States': ['New York', 'Boston'],
  Canada: ['Toronto', 'Montreal'],
}

// Mock city -> universities mapping
const UNIVERSITIES_BY_CITY: Record<string, string[]> = {
  Milan: ['Bocconi University', 'Politecnico di Milano', 'Università degli Studi di Milano'],
  Rome: ['Sapienza University of Rome'],
  Bologna: ['University of Bologna'],
  Amsterdam: ['University of Amsterdam'],
  London: ['UCL', "King's College London"],
  Paris: ['Sorbonne University', 'PSL University'],
  Berlin: ['Humboldt University', 'TU Berlin'],
  Madrid: ['Complutense University of Madrid'],
  Barcelona: ['University of Barcelona'],
  Munich: ['Ludwig Maximilian University'],
  Turin: ['Politecnico di Torino'],
  Rotterdam: ['Erasmus University Rotterdam'],
  Utrecht: ['Utrecht University'],
  Hamburg: ['University of Hamburg'],
  Lyon: ['Claude Bernard Lyon 1'],
  Manchester: ['University of Manchester'],
  Zurich: ['ETH Zurich'],
  Lausanne: ['EPFL', 'University of Lausanne'],
  'New York': ['Columbia University', 'NYU'],
  Boston: ['Harvard University', 'MIT'],
  Toronto: ['University of Toronto'],
  Montreal: ['McGill University'],
}

export default function Step1Destination() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, updateField } = useOnboardingDraft()
  const step = getStepConfig(1)

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={1}
        title="Destination"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  const isValid = isStepValid(1, draft)
  const nextStepId = getNextEnabledStepId(1, draft)

  const handleNext = () => {
    if (!isValid) return
    setLastCompletedStep(1)
    navigate(`/onboarding/${nextStepId}`)
  }

  const handleCountryChange = (value: string) => {
    updateField('destinationCountry', value)
    // Clear city and university when country changes
    updateField('destinationCity', '')
    updateField('destinationUniversity', '')
  }

  const handleCityChange = (value: string) => {
    updateField('destinationCity', value)
    // Clear university when city changes
    updateField('destinationUniversity', '')
  }

  const handleUnknownCountry = (checked: boolean) => {
    updateField('destinationUnknownCountry', checked)
    if (checked) {
      updateField('destinationCountry', '')
      updateField('destinationUnknownCity', true)
      updateField('destinationCity', '')
      updateField('destinationUnknownUniversity', true)
      updateField('destinationUniversity', '')
    }
  }

  const handleUnknownCity = (checked: boolean) => {
    updateField('destinationUnknownCity', checked)
    if (checked) {
      updateField('destinationCity', '')
    }
  }

  const handleUnknownUniversity = (checked: boolean) => {
    updateField('destinationUnknownUniversity', checked)
    if (checked) {
      updateField('destinationUniversity', '')
    }
  }

  const availableCities = draft.destinationCountry ? CITIES_BY_COUNTRY[draft.destinationCountry] || [] : []
  const availableUniversities = draft.destinationCity ? UNIVERSITIES_BY_CITY[draft.destinationCity] || [] : []

  return (
    <OnboardingLayout
      stepId={1}
      title={step.title}
      subtitle={step.subtitle}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationCountry">
          Destination country
        </label>
        <select
          id="destinationCountry"
          value={draft.destinationCountry}
          onChange={(event) => handleCountryChange(event.target.value)}
          className={selectBase}
          disabled={draft.destinationUnknownCountry}
        >
          <option value="">Select a country…</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.destinationUnknownCountry}
            onChange={(event) => handleUnknownCountry(event.target.checked)}
          />
          I do not know the country yet
        </label>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationCity">
          Destination city
        </label>
        <select
          id="destinationCity"
          value={draft.destinationCity}
          onChange={(event) => handleCityChange(event.target.value)}
          className={selectBase}
          disabled={draft.destinationUnknownCountry || draft.destinationUnknownCity || !draft.destinationCountry}
        >
          <option value="">Select a city…</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {!draft.destinationCountry && !draft.destinationUnknownCountry && (
          <p className="mt-2 text-xs text-slate-400">Please select a country first.</p>
        )}
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.destinationUnknownCity}
            onChange={(event) => handleUnknownCity(event.target.checked)}
            disabled={draft.destinationUnknownCountry}
          />
          I do not know the city yet
        </label>
      </div>

      <div className={cardBase}>
        <label className={labelBase} htmlFor="destinationUniversity">
          Destination university
        </label>
        <select
          id="destinationUniversity"
          value={draft.destinationUniversity}
          onChange={(event) => updateField('destinationUniversity', event.target.value)}
          className={selectBase}
          disabled={draft.destinationUnknownCountry || draft.destinationUnknownUniversity || !draft.destinationCity}
        >
          <option value="">Select a university…</option>
          {availableUniversities.length > 0 ? (
            availableUniversities.map((uni) => (
              <option key={uni} value={uni}>
                {uni}
              </option>
            ))
          ) : (
            <option value="">I don&apos;t see my university</option>
          )}
        </select>
        {!draft.destinationCity && !draft.destinationUnknownCountry && draft.destinationCountry && (
          <p className="mt-2 text-xs text-slate-400">Please select a city first.</p>
        )}
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className={checkboxBase}
            checked={draft.destinationUnknownUniversity}
            onChange={(event) => handleUnknownUniversity(event.target.checked)}
            disabled={draft.destinationUnknownCountry}
          />
          I do not know the university yet
        </label>
      </div>
    </OnboardingLayout>
  )
}
