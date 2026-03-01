import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import OnboardingLayout from '../OnboardingLayout'
import { cardBase } from '../ui'
import { getPrevEnabledStepId, getStepConfig, stepIdToRoute } from '../steps'
import { useOnboardingDraft } from '../useOnboardingDraft'
import { fetchMe, saveProfile, sendWelcomeEmail, fetchContentModules } from '../../lib/api'
import type { DashboardPlanItem } from '../../lib/api'
import { UserProfile } from '../../types/user'
import { isSignedIn } from '../../lib/auth'
import { clearOnboardingDraft } from '../sync'
import { isOnboardingCompleted } from '../isOnboardingCompleted'

const formatValue = (value: string | boolean | undefined) => {
  if (value === undefined || value === '') return 'Not specified'
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return value
}

export default function Step8ReviewFinish() {
  const navigate = useNavigate()
  const { draft, isLoading, setLastCompletedStep, clearLocalDraft } = useOnboardingDraft()
  const step = getStepConfig(8)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [userSignedIn, setUserSignedIn] = useState(false)
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false)
  const hasCheckedAuthRef = useRef(false)

  // Inline auth state
  type AuthScreen = 'signup' | 'signin' | 'confirm'
  const [authScreen, setAuthScreen] = useState<AuthScreen>('signup')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authConfirmPassword, setAuthConfirmPassword] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const prevStepId = useMemo(() => getPrevEnabledStepId(8, draft), [draft])

  // Check auth status on mount
  useEffect(() => {
    if (!hasCheckedAuthRef.current) {
      hasCheckedAuthRef.current = true
      ;(async () => {
        try {
          const signedIn = await isSignedIn()
          setUserSignedIn(signedIn)

          if (signedIn) {
            const me = await fetchMe()
            const completed = isOnboardingCompleted(me.profile)
            if (completed) {
              setIsAlreadyCompleted(true)
              navigate('/dashboard', { replace: true })
            }
          }
        } catch {
          setUserSignedIn(false)
        }
      })()
    }
  }, [navigate])

  function authFriendlyError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('UserNotFoundException') || msg.includes('Incorrect username or password'))
      return 'Incorrect email or password.'
    if (msg.includes('UserNotConfirmedException'))
      return 'Please confirm your account first. Check your email for a verification code.'
    if (msg.includes('UsernameExistsException'))
      return 'An account with this email already exists.'
    if (msg.includes('InvalidPasswordException'))
      return 'Password must be at least 8 characters and include a number.'
    if (msg.includes('CodeMismatchException'))
      return 'Incorrect code. Please try again.'
    if (msg.includes('ExpiredCodeException'))
      return 'Code has expired. Please request a new one.'
    if (msg.includes('LimitExceededException'))
      return 'Too many attempts. Please wait a moment and try again.'
    if (msg.includes('NotAuthorizedException'))
      return 'Incorrect email or password.'
    return msg
  }

  async function handleInlineSignUp(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    if (authPassword !== authConfirmPassword) { setAuthError('Passwords do not match.'); return }
    setAuthLoading(true)
    try {
      await signUp({ username: authEmail.trim().toLowerCase(), password: authPassword })
      setAuthScreen('confirm')
    } catch (err) {
      setAuthError(authFriendlyError(err))
    } finally { setAuthLoading(false) }
  }

  async function handleInlineConfirm(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      await confirmSignUp({ username: authEmail.trim().toLowerCase(), confirmationCode: authCode.trim() })
      await signIn({ username: authEmail.trim().toLowerCase(), password: authPassword })
      setUserSignedIn(true)
      // Auto-continue: save profile and navigate to building screen
      await handleFinish()
    } catch (err) {
      setAuthError(authFriendlyError(err))
      setAuthLoading(false)
    }
  }

  async function handleInlineSignIn(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      await signIn({ username: authEmail.trim().toLowerCase(), password: authPassword })
      setUserSignedIn(true)
      await handleFinish()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('UserNotConfirmedException')) {
        await resendSignUpCode({ username: authEmail.trim().toLowerCase() }).catch(() => {})
        setAuthScreen('confirm')
      }
      setAuthError(authFriendlyError(err))
      setAuthLoading(false)
    }
  }

  async function handleResendCode() {
    setAuthError('')
    setAuthLoading(true)
    try {
      await resendSignUpCode({ username: authEmail.trim().toLowerCase() })
    } catch (err) { setAuthError(authFriendlyError(err)) }
    finally { setAuthLoading(false) }
  }

  const handleBack = () => {
    const routePath = stepIdToRoute(prevStepId)
    navigate(`/onboarding/${routePath}`)
  }

  const handleFinish = async () => {
    setIsSaving(true)
    setSaveError(null)
    setLastCompletedStep(8)

    try {
      // Log draft state first
      console.log('[Onboarding] handleFinish - Draft state:', {
        destinationCountry: draft.destinationCountry,
        destinationCity: draft.destinationCity,
        destinationUniversity: draft.destinationUniversity,
        nationality: draft.nationality,
        degreeType: draft.degreeType,
        fieldOfStudy: draft.fieldOfStudy,
        fieldOfStudyUnknown: draft.fieldOfStudyUnknown,
        programStartMonth: draft.programStartMonth,
        programStartMonthUnknown: draft.programStartMonthUnknown,
        programApplied: draft.programApplied,
        programAccepted: draft.programAccepted,
        hasVisa: draft.hasVisa,
        hasCodiceFiscale: draft.hasCodiceFiscale,
        hasResidencePermit: draft.hasResidencePermit,
        hasHousing: draft.hasHousing,
        hasTravelInsurance: draft.hasTravelInsurance,
        hasHealthInsurance: draft.hasHealthInsurance,
      })

      // Fetch current profile (for userId and other required fields)
      console.log('[Onboarding] Fetching current profile...')
      const data = await fetchMe()
      const profile = data.profile || {}

      if (isOnboardingCompleted(profile)) {
        navigate('/dashboard', { replace: true })
        return
      }
      
      console.log('[Onboarding] Current backend profile keys:', Object.keys(profile).length)

      // Build the update with ONLY the fields we want to send
      // Don't spread the entire profile - only send onboarding data
      // NOTE: Do NOT send userId or updatedAt - backend handles these
      const profileToSave: Partial<UserProfile> = {}

      // Explicitly set each field from draft - ONLY if it has a value
      if (draft.destinationCountry && !draft.destinationUnknownCountry) {
        profileToSave.destinationCountry = draft.destinationCountry
      }
      if (draft.destinationCity && !draft.destinationUnknownCity) {
        profileToSave.destinationCity = draft.destinationCity
      }
      if (draft.destinationUniversity && !draft.destinationUnknownUniversity) {
        profileToSave.destinationUniversity = draft.destinationUniversity
      }
      if (draft.nationality) {
        profileToSave.nationality = draft.nationality
      }
      if (draft.residenceCountry) {
        profileToSave.residenceCountry = draft.residenceCountry
      }
      if (draft.isEuCitizen) {
        profileToSave.isEuCitizen = draft.isEuCitizen
      }
      if (draft.degreeType) {
        profileToSave.degreeType = draft.degreeType
      }
      if (draft.fieldOfStudy && !draft.fieldOfStudyUnknown) {
        profileToSave.fieldOfStudy = draft.fieldOfStudy
      }
      if (draft.programStartMonth && !draft.programStartMonthUnknown) {
        profileToSave.programStartMonth = draft.programStartMonth
      }
      if (draft.programApplied) {
        profileToSave.programApplied = draft.programApplied
      }
      if (draft.programAccepted) {
        profileToSave.programAccepted = draft.programAccepted
      }
      if (draft.hasGmatOrEntranceTest) {
        profileToSave.hasGmatOrEntranceTest = draft.hasGmatOrEntranceTest
      }
      if (draft.gmatScore) {
        profileToSave.gmatScore = draft.gmatScore
      }
      if (draft.hasEnglishTest) {
        profileToSave.hasEnglishTest = draft.hasEnglishTest
      }
      if (draft.englishTestType) {
        profileToSave.englishTestType = draft.englishTestType
      }
      if (draft.englishTestScore) {
        profileToSave.englishTestScore = draft.englishTestScore
      }
      if (draft.hasRecommendationLetters) {
        profileToSave.hasRecommendationLetters = draft.hasRecommendationLetters
      }
      if (draft.hasCv) {
        profileToSave.hasCv = draft.hasCv
      }
      if (draft.hasVisa) {
        profileToSave.hasVisa = draft.hasVisa
      }
      if (draft.hasCodiceFiscale) {
        profileToSave.hasCodiceFiscale = draft.hasCodiceFiscale
      }
      if (draft.hasResidencePermit) {
        profileToSave.hasResidencePermit = draft.hasResidencePermit
      }
      if (draft.hasHousing) {
        profileToSave.hasHousing = draft.hasHousing
      }
      if (draft.needsBankAccount) {
        profileToSave.needsBankAccount = draft.needsBankAccount
      }
      if (draft.hasBankAccount) {
        profileToSave.hasBankAccount = draft.hasBankAccount
      }
      if (draft.needsPhoneNumber) {
        profileToSave.needsPhoneNumber = draft.needsPhoneNumber
      }
      if (draft.hasPhoneNumber) {
        profileToSave.hasPhoneNumber = draft.hasPhoneNumber
      }
      if (draft.hasTravelInsurance) {
        profileToSave.hasTravelInsurance = draft.hasTravelInsurance
      }
      if (draft.hasHealthInsurance) {
        profileToSave.hasHealthInsurance = draft.hasHealthInsurance
      }

      const cleanedProfile = profileToSave as UserProfile

      const modules = await fetchContentModules(cleanedProfile)
      const plan: DashboardPlanItem[] = modules.map(m => ({
        moduleId: m.moduleId,
        label: m.label,
        icon: m.icon,
        description: m.description,
        stepNumber: m.stepNumber,
        route: m.route,
        stepType: m.stepType,
      }))

      cleanedProfile.dashboardPlan = JSON.stringify(plan)
      cleanedProfile.onboardingCompletedAt = new Date().toISOString()
      cleanedProfile.lastCompletedStep = 8

      console.log('[Onboarding] Profile to save:', {
        destinationCountry: cleanedProfile.destinationCountry,
        destinationCity: cleanedProfile.destinationCity,
        destinationUniversity: cleanedProfile.destinationUniversity,
        nationality: cleanedProfile.nationality,
        residenceCountry: cleanedProfile.residenceCountry,
        isEuCitizen: cleanedProfile.isEuCitizen,
        degreeType: cleanedProfile.degreeType,
        fieldOfStudy: cleanedProfile.fieldOfStudy,
        programStartMonth: cleanedProfile.programStartMonth,
        programApplied: cleanedProfile.programApplied,
        programAccepted: cleanedProfile.programAccepted,
        hasVisa: cleanedProfile.hasVisa,
        hasCodiceFiscale: cleanedProfile.hasCodiceFiscale,
        hasResidencePermit: cleanedProfile.hasResidencePermit,
        hasHousing: cleanedProfile.hasHousing,
        needsBankAccount: cleanedProfile.needsBankAccount,
        hasBankAccount: cleanedProfile.hasBankAccount,
        needsPhoneNumber: cleanedProfile.needsPhoneNumber,
        hasPhoneNumber: cleanedProfile.hasPhoneNumber,
        hasTravelInsurance: cleanedProfile.hasTravelInsurance,
        hasHealthInsurance: cleanedProfile.hasHealthInsurance,
        allKeys: Object.keys(cleanedProfile),
      })

       // Save to backend
       console.log('[Onboarding] Calling saveProfile...')
       console.log('[Onboarding] Final payload to send:', {
         keys: Object.keys(cleanedProfile),
         values: cleanedProfile,
       })
       await saveProfile(cleanedProfile as UserProfile)
      
      console.log('[Onboarding] saveProfile succeeded')
      
      // Verify the save by re-fetching
      console.log('[Onboarding] Verifying save by re-fetching profile...')
      const verifyData = await fetchMe()
      const verifiedProfile = verifyData.profile || {}
      
      console.log('[Onboarding] Verification - saved data retrieved:', {
        destinationCountry: verifiedProfile.destinationCountry,
        destinationCity: verifiedProfile.destinationCity,
        destinationUniversity: verifiedProfile.destinationUniversity,
        nationality: verifiedProfile.nationality,
        degreeType: verifiedProfile.degreeType,
        fieldOfStudy: verifiedProfile.fieldOfStudy,
        programStartMonth: verifiedProfile.programStartMonth,
        programApplied: verifiedProfile.programApplied,
        programAccepted: verifiedProfile.programAccepted,
        hasVisa: verifiedProfile.hasVisa,
        hasCodiceFiscale: verifiedProfile.hasCodiceFiscale,
        hasResidencePermit: verifiedProfile.hasResidencePermit,
        hasHousing: verifiedProfile.hasHousing,
        needsBankAccount: verifiedProfile.needsBankAccount,
        hasBankAccount: verifiedProfile.hasBankAccount,
        needsPhoneNumber: verifiedProfile.needsPhoneNumber,
        hasPhoneNumber: verifiedProfile.hasPhoneNumber,
        hasTravelInsurance: verifiedProfile.hasTravelInsurance,
        hasHealthInsurance: verifiedProfile.hasHealthInsurance,
      })

      clearLocalDraft()
      clearOnboardingDraft()

      // Send welcome email — fire and forget, do not block navigation
      sendWelcomeEmail({
        preferredName: draft.preferredName,
        destinationUniversity: draft.destinationUniversity,
        destinationCity: draft.destinationCity,
        destinationCountry: draft.destinationCountry,
        nationality: draft.nationality,
        isEuCitizen: draft.isEuCitizen,
        degreeType: draft.degreeType,
        fieldOfStudy: draft.fieldOfStudy,
        programStartMonth: draft.programStartMonth,
      }).catch(err => console.warn('[Onboarding] Welcome email failed (non-blocking):', err))

      console.log('[Onboarding] Navigating to building screen...')
      navigate('/onboarding/building', { replace: true })
    } catch (error) {
      console.error('[Onboarding] Error during finish:', error)
      console.error('[Onboarding] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setSaveError(`Could not save your profile: ${errorMsg}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (!step || isLoading) {
    return (
      <OnboardingLayout
        stepId={8}
        title="Review and finish"
        subtitle="Loading your draft..."
      >
        <div className={cardBase}>
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      stepId={8}
      title={step.title}
      subtitle={step.subtitle}
      onBack={handleBack}
      onNext={userSignedIn ? handleFinish : undefined}
      nextLabel={isSaving ? 'Saving...' : 'Finish onboarding'}
      nextDisabled={isSaving || !userSignedIn || isAlreadyCompleted}
    >
      {!userSignedIn && (
        <div className={cardBase}>
          <h2 className="text-base font-semibold text-slate-900 mb-1">Almost there: create your account</h2>
          <p className="text-sm text-slate-500 mb-5">
            Create a free account to save your dashboard and continue where you left off.
          </p>

          {/* Tab row */}
          {(authScreen === 'signup' || authScreen === 'signin') && (
            <div className="flex border-b border-[#EDE9D8] mb-5">
              {(['signup', 'signin'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setAuthScreen(s); setAuthError('') }}
                  className={`flex-1 pb-2.5 text-sm font-semibold transition-colors ${
                    authScreen === s
                      ? 'text-slate-900 border-b-2 border-[#8870FF] -mb-px'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {s === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              ))}
            </div>
          )}

          {/* Sign up */}
          {authScreen === 'signup' && (
            <form onSubmit={handleInlineSignUp} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email" required value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EDE9D8] bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8870FF] focus:ring-2 focus:ring-[#8870FF]/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="At least 8 characters" autoComplete="new-password"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EDE9D8] bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8870FF] focus:ring-2 focus:ring-[#8870FF]/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Confirm password</label>
                <input
                  type="password" required value={authConfirmPassword}
                  onChange={e => setAuthConfirmPassword(e.target.value)}
                  placeholder="Repeat your password" autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EDE9D8] bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8870FF] focus:ring-2 focus:ring-[#8870FF]/20 transition-all"
                />
              </div>
              {authError && <p className="text-sm text-red-500">{authError}</p>}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 bg-[#8870FF] hover:bg-[#6a54e0] disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {authLoading && <Loader2 size={15} className="animate-spin" />}
                Create account & finish
              </button>
            </form>
          )}

          {/* Sign in */}
          {authScreen === 'signin' && (
            <form onSubmit={handleInlineSignIn} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email" required value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EDE9D8] bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8870FF] focus:ring-2 focus:ring-[#8870FF]/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="Your password" autoComplete="current-password"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EDE9D8] bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8870FF] focus:ring-2 focus:ring-[#8870FF]/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {authError && <p className="text-sm text-red-500">{authError}</p>}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 bg-[#8870FF] hover:bg-[#6a54e0] disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {authLoading && <Loader2 size={15} className="animate-spin" />}
                Sign in & finish
              </button>
            </form>
          )}

          {/* Confirm email */}
          {authScreen === 'confirm' && (
            <form onSubmit={handleInlineConfirm} className="space-y-3">
              <div className="text-center mb-1">
                <p className="text-sm font-semibold text-slate-900">Check your email</p>
                <p className="text-sm text-slate-500 mt-1">We sent a 6-digit code to <strong>{authEmail}</strong></p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Verification code</label>
                <input
                  type="text" required value={authCode}
                  onChange={e => setAuthCode(e.target.value)}
                  placeholder="123456" autoComplete="one-time-code"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EDE9D8] bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8870FF] focus:ring-2 focus:ring-[#8870FF]/20 transition-all"
                />
              </div>
              {authError && <p className="text-sm text-red-500">{authError}</p>}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 bg-[#8870FF] hover:bg-[#6a54e0] disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {authLoading && <Loader2 size={15} className="animate-spin" />}
                Verify & finish setup
              </button>
              <div className="text-center">
                <button type="button" onClick={handleResendCode} disabled={authLoading} className="text-sm text-[#8870FF] hover:text-[#6a54e0] font-medium">
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Summary Section */}
      <div className={cardBase}>
        <h2 className="text-lg font-bold text-slate-900 mb-6">Summary of your situation</h2>
        
        <div className="space-y-6">
          {/* Destination */}
          <div className="border-l-4 border-[#8870FF] pl-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">📍 Destination</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Country:</span> {formatValue(draft.destinationCountry)}</p>
              <p><span className="font-medium">City:</span> {formatValue(draft.destinationCity)}</p>
              <p><span className="font-medium">University:</span> {formatValue(draft.destinationUniversity)}</p>
            </div>
          </div>

          {/* Origin */}
          <div className="border-l-4 border-[#8870FF] pl-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">🏠 Your background</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Nationality:</span> {formatValue(draft.nationality)}</p>
              <p><span className="font-medium">Current residence:</span> {formatValue(draft.residenceCountry)}</p>
              <p><span className="font-medium">EU citizen:</span> {formatValue(draft.isEuCitizen)}</p>
            </div>
          </div>

          {/* Program */}
          <div className="border-l-4 border-[#8870FF] pl-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">🎓 Your program</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Degree type:</span> {formatValue(draft.degreeType)}</p>
              <p><span className="font-medium">Field of study:</span> {draft.fieldOfStudyUnknown ? 'Unknown' : formatValue(draft.fieldOfStudy)}</p>
              <p><span className="font-medium">Start month:</span> {draft.programStartMonthUnknown ? 'Unknown' : formatValue(draft.programStartMonth)}</p>
              <p><span className="font-medium">Applied to program:</span> {formatValue(draft.programApplied)}</p>
              {draft.programApplied === 'yes' && (
                <p><span className="font-medium">Accepted:</span> {formatValue(draft.programAccepted)}</p>
              )}
            </div>
          </div>

          {/* Application requirements - only if not applied */}
          {draft.programApplied === 'no' && (
          <div className="border-l-4 border-[#8870FF] pl-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 Application requirements</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><span className="font-medium">GMAT/Entrance test:</span> {formatValue(draft.hasGmatOrEntranceTest)}</p>
                {draft.hasGmatOrEntranceTest === 'yes' && draft.gmatScore && (
                  <p className="pl-4"><span className="font-medium">Score:</span> {draft.gmatScore}</p>
                )}
                <p><span className="font-medium">English test:</span> {formatValue(draft.hasEnglishTest)}</p>
                {draft.hasEnglishTest === 'yes' && (
                  <>
                    {draft.englishTestType && <p className="pl-4"><span className="font-medium">Type:</span> {draft.englishTestType}</p>}
                    {draft.englishTestScore && <p className="pl-4"><span className="font-medium">Score:</span> {draft.englishTestScore}</p>}
                  </>
                )}
                <p><span className="font-medium">Recommendation letters:</span> {formatValue(draft.hasRecommendationLetters)}</p>
                <p><span className="font-medium">CV/Resume:</span> {formatValue(draft.hasCv)}</p>
              </div>
            </div>
          )}

          {/* Visa - only for non-EU */}
          {draft.isEuCitizen !== 'yes' && (
          <div className="border-l-4 border-[#8870FF] pl-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">🛂 Visa status</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><span className="font-medium">Has visa for {draft.destinationCountry}:</span> {formatValue(draft.hasVisa)}</p>
              </div>
            </div>
          )}

          {/* Current progress */}
          <div className="border-l-4 border-[#8870FF] pl-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">✅ Current progress</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Codice Fiscale:</span> {formatValue(draft.hasCodiceFiscale)}</p>
              <p><span className="font-medium">Residence Permit:</span> {formatValue(draft.hasResidencePermit)}</p>
              <p><span className="font-medium">Housing secured:</span> {formatValue(draft.hasHousing)}</p>
              {draft.needsBankAccount === 'yes' && (
                <p><span className="font-medium">Local bank account:</span> {formatValue(draft.hasBankAccount)}</p>
              )}
              {draft.needsPhoneNumber === 'yes' && (
                <p><span className="font-medium">Local phone number:</span> {formatValue(draft.hasPhoneNumber)}</p>
              )}
              <p><span className="font-medium">Travel insurance:</span> {formatValue(draft.hasTravelInsurance)}</p>
              <p><span className="font-medium">Health insurance:</span> {formatValue(draft.hasHealthInsurance)}</p>
            </div>
          </div>
        </div>
      </div>

      {saveError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      ) : null}
    </OnboardingLayout>
  )
}