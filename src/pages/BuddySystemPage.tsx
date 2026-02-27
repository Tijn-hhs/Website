import { useState, useEffect } from 'react'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import { fetchMe, saveProfile, fetchBuddyMatch, type BuddyMatchProfile } from '../lib/api'
import type { UserProfile } from '../types/user'
import {
  Users,
  Phone,
  Instagram,
  Linkedin,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Globe,
  Calendar,
  MessageSquare,
  ExternalLink,
  Pencil,
  AlertCircle,
  Loader2,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const LOOKING_FOR_OPTIONS = [
  { id: 'flatmate',    label: 'Flatmate search',        desc: 'Co-search for an apartment' },
  { id: 'bureaucracy', label: 'Bureaucracy buddy',       desc: 'Navigate permesso, codice fiscale, etc.' },
  { id: 'study',       label: 'Study partner',           desc: 'Find someone to study with' },
  { id: 'social',      label: 'Friendship & socialising',desc: 'Explore Milan together' },
  { id: 'career',      label: 'Career networking',       desc: 'Build professional connections' },
  { id: 'language',    label: 'Language exchange',       desc: 'Practice Italian or another language' },
  { id: 'sports',      label: 'Sports partner',          desc: 'Find someone to work out with' },
  { id: 'city',        label: 'City guide',              desc: 'Get tips from someone who knows Milan' },
]


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatProgram(profile: UserProfile): string {
  const parts = [profile.degreeType, profile.fieldOfStudy].filter(Boolean)
  if (parts.length === 0) return 'Program not set'
  return parts.join(' — ')
}

function formatArrival(profile: UserProfile): string {
  if (!profile?.programStartMonth) return 'Arrival month not set'
  const d = new Date(`${profile.programStartMonth}-01`)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function parseLookingFor(raw?: string): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
      </div>
    </div>
  )
}

function ContactLink({
  href, icon, label, sublabel, color,
}: {
  href: string; icon: React.ReactNode; label: string; sublabel: string; color: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-xl border p-4 hover:shadow-md transition-shadow group ${color}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{sublabel}</p>
      </div>
      <ExternalLink size={14} className="flex-shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors" />
    </a>
  )
}

// ─── State: IDLE (opt-in form) ────────────────────────────────────────────────

function IdleView({
  profile, onSubmit, loading,
}: {
  profile: UserProfile
  onSubmit: (data: { displayName: string; phone: string; instagram: string; linkedin: string; lookingFor: string[]; bio: string }) => Promise<void>
  loading: boolean
}) {
  const [displayName, setDisplayName] = useState(profile?.preferredName || '')
  const [phone, setPhone] = useState(profile?.buddyPhone || '')
  const [instagram, setInstagram] = useState(profile?.buddyInstagram || '')
  const [linkedin, setLinkedin] = useState(profile?.buddyLinkedIn || '')
  const [lookingFor, setLookingFor] = useState<string[]>(parseLookingFor(profile?.buddyLookingFor))
  const [bio, setBio] = useState(profile?.buddyBio || '')
  const [submitting, setSubmitting] = useState(false)

  const toggleLookingFor = (id: string) =>
    setLookingFor((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const canSubmit = displayName.trim() && phone.trim() && lookingFor.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    await onSubmit({ displayName, phone, instagram, linkedin, lookingFor, bio })
    setSubmitting(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Left: explainer ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-[#D9D3FB] bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-[#8870FF]" />
            <h3 className="font-semibold text-slate-800">How matching works</h3>
          </div>
          <ol className="space-y-3">
            {[
              'Fill in your contact details and what you\'re looking for.',
              'We match you with a compatible student based on your profile, arrival period, and goals.',
              'Once matched, you see each other\'s contact details and can connect directly.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#8870FF] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Profile preview from DB */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">How you'll appear</p>
          <p className="text-xs text-slate-400">Pulled from your Leavs profile.</p>
          <div className="space-y-3 pt-1">
            <ProfileRow icon={<GraduationCap size={15} />} label="Program" value={formatProgram(profile)} />
            <ProfileRow icon={<Globe size={15} />} label="Nationality" value={profile?.nationality || ''} />
            <ProfileRow icon={<Calendar size={15} />} label="Arrival" value={formatArrival(profile)} />
          </div>
          {(!profile?.nationality || !profile?.degreeType) && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 mt-2">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
              <p className="text-xs text-amber-700">Some profile fields are missing. Complete your onboarding to fill them in.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="lg:col-span-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Join the buddy pool</h3>
            <p className="text-sm text-slate-500 mt-0.5">Your contact details are only shared with your match.</p>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Display name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Tijn V."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <p className="mt-1 text-xs text-slate-400">First name + last initial is enough for privacy.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone / WhatsApp <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                placeholder="+31 6 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Include country code. Shared only with your match.</p>
          </div>

          {/* Instagram + LinkedIn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Instagram <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="@yourhandle"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="linkedin.com/in/yourname"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Looking for */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              What are you looking for? <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LOOKING_FOR_OPTIONS.map((opt) => {
                const selected = lookingFor.includes(opt.id)
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleLookingFor(opt.id)}
                    className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition-colors ${
                      selected
                        ? 'border-[#a594ff] bg-[#F0EDFF] text-[#5b3fd4]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${selected ? 'bg-[#8870FF] border-[#8870FF]' : 'border-slate-300'}`}>
                      {selected && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="currentColor"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{opt.label}</p>
                      <p className="text-xs text-slate-400 leading-tight mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Message to your match <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="A sentence or two about yourself — background, what you're excited about, what kind of buddy you're hoping for…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8870FF] hover:bg-[#6a54e0] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors"
          >
            {submitting || loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Users size={15} />
                Find my match
                <ChevronRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── State: PENDING ───────────────────────────────────────────────────────────

function PendingView({
  profile, onEdit,
}: {
  profile: UserProfile
  onEdit: () => void
}) {
  const lookingFor = parseLookingFor(profile.buddyLookingFor)
  const lookingForLabels = LOOKING_FOR_OPTIONS.filter((o) => lookingFor.includes(o.id)).map((o) => o.label)

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center">
            <Clock size={26} className="text-amber-600 animate-pulse" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-800">You're in the pool!</h3>
        <p className="text-sm text-slate-600 mt-1">
          We're looking for the best match based on your program, arrival period, and goals. We'll notify you as soon as you're paired.
        </p>
      </div>

      {/* Profile summary */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your profile in the pool</p>
          <button onClick={onEdit} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            <Pencil size={11} />
            Edit
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#8870FF] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(profile.buddyDisplayName || profile.preferredName || '?').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{profile.buddyDisplayName || profile.preferredName}</p>
            <p className="text-sm text-slate-500">{formatProgram(profile)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ProfileRow icon={<Globe size={14} />} label="Nationality" value={profile.nationality || '—'} />
          <ProfileRow icon={<Calendar size={14} />} label="Arrival" value={formatArrival(profile)} />
          {profile.buddyPhone && (
            <ProfileRow icon={<Phone size={14} />} label="WhatsApp" value={profile.buddyPhone} />
          )}
          {profile.buddyInstagram && (
            <ProfileRow icon={<Instagram size={14} />} label="Instagram" value={profile.buddyInstagram} />
          )}
        </div>

        {lookingForLabels.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Looking for</p>
            <div className="flex flex-wrap gap-1.5">
              {lookingForLabels.map((l) => (
                <span key={l} className="rounded-full bg-[#F0EDFF] border border-[#EDE9D8] text-[#6a54e0] px-2.5 py-1 text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>
        )}

        {profile.buddyBio && (
          <div>
            <p className="text-xs text-slate-400 mb-1">Your message</p>
            <p className="text-sm text-slate-600 italic">"{profile.buddyBio}"</p>
          </div>
        )}
      </div>


    </div>
  )
}

// ─── State: MATCHED ───────────────────────────────────────────────────────────

function MatchedView({ profile, match, matchLoading }: { profile: UserProfile; match: BuddyMatchProfile | null; matchLoading: boolean }) {
  if (matchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="text-[#8870FF] animate-spin" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm text-amber-800 font-medium">Match details could not be loaded.</p>
          <p className="text-xs text-amber-600 mt-1">Please refresh the page or contact support.</p>
        </div>
      </div>
    )
  }

  const myLookingFor = parseLookingFor(profile.buddyLookingFor)
  const matchLookingForIds = parseLookingFor(match.lookingFor)
  const sharedGoals = LOOKING_FOR_OPTIONS
    .filter((o) => myLookingFor.includes(o.id) && matchLookingForIds.includes(o.id))
    .map((o) => o.label)

  const initials = (match.displayName || '?').slice(0, 2).toUpperCase()
  const program = [match.degreeType, match.fieldOfStudy].filter(Boolean).join(' — ') || 'Program not set'

  return (
    <div className="space-y-6">
      {/* Celebration banner */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
          <Sparkles size={15} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">You've been matched!</p>
          <p className="text-xs text-slate-500 mt-0.5">We found someone compatible. Reach out and start planning your move to Milan together.</p>
        </div>
      </div>

      {/* Two-column layout on wider screens */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: match card */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ring-2 ring-white/30">
              {initials}
            </div>
            <div className="text-white">
              <span className="font-semibold text-base">{match.displayName}</span>
              <p className="text-indigo-200 text-xs mt-0.5">{program}</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <ProfileRow icon={<Globe size={14} />} label="Nationality" value={match.nationality || '—'} />
              <ProfileRow icon={<Calendar size={14} />} label="Arriving" value={match.programStartMonth ? new Date(`${match.programStartMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'} />
            </div>

            {matchLookingForIds.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Looking for</p>
                <div className="flex flex-wrap gap-1.5">
                  {LOOKING_FOR_OPTIONS.filter((o) => matchLookingForIds.includes(o.id)).map((o) => (
                    <span key={o.id} className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-medium border border-slate-200">{o.label}</span>
                  ))}
                </div>
              </div>
            )}

            {sharedGoals.length > 0 && (
              <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5">You both want</p>
                <div className="flex flex-wrap gap-1.5">
                  {sharedGoals.map((g) => (
                    <span key={g} className="rounded-full bg-indigo-600 text-white px-2.5 py-1 text-xs font-medium">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {match.bio && (
              <div>
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <MessageSquare size={12} />
                  Message from {match.displayName}
                </p>
                <blockquote className="text-sm text-slate-700 italic bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  "{match.bio}"
                </blockquote>
              </div>
            )}
          </div>
        </div>

        {/* Right: contact details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#8870FF]" />
              Contact details — reach out directly
            </p>
            {match.phone && (
              <ContactLink
                href={`https://wa.me/${match.phone.replace(/\s+/g, '').replace('+', '')}`}
                icon={<Phone size={18} className="text-green-600" />}
                label="WhatsApp"
                sublabel={match.phone}
                color="border-green-100 hover:bg-green-50"
              />
            )}
            {match.instagram && (
              <ContactLink
                href={`https://instagram.com/${match.instagram.replace('@', '')}`}
                icon={<Instagram size={18} className="text-pink-500" />}
                label="Instagram"
                sublabel={match.instagram}
                color="border-pink-100 hover:bg-pink-50"
              />
            )}
            {match.linkedin && (
              <ContactLink
                href={`https://${match.linkedin}`}
                icon={<Linkedin size={18} className="text-[#8870FF]" />}
                label="LinkedIn"
                sublabel={match.linkedin}
                color="border-[#EDE9D8] hover:bg-[#F0EDFF]"
              />
            )}
          </div>

          {/* Reminder of your own shared details */}
          <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-2">
            <Users size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Your contact details</span> ({profile.buddyPhone || 'phone not set'}{profile.buddyInstagram ? `, ${profile.buddyInstagram}` : ''}) have been shared with {match?.displayName}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewState = 'loading' | 'idle' | 'pending' | 'matched'

export default function BuddySystemPage() {
  const [viewState, setViewState] = useState<ViewState>('loading')
  const [profile, setProfile] = useState<UserProfile>({})
  const [saveError, setSaveError] = useState(false)
  const [matchData, setMatchData] = useState<BuddyMatchProfile | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMe()
        const p: UserProfile = data?.profile || {}
        setProfile(p)
        if (p.buddyStatus === 'matched') {
          setViewState('matched')
          setMatchLoading(true)
          try {
            const m = await fetchBuddyMatch()
            setMatchData(m)
          } catch {
            // match details not available yet
          } finally {
            setMatchLoading(false)
          }
        } else if (p.buddyOptIn === 'yes') {
          setViewState('pending')
        } else {
          setViewState('idle')
        }
      } catch {
        setViewState('idle')
      }
    }
    load()
  }, [])

  const handleOptIn = async (form: {
    displayName: string; phone: string; instagram: string; linkedin: string; lookingFor: string[]; bio: string
  }) => {
    setSaveError(false)
    const updated: UserProfile = {
      ...profile,
      buddyOptIn: 'yes',
      buddyStatus: 'pending',
      buddyDisplayName: form.displayName,
      buddyPhone: form.phone,
      buddyInstagram: form.instagram,
      buddyLinkedIn: form.linkedin,
      buddyLookingFor: JSON.stringify(form.lookingFor),
      buddyBio: form.bio,
      ...(form.displayName ? { preferredName: form.displayName.split(' ')[0] } : {}),
    }
    const ok = await saveProfile(updated)
    if (ok) { setProfile(updated); setViewState('pending') }
    else setSaveError(true)
  }

  const subtitle =
    viewState === 'matched'
      ? "You've been matched! Reach out to your buddy directly using the contact details below."
      : viewState === 'pending'
      ? "You're in the pool — we're working on finding your best match."
      : 'Tell us what you need and we\'ll pair you with a compatible fellow student.'

  return (
    <>
      <FeedbackWidget />
        <StepPageLayout
          stepNumber={0}
          totalSteps={0}
          stepLabel="TOOL"
          title="Buddy System"
          subtitle={subtitle}
          useGradientBar
          fullWidth
          showChecklist={false}
        >
          {saveError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 text-sm text-red-700 mb-4">
              <AlertCircle size={15} />
              Failed to save. Please check your connection and try again.
            </div>
          )}

          {viewState === 'loading' && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#D9D3FB] border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}
          {viewState === 'idle' && (
            <IdleView profile={profile} onSubmit={handleOptIn} loading={false} />
          )}
          {viewState === 'pending' && (
            <PendingView profile={profile} onEdit={() => setViewState('idle')} />
          )}
          {viewState === 'matched' && (
            <MatchedView profile={profile} match={matchData} matchLoading={matchLoading} />
          )}
        </StepPageLayout>
    </>
  )
}

