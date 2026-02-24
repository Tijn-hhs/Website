import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'

import StepPageLayout from '../components/StepPageLayout'
import { fetchMe } from '../lib/api'
import type { UserProfile } from '../types/user'
import {
  MessageSquare,
  ExternalLink,
  Search,
  GraduationCap,
  ChevronDown,
  Users,
  Mail,
  Star,
} from 'lucide-react'
import FeedbackWidget from '../components/FeedbackWidget'

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'whatsapp' | 'telegram' | 'discord'

interface GroupChat {
  id: string
  university: string
  degreeType: 'bachelor' | 'master' | 'phd'
  program: string
  intakeYear: string   // e.g. "2025–2026"
  platform: Platform
  link: string
  memberCount?: number
  verified?: boolean
}

// ─── Group Chat Data ───────────────────────────────────────────────────────────
// Add new groups here. Links use # as placeholder — replace with real invite URLs.

const GROUP_CHATS: GroupChat[] = [
  // ── Bocconi – Master ──────────────────────────────────────────────────────
  {
    id: 'bocconi-msc-finance-2526',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Finance',
    intakeYear: '2025–2026',
    platform: 'whatsapp',
    link: '#',
    memberCount: 120,
    verified: true,
  },
  {
    id: 'bocconi-msc-marketing-2526',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Marketing Management',
    intakeYear: '2025–2026',
    platform: 'whatsapp',
    link: '#',
    memberCount: 98,
    verified: true,
  },
  {
    id: 'bocconi-msc-management-2526',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Management',
    intakeYear: '2025–2026',
    platform: 'whatsapp',
    link: '#',
    memberCount: 87,
    verified: true,
  },
  {
    id: 'bocconi-msc-economics-2526',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Economics and Social Sciences',
    intakeYear: '2025–2026',
    platform: 'telegram',
    link: '#',
    memberCount: 64,
    verified: true,
  },
  {
    id: 'bocconi-msc-data-science-2526',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Data Science and Business Analytics',
    intakeYear: '2025–2026',
    platform: 'whatsapp',
    link: '#',
    memberCount: 75,
    verified: true,
  },
  {
    id: 'bocconi-msc-law-2526',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Law',
    intakeYear: '2025–2026',
    platform: 'whatsapp',
    link: '#',
    memberCount: 55,
    verified: false,
  },
  {
    id: 'bocconi-msc-finance-2627',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Finance',
    intakeYear: '2026–2027',
    platform: 'whatsapp',
    link: '#',
    memberCount: 43,
    verified: false,
  },
  {
    id: 'bocconi-msc-marketing-2627',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Marketing Management',
    intakeYear: '2026–2027',
    platform: 'whatsapp',
    link: '#',
    memberCount: 31,
    verified: false,
  },
  {
    id: 'bocconi-msc-management-2627',
    university: 'Bocconi University',
    degreeType: 'master',
    program: 'MSc Management',
    intakeYear: '2026–2027',
    platform: 'telegram',
    link: '#',
    memberCount: 28,
    verified: false,
  },
  // ── Bocconi – Bachelor ────────────────────────────────────────────────────
  {
    id: 'bocconi-bsc-bia-2526',
    university: 'Bocconi University',
    degreeType: 'bachelor',
    program: 'BSc Business Administration and Management',
    intakeYear: '2025–2026',
    platform: 'whatsapp',
    link: '#',
    memberCount: 210,
    verified: true,
  },
  {
    id: 'bocconi-bsc-economics-2526',
    university: 'Bocconi University',
    degreeType: 'bachelor',
    program: 'BSc Economics, Management and Computer Science (BEMACS)',
    intakeYear: '2025–2026',
    platform: 'discord',
    link: '#',
    memberCount: 160,
    verified: true,
  },
  {
    id: 'bocconi-bsc-ilaw-2526',
    university: 'Bocconi University',
    degreeType: 'bachelor',
    program: 'BSc International Politics and Government',
    intakeYear: '2025–2026',
    platform: 'whatsapp',
    link: '#',
    memberCount: 90,
    verified: true,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<Platform, string> = {
  whatsapp: 'bg-green-50 text-green-700 border-green-200',
  telegram: 'bg-blue-50 text-blue-700 border-blue-200',
  discord:  'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const PLATFORM_LABELS: Record<Platform, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  discord:  'Discord',
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${PLATFORM_COLORS[platform]}`}>
      <MessageSquare size={10} />
      {PLATFORM_LABELS[platform]}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <Star size={10} className="fill-amber-500 text-amber-500" />
      Verified
    </span>
  )
}

function GroupCard({
  group,
  isMatch,
}: {
  group: GroupChat
  isMatch: boolean
}) {
  return (
    <div
      className={`relative flex flex-col gap-3 rounded-2xl border p-5 transition-shadow hover:shadow-md ${
        isMatch
          ? 'border-green-300 bg-green-50/60 shadow-sm ring-1 ring-green-200'
          : 'border-slate-200 bg-white'
      }`}
    >
      {isMatch && (
        <span className="absolute -top-3 left-4 rounded-full bg-green-500 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
          Your group
        </span>
      )}

      <div className="mt-1">
        <p className="text-xs text-slate-400 mb-0.5">{group.university}</p>
        <h3 className="text-sm font-semibold text-slate-800 leading-snug">{group.program}</h3>
        <p className="text-xs text-slate-500 mt-0.5 capitalize">{group.degreeType} · {group.intakeYear}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PlatformBadge platform={group.platform} />
        {group.verified && <VerifiedBadge />}
        {group.memberCount !== undefined && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Users size={11} />
            {group.memberCount.toLocaleString()} members
          </span>
        )}
      </div>

      <a
        href={group.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          isMatch
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        Join group
        <ExternalLink size={13} />
      </a>
    </div>
  )
}

// ─── Match logic ──────────────────────────────────────────────────────────────

function detectIntakeYear(profile: UserProfile): string | null {
  if (!profile.programStartMonth) return null
  const month = parseInt(profile.programStartMonth.split('-')[1] ?? '0', 10)
  const year  = parseInt(profile.programStartMonth.split('-')[0] ?? '0', 10)
  if (!year) return null
  // Academic year: if month >= 9 → year/year+1, else year-1/year
  const academicStart = month >= 9 ? year : year - 1
  return `${academicStart}–${academicStart + 1}`
}

function isMatch(group: GroupChat, profile: UserProfile): boolean {
  const intakeYear = detectIntakeYear(profile)
  const programLower = (profile.fieldOfStudy ?? '').toLowerCase()
  const degreeMatch =
    profile.degreeType === 'bachelor'
      ? group.degreeType === 'bachelor'
      : profile.degreeType === 'master'
      ? group.degreeType === 'master'
      : false

  const yearMatch = intakeYear ? group.intakeYear === intakeYear : false
  const programMatch = programLower.length > 0 && group.program.toLowerCase().includes(programLower.split(' ')[0])

  return degreeMatch && yearMatch && programMatch
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FindYourPeersPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [search, setSearch] = useState('')
  const [filterDegree, setFilterDegree] = useState<'all' | 'bachelor' | 'master' | 'phd'>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [showMissing, setShowMissing] = useState(false)

  useEffect(() => {
    fetchMe()
      .then((data) => setProfile(data?.profile ?? null))
      .catch(() => setProfile(null))
  }, [])

  // Derive filter options
  const allYears = Array.from(new Set(GROUP_CHATS.map((g) => g.intakeYear))).sort()

  // Auto-set year filter to profile's intake year on first load
  useEffect(() => {
    if (!profile) return
    const detectedYear = detectIntakeYear(profile)
    if (detectedYear && allYears.includes(detectedYear)) {
      setFilterYear(detectedYear)
    }
    if (profile.degreeType === 'bachelor' || profile.degreeType === 'master') {
      setFilterDegree(profile.degreeType as 'bachelor' | 'master')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  // Filter groups
  const filtered = GROUP_CHATS.filter((g) => {
    if (filterDegree !== 'all' && g.degreeType !== filterDegree) return false
    if (filterYear !== 'all' && g.intakeYear !== filterYear) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (
        !g.program.toLowerCase().includes(q) &&
        !g.university.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  // Sort: matched group first
  const sorted = [...filtered].sort((a, b) => {
    const aMatch = profile ? isMatch(a, profile) : false
    const bMatch = profile ? isMatch(b, profile) : false
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return 0
  })

  return (
    <>
      <FeedbackWidget />
      <DashboardLayout>
      <StepPageLayout
        stepNumber={0}
        totalSteps={0}
        stepLabel="TOOL"
        title="Find Your Peers"
        subtitle="Join the group chat for your programme and intake year."
        useGradientBar
        fullWidth
        showChecklist={false}
      >
        {/* ── Hero intro ── */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 mt-0.5 text-slate-400">
              <MessageSquare size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Connect with your classmates</p>
              <p className="mt-0.5 text-sm text-slate-600">
                Find and join the WhatsApp, Telegram, or Discord group for your programme and year. 
                All groups are student-run and verified by the Leavs team where marked.
              </p>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search programme…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Degree filter */}
          <div className="relative">
            <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value as typeof filterDegree)}
              className="appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">All degrees</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
              <option value="phd">PhD</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Year filter */}
          <div className="relative">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-8 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">All years</option>
              {allYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Group cards grid ── */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                isMatch={profile ? isMatch(group, profile) : false}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <Users size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">No groups found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or clear the search.</p>
          </div>
        )}

        {/* ── Missing group CTA ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <button
            onClick={() => setShowMissing((v) => !v)}
            className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-slate-800"
          >
            <span className="flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              Can't find your group?
            </span>
            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform ${showMissing ? 'rotate-180' : ''}`}
            />
          </button>

          {showMissing && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-600">
                If your programme's group chat isn't listed yet, you can either:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 list-none">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 font-bold text-slate-800">1.</span>
                  <span>
                    <strong>Submit your group link</strong> — send it to{' '}
                    <a
                      href="mailto:hello@leavs.io?subject=Group%20chat%20submission"
                      className="text-green-700 underline underline-offset-2 hover:text-green-800"
                    >
                      hello@leavs.io
                    </a>{' '}
                    and we'll add it to the directory within 24 hours.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 font-bold text-slate-800">2.</span>
                  <span>
                    <strong>Create one yourself</strong> — start a WhatsApp or Telegram group and invite your future classmates. Share the link with us and we'll verify and list it here.
                  </span>
                </li>
              </ul>
              <a
                href="mailto:hello@leavs.io?subject=Group%20chat%20submission"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                <Mail size={14} />
                Submit a group
              </a>
            </div>
          )}
        </div>

      </StepPageLayout>
      </DashboardLayout>
    </>  
  )
}
