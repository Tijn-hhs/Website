import { useState, useMemo, useEffect, useRef } from 'react'
import { AlertTriangle, Calculator, Copy, Check, ExternalLink, Info, RotateCcw, Save } from 'lucide-react'
import { calculateCodiceFiscale, COUNTRY_CODES, ITALIAN_COMUNI } from '../lib/codiceFiscaleCalc'
import { fetchMe, saveProfile } from '../lib/api'

// ─── Types ─────────────────────────────────────────────────────────────────

interface FormState {
  lastName: string
  firstName: string
  dob: string        // "YYYY-MM-DD"
  gender: 'M' | 'F'
  bornInItaly: boolean
  countryCode: string   // Belfiore code for foreign country
  comuneCode: string    // Belfiore code for Italian comune
  manualCode: string    // fallback manual entry
  useManualCode: boolean
}

const EMPTY: FormState = {
  lastName: '',
  firstName: '',
  dob: '',
  gender: 'M',
  bornInItaly: false,
  countryCode: '',
  comuneCode: '',
  manualCode: '',
  useManualCode: false,
}

// ─── Helper ────────────────────────────────────────────────────────────────

function PartChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-lg font-bold tracking-widest text-slate-900">{value}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export default function CodiceFiscaleCalculator() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [copied, setCopied] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [comuneSearch, setComuneSearch] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-fill from saved profile on mount
  useEffect(() => {
    fetchMe().then((data) => {
      const p = data?.profile
      if (!p) return
      const newForm: Partial<FormState> = {}
      if (p.cfFirstName)      newForm.firstName      = p.cfFirstName
      if (p.cfLastName)       newForm.lastName       = p.cfLastName
      if (p.cfDateOfBirth)    newForm.dob            = p.cfDateOfBirth
      if (p.cfGender)         newForm.gender         = p.cfGender as 'M' | 'F'
      if (p.cfBirthplaceCode) newForm.useManualCode  = true
      if (p.cfBirthplaceCode) newForm.manualCode     = p.cfBirthplaceCode
      if (p.cfBornInItaly != null) newForm.bornInItaly = p.cfBornInItaly
      // Restore search label
      if (p.cfBirthplaceLabel) {
        if (p.cfBornInItaly) setComuneSearch(p.cfBirthplaceLabel)
        else setCountrySearch(p.cfBirthplaceLabel)
        // Restore the dropdown selection too
        const countryMatch = COUNTRY_CODES.find(c => c.code === p.cfBirthplaceCode)
        const comuneMatch  = ITALIAN_COMUNI.find(c => c.code === p.cfBirthplaceCode)
        if (countryMatch) { newForm.countryCode = countryMatch.code; newForm.useManualCode = false }
        if (comuneMatch)  { newForm.comuneCode  = comuneMatch.code;  newForm.useManualCode = false }
      }
      if (Object.keys(newForm).length > 0) setForm(f => ({ ...f, ...newForm }))
    }).catch(() => {/* not logged in, ignore */})
  }, [])

  // Auto-save whenever result changes (debounced 1.5s)
  const autosave = (code: string, currentForm: FormState, currentBelfiore: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        const label = currentForm.useManualCode
          ? currentBelfiore
          : currentForm.bornInItaly
            ? (ITALIAN_COMUNI.find(c => c.code === currentBelfiore)?.label ?? currentBelfiore)
            : (COUNTRY_CODES.find(c => c.code === currentBelfiore)?.label ?? currentBelfiore)
        await saveProfile({
          cfFirstName:             currentForm.firstName,
          cfLastName:              currentForm.lastName,
          cfDateOfBirth:           currentForm.dob,
          cfGender:                currentForm.gender,
          cfBirthplaceCode:        currentBelfiore,
          cfBirthplaceLabel:       label,
          cfBornInItaly:           currentForm.bornInItaly,
          calculatedCodiceFiscale: code,
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 4000)
      }
    }, 1500)
  }

  // Derived: chosen belfiore code
  const belfioreCode = form.useManualCode
    ? form.manualCode.toUpperCase().trim()
    : form.bornInItaly
      ? form.comuneCode
      : form.countryCode

  // Validation
  const errors: string[] = []
  if (form.lastName.trim().length < 2)   errors.push('Last name must be at least 2 characters')
  if (form.firstName.trim().length < 2)  errors.push('First name must be at least 2 characters')
  if (!form.dob)                         errors.push('Date of birth is required')
  if (belfioreCode.length !== 4)         errors.push('Place of birth code must be exactly 4 characters')

  const isReady = errors.length === 0

  // Calculate result
  const result = useMemo(() => {
    if (!isReady) return null
    try {
      return calculateCodiceFiscale({
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: new Date(form.dob),
        isFemale: form.gender === 'F',
        belfioreCode,
      })
    } catch {
      return null
    }
  }, [form.firstName, form.lastName, form.dob, form.gender, belfioreCode, isReady])

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-save whenever a valid result appears
  useEffect(() => {
    if (result) autosave(result.code, form, belfioreCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.code])

  const handleReset = () => {
    setForm(EMPTY)
    setCountrySearch('')
    setComuneSearch('')
  }

  // Filtered lists
  const filteredCountries = COUNTRY_CODES.filter((c) =>
    c.label.toLowerCase().includes(countrySearch.toLowerCase())
  )
  const filteredComuni = ITALIAN_COMUNI.filter((c) =>
    c.label.toLowerCase().includes(comuneSearch.toLowerCase())
  )

  return (
    <div className="space-y-5">

      {/* ── BIG WARNING ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-800">
              This is an unofficial estimate. NOT a legal document
            </p>
            <p className="mt-1 text-sm text-red-700">
              The codice fiscale generated here uses the official Agenzia delle Entrate algorithm and
              is almost always identical to the official one. However, <strong>you must still visit the Agenzia delle
              Entrate in person</strong> to receive the official certificate. The calculated code cannot be used for
              legally binding procedures (bank accounts, lease contracts, residence permit applications) until
              officially registered.
            </p>
            <a
              href="https://prenot.agenziaentrate.gov.it/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-700 underline hover:text-red-900"
            >
              Book your official appointment → <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* ── FORM ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={16} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800">Enter your details</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Last name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="e.g. Rossi"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* First name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="e.g. Mario"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
            <p className="mt-1 text-xs text-slate-400">Use your legal name exactly as on your passport</p>
          </div>

          {/* Date of birth */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Date of birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Gender (as per legal documents) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(['M', 'F'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, gender: g }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    form.gender === g
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {g === 'M' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Place of birth ── */}
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Place of birth
          </p>

          {/* Italy / abroad toggle */}
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, bornInItaly: false, useManualCode: false }))}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                !form.bornInItaly
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Born abroad
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, bornInItaly: true, useManualCode: false }))}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                form.bornInItaly
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Born in Italy
            </button>
          </div>

          {!form.useManualCode && !form.bornInItaly && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Country of birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value)
                  setForm((f) => ({ ...f, countryCode: '' }))
                }}
                placeholder="Search country…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
              {form.countryCode ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                  <Check size={12} />
                  {COUNTRY_CODES.find(c => c.code === form.countryCode)?.label}, code <code className="font-mono">{form.countryCode}</code>
                </p>
              ) : countrySearch.length > 0 ? (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-md">
                  {filteredCountries.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-400">No match. Use manual code entry below</p>
                  ) : (
                    filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, countryCode: c.code }))
                          setCountrySearch(c.label)
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-blue-50"
                      >
                        <span>{c.label}</span>
                        <span className="font-mono text-xs text-slate-400">{c.code}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          )}

          {!form.useManualCode && form.bornInItaly && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Comune of birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={comuneSearch}
                onChange={(e) => {
                  setComuneSearch(e.target.value)
                  setForm((f) => ({ ...f, comuneCode: '' }))
                }}
                placeholder="Search comune…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
              {form.comuneCode ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                  <Check size={12} />
                  {ITALIAN_COMUNI.find(c => c.code === form.comuneCode)?.label}, code <code className="font-mono">{form.comuneCode}</code>
                </p>
              ) : comuneSearch.length > 0 ? (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-md">
                  {filteredComuni.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-400">
                      Comune not in list. Look up the Belfiore code on{' '}
                      <a
                        href="https://www.codicefiscale.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        codicefiscale.com
                      </a>{' '}
                      and use manual entry below
                    </p>
                  ) : (
                    filteredComuni.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, comuneCode: c.code }))
                          setComuneSearch(c.label)
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-blue-50"
                      >
                        <span>{c.label}</span>
                        <span className="font-mono text-xs text-slate-400">{c.code}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
              <p className="mt-1 text-xs text-slate-400">
                Only major comuni listed. If yours isn't here, use manual entry below.
              </p>
            </div>
          )}

          {/* Manual code fallback */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, useManualCode: !f.useManualCode }))}
              className="text-xs text-blue-600 hover:underline"
            >
              {form.useManualCode ? 'Use the search instead' : 'Enter Belfiore code manually'}
            </button>
            {form.useManualCode && (
              <div className="mt-2">
                <input
                  type="text"
                  maxLength={4}
                  value={form.manualCode}
                  onChange={(e) => setForm((f) => ({ ...f, manualCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. F205"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                />

              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RESULT ────────────────────────────────────────────────────── */}
      {result ? (
        <div className="rounded-xl border-2 border-slate-300 bg-white p-5">
          {/* Code display */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Calculated codice fiscale
              </p>
              {saveStatus === 'saving' && (
                <span className="text-xs text-slate-400">Saving…</span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Save size={11} /> Saved to profile
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-red-500">Could not save. Are you logged in?</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-4 text-center">
            <p className="font-mono text-2xl font-bold tracking-[0.25em] text-slate-900">
              {result.code}
            </p>
          </div>

          {/* Breakdown */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Breakdown</p>
            <div className="flex flex-wrap items-end justify-center gap-4 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
              <PartChip label="Surname" value={result.parts.surname} />
              <span className="pb-4 text-slate-300">·</span>
              <PartChip label="Name" value={result.parts.name} />
              <span className="pb-4 text-slate-300">·</span>
              <PartChip label="Year" value={result.parts.year} />
              <PartChip label="Month" value={result.parts.month} />
              <PartChip label="Day/Sex" value={result.parts.day} />
              <span className="pb-4 text-slate-300">·</span>
              <PartChip label="Place" value={result.parts.placeCode} />
              <span className="pb-4 text-slate-300">·</span>
              <PartChip label="Check" value={result.parts.checkDigit} />
            </div>
          </div>

          {/* Secondary reminder */}
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Info size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Use this code carefully</p>
              <p>
                You can use this code to fill in preliminary forms and check if the code looks familiar.
                However, <strong>do not use this for any legally binding procedure</strong> (bank account opening,
                lease registration, residence permit) until you have received the official certificate from the
                Agenzia delle Entrate.
              </p>
              <p>
                The official certificate is <strong>free</strong> and issued on the same day. Don't skip the step.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
          <Calculator size={28} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-400">
            {isReady ? 'Calculating…' : 'Fill in all fields to calculate your code'}
          </p>
          {!isReady && errors.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {errors.map((e) => (
                <li key={e} className="text-xs text-slate-400">{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
