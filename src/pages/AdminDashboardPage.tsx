import { useEffect, useState, useMemo } from 'react'
import {
  Users,
  UserCheck,
  MessageSquare,
  TrendingUp,
  BarChart2,
  Map,
  Globe,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  LayoutDashboard,
  LineChart,
  Search,
  Filter,
  Clock,
  Heart,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Home,
  CreditCard,
  Plane,
  Mail,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Send,
  Bell,
  Plus,
  Pencil,
  Trash2,
  Database,
  Layers,
  Banknote,
  Luggage,
  FileText,
  Shield,
  Info,
  Bot,
  UserPlus,
  BookOpen,
  Briefcase,
  Building,
  Calculator,
  Calendar,
  HelpCircle,
  X,
  ExternalLink,
  type LucideProps,
} from 'lucide-react'

// ─── Dynamic Lucide icon renderer ─────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  GraduationCap, Banknote, Plane, CreditCard, Luggage, FileText,
  Home, Shield, Heart, Info, BarChart2, Users, Bot, UserPlus,
  Globe, Map, BookOpen, Briefcase, Building, Calculator,
  Calendar, HelpCircle, LayoutDashboard, MessageSquare, Database,
  Search, Bell, Mail, ShieldCheck, TrendingUp, LineChart, UserCheck,
}

const ICON_OPTIONS = Object.keys(ICON_MAP).sort()

function ModuleIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null
  const Icon = ICON_MAP[name]
  if (!Icon) return null
  return <Icon className={className ?? 'w-4 h-4'} />
}

const STEP_TYPE_META: Record<StepType, { label: string; color: string; desc: string }> = {
  journey: { label: 'Journey',  color: 'bg-indigo-900/40 border-indigo-700/50 text-indigo-300',  desc: 'A numbered step students work through in sequence.' },
  info:    { label: 'Info',     color: 'bg-gray-800 border-gray-700 text-gray-400',               desc: 'A resource/reference page accessible at any time.' },
  tool:    { label: 'Tool',     color: 'bg-cyan-900/30 border-cyan-700/50 text-cyan-300',         desc: 'An interactive tool such as a calculator or map.' },
}

function StepTypeBadge({ type }: { type?: StepType }) {
  if (!type) return <span className="text-xs px-1.5 py-0.5 rounded border border-gray-800 text-gray-600">—</span>
  const m = STEP_TYPE_META[type]
  return <span className={`text-xs px-1.5 py-0.5 rounded border ${m.color}`}>{m.label}</span>
}
import { fetchAdminStats, fetchAdminWhatsappMessages, fetchAdminFeedback, fetchAdminBuddyPool, adminBuddyMatch, fetchAdminUsers, fetchAdminEmailTemplates, updateAdminEmailTemplate, sendTestEmail, sendDeadlineReminders, scrapeDeadlines, fetchAdminContentCountries, createContentCountry, deleteContentCountry, fetchAdminContentCities, createContentCity, deleteContentCity, fetchAdminContentUniversities, createContentUniversity, deleteContentUniversity, fetchAdminContentModules, createContentModule, updateContentModule, deleteContentModule, fetchAdminContentOriginCountries, createContentOriginCountry, deleteContentOriginCountry, recalculateDashboardPlans, type AdminStats, type WhatsAppMessage, type WhatsAppMessagesResponse, type FeedbackItem, type BuddyPoolUser, type AdminUserRecord, type EmailTemplate, type ContentCountry, type ContentCity, type ContentUniversity, type ContentModule, type ContentOriginCountry, type ContentVariant, type StepType, type DashboardPlanItem } from '../lib/api'
import { checkAdminStatus } from '../lib/adminAuth'

// ─── Shared helpers ────────────────────────────────────────────────────────────

function timeAgo(unixSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSeconds
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const GROUP_COLOURS: string[] = [
  'bg-blue-900/60 text-blue-300 border-blue-700',
  'bg-purple-900/60 text-purple-300 border-purple-700',
  'bg-green-900/60 text-green-300 border-green-700',
  'bg-red-900/60 text-red-300 border-red-700',
  'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  'bg-indigo-900/60 text-indigo-300 border-indigo-700',
  'bg-cyan-900/60 text-cyan-300 border-cyan-700',
  'bg-orange-900/60 text-orange-300 border-orange-700',
]

function GroupBadge({ name, index = 0 }: { name: string; index?: number }) {
  const cls = GROUP_COLOURS[index % GROUP_COLOURS.length]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium truncate max-w-[140px] ${cls}`}>
      {name}
    </span>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Bar chart (pure CSS) ─────────────────────────────────────────────────────

interface BarItem {
  label: string
  value: number
  max: number
}

function HorizontalBar({ label, value, max }: BarItem) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 truncate text-gray-400 text-right text-xs">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-gray-300 text-xs">{value}</span>
    </div>
  )
}

// ─── Sparkline (signup timeline) ─────────────────────────────────────────────

interface SparklineProps {
  data: { date: string; count: number }[]
}

function Sparkline({ data }: SparklineProps) {
  if (data.length === 0) {
    return (
      <p className="text-gray-600 text-sm text-center py-6">No signup data yet.</p>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)
  const width = 600
  const height = 80
  const padX = 4
  const padY = 8

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * (width - padX * 2)
    const y = padY + ((max - d.count) / max) * (height - padY * 2)
    return `${x},${y}`
  })

  // Recent 7 days for the x-axis labels
  const labelIndices = data.length <= 7
    ? data.map((_, i) => i)
    : [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor((3 * data.length) / 4), data.length - 1]

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height + 20}`}
        className="w-full"
        style={{ minWidth: 300 }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = padY + (1 - t) * (height - padY * 2)
          return (
            <line
              key={t}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#374151"
              strokeWidth={0.5}
            />
          )
        })}

        {/* Filled area */}
        <polygon
          points={[
            `${padX},${height - padY}`,
            ...points,
            `${width - padX},${height - padY}`,
          ].join(' ')}
          fill="rgba(99,102,241,0.15)"
        />

        {/* Line */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {data.length <= 30 &&
          points.map((pt, i) => {
            const [x, y] = pt.split(',').map(Number)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={2.5}
                fill="#818cf8"
              />
            )
          })}

        {/* X-axis labels */}
        {labelIndices.map((i) => {
          const d = data[i]
          const [x] = points[i].split(',').map(Number)
          const label = d.date.slice(5) // MM-DD
          return (
            <text
              key={i}
              x={x}
              y={height + 16}
              textAnchor="middle"
              fontSize={9}
              fill="#6b7280"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Data Analytics (WhatsApp)
// ═══════════════════════════════════════════════════════════════════════════════

function WhatsAppMessageCard({ msg, groupIndex }: { msg: WhatsAppMessage; groupIndex: number }) {
  const date = new Date(msg.timestamp * 1000)
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors">
      <p className="text-sm text-white leading-snug">{msg.body}</p>
      <div className="flex flex-wrap items-center gap-2 mt-2.5">
        <GroupBadge name={msg.groupName || msg.groupId} index={groupIndex} />
        <span className="text-xs text-gray-500">{msg.senderName || msg.sender}</span>
        <span className="flex items-center gap-0.5 text-xs text-gray-600"><Clock className="w-3 h-3" />{timeAgo(msg.timestamp)}</span>
        <span className="text-xs text-gray-700">{date.toLocaleDateString()}</span>
      </div>
    </div>
  )
}

function DataAnalyticsTab() {
  const [data, setData] = useState<WhatsAppMessagesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const result = await fetchAdminWhatsappMessages()
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load WhatsApp messages')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const groups = useMemo(() => {
    if (!data) return [] as { id: string; name: string }[]
    const seen: Record<string, string> = {}
    for (const m of data.messages) seen[m.groupId] = m.groupName || m.groupId
    return Object.entries(seen).map(([id, name]) => ({ id, name }))
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.messages.filter((m) => {
      const matchGroup = selectedGroup === 'all' || m.groupId === selectedGroup
      const q = search.toLowerCase()
      const matchSearch = !q || m.body.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q)
      return matchGroup && matchSearch
    })
  }, [data, selectedGroup, search])

  const topKeywords = useMemo(() => {
    if (!data) return []
    const stop = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','i','my','you','it','this','that','be','have','do','from','by','as','what','how','when','about','can','will','not','if','so','than','get','just','like','hey','hi','hi!','yes','no','ok','its','im','we','he','she','they','our','your','has','had','been','would','could','should'])
    const freq: Record<string, number> = {}
    for (const m of data.messages) {
      const words = m.body.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      for (const w of words) {
        if (w.length > 3 && !stop.has(w)) freq[w] = (freq[w] ?? 0) + 1
      }
    }
    return Object.entries(freq).sort(([,a],[,b]) => b - a).slice(0, 20).map(([word, count]) => ({ word, count }))
  }, [data])

  if (loading) return <div className="flex items-center justify-center py-24"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>

  if (error) return (
    <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-5">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-300 font-medium">Failed to load WhatsApp data</p>
        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
        <p className="text-gray-500 text-xs mt-2">
          Run the whatsapp-poller script on your laptop first:
          <code className="bg-gray-900 px-1 rounded ml-1">cd scripts/whatsapp-poller && node index.js</code>
        </p>
        <button onClick={() => load()} className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Try again</button>
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div className="space-y-8">
      {/* Per-group counts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Messages by Group</h2>
          <button onClick={() => load(true)} disabled={refreshing} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(groups as { id: string; name: string }[]).map(({ id, name }, _i) => (
            <button key={id} onClick={() => setSelectedGroup(selectedGroup === id ? 'all' : id)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedGroup === id ? 'border-indigo-600 bg-indigo-900/30' : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}>
              <p className="text-lg font-bold text-white">{data.groupCounts[name] ?? data.groupCounts[id] ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{name}</p>
            </button>
          ))}
          <button onClick={() => setSelectedGroup('all')}
            className={`rounded-xl border p-3 text-left transition-all ${
              selectedGroup === 'all' ? 'border-indigo-600 bg-indigo-900/30' : 'border-gray-800 bg-gray-900 hover:border-gray-600'
            }`}>
            <p className="text-lg font-bold text-white">{data.total}</p>
            <p className="text-xs text-gray-400 mt-0.5">All groups</p>
          </button>
        </div>
      </section>

      {topKeywords.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Top Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map(({ word, count }) => (
              <button key={word} onClick={() => setSearch(search === word ? '' : word)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                  search === word ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                }`}>
                {word} <span className="opacity-50">{count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors" />
        </div>
        {groups.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-600 appearance-none transition-colors">
              <option value="all">All groups</option>
              {(groups as { id: string; name: string }[]).map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 -mt-4">
        Showing {filtered.length} message{filtered.length !== 1 ? 's' : ''}
        {selectedGroup !== 'all' ? ` from ${(groups as { id: string; name: string }[]).find(g => g.id === selectedGroup)?.name ?? selectedGroup}` : ''}
        {search ? ` matching “${search}”` : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="font-medium">No messages found</p>
          <p className="text-xs mt-1">
            {data.total === 0
              ? 'Run the whatsapp-poller script on your laptop to start collecting messages.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {(filtered as WhatsAppMessage[]).map((msg) => {
            const groupIdx = (groups as { id: string; name: string }[]).findIndex(g => g.id === msg.groupId)
            return <WhatsAppMessageCard key={msg.messageId} msg={msg} groupIndex={groupIdx} />
          })}
        </div>
      )}
    </div>
  )
}

function OverviewTab({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats.overview.totalUsers} sub="All registered accounts" />
          <StatCard icon={<UserCheck className="w-5 h-5" />} label="Active Users" value={stats.overview.activeUsers} sub="Have completed ≥1 step" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Avg. Steps Done" value={stats.overview.avgStepsCompleted} sub="Per active user" />
          <StatCard icon={<MessageSquare className="w-5 h-5" />} label="Feedback" value={stats.overview.totalFeedback} sub="Total submissions" />
        </div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5" /> Signups Over Time
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <Sparkline data={stats.signupTimeline} />
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <Map className="w-3.5 h-3.5" /> Top Destinations
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            {stats.topDestinations.length === 0
              ? <p className="text-gray-600 text-sm">No data yet.</p>
              : stats.topDestinations.map((d) => (
                <HorizontalBar key={d.city} label={d.city} value={d.count} max={stats.topDestinations[0].count} />
              ))}
          </div>
        </section>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Top Nationalities
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            {stats.topNationalities.length === 0
              ? <p className="text-gray-600 text-sm">No data yet.</p>
              : stats.topNationalities.map((n) => (
                <HorizontalBar key={n.nationality} label={n.nationality} value={n.count} max={stats.topNationalities[0].count} />
              ))}
          </div>
        </section>
      </div>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5" /> Step Completion Breakdown
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          {stats.stepBreakdown.length === 0
            ? <p className="text-gray-600 text-sm">No step data yet.</p>
            : stats.stepBreakdown.map((s) => (
              <HorizontalBar key={s.step} label={s.step} value={s.completions} max={stats.stepBreakdown[0].completions} />
            ))}
        </div>
      </section>
      <p className="text-xs text-gray-700 text-right pb-6">
        Data generated at {new Date(stats.generatedAt).toLocaleString()}
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Feedback Tab
// ═══════════════════════════════════════════════════════════════════════════════

function FeedbackTab() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminFeedback()
      setItems(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load feedback')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (f) =>
        f.message.toLowerCase().includes(q) ||
        (f.page ?? '').toLowerCase().includes(q) ||
        (f.userId ?? '').toLowerCase().includes(q)
    )
  }, [items, search])

  if (loading) return <div className="flex items-center justify-center py-24"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>

  if (error) return (
    <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-5">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-300 font-medium">Failed to load feedback</p>
        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
        <button onClick={() => load()} className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Try again</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">User Feedback</h2>
          <p className="text-xs text-gray-500 mt-0.5">{items.length} submission{items.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages, pages or user IDs…"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{items.length === 0 ? 'No feedback submitted yet' : 'No results match your search'}</p>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {filtered.map((f) => (
            <div key={f.feedbackId} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-white text-sm leading-relaxed flex-1">{f.message}</p>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-500">
                    <Clock className="inline w-3 h-3 mr-0.5 -mt-0.5" />
                    {new Date(f.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs">
                  <Map className="w-3 h-3" />{f.page ?? 'unknown'}
                </span>
                <span className="text-xs text-gray-600">{f.userId}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Users
// ═══════════════════════════════════════════════════════════════════════════════

function statusBadge(label: string, colour: string) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colour}`}>
      {label}
    </span>
  )
}

function admissionBadge(status?: string) {
  if (!status) return null
  const map: Record<string, string> = {
    admitted: 'bg-emerald-900/40 border-emerald-700 text-emerald-300',
    applied: 'bg-blue-900/40 border-blue-700 text-blue-300',
    planning: 'bg-yellow-900/40 border-yellow-700 text-yellow-300',
    rejected: 'bg-red-900/40 border-red-700 text-red-300',
  }
  const key = Object.keys(map).find((k) => status.toLowerCase().includes(k)) || ''
  return statusBadge(status, map[key] || 'bg-gray-800 border-gray-700 text-gray-400')
}

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-sm text-gray-200 mt-0.5">{String(value)}</p>
    </div>
  )
}

function UserRow({ user }: { user: AdminUserRecord }) {
  const [open, setOpen] = useState(false)

  const name = user.preferredName || 'Unknown'
  const program = [user.degreeType, user.fieldOfStudy].filter(Boolean).join(' · ') || null
  const arrival = user.programStartMonth
    ? new Date(`${user.programStartMonth}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null
  const uni = user.destinationUniversity || user.destinationCity || null
  const lastSeen = user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
      >
        {/* Avatar */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold">
          {name.slice(0, 2).toUpperCase()}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{name}</span>
            {user.nationality && <span className="text-gray-400 text-xs">{user.nationality}</span>}
            {admissionBadge(user.admissionStatus)}
            {user.buddyOptIn === 'yes' && statusBadge('Buddy', 'bg-pink-900/40 border-pink-700 text-pink-300')}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {user.email && (
              <span className="inline-flex items-center gap-1 text-xs text-indigo-300 font-medium">
                <Mail className="w-3 h-3" />{user.email}
              </span>
            )}
            {program && <span className="text-xs text-gray-500">{program}</span>}
            {arrival && <span className="text-xs text-gray-600">• {arrival}</span>}
            {uni && <span className="text-xs text-gray-600">• {uni}</span>}
          </div>
        </div>

        {/* Right meta */}
        <div className="flex-shrink-0 flex items-center gap-3 text-right">
          {lastSeen && <span className="text-xs text-gray-600 hidden sm:block">{lastSeen}</span>}
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-gray-800 px-5 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
          <div className="col-span-full">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Personal &amp; Destination
            </p>
          </div>
          <Field label="Full name" value={user.preferredName} />
          <Field label="Nationality" value={user.nationality} />
          <Field label="Residence country" value={user.residenceCountry} />
          <Field label="Destination country" value={user.destinationCountry} />
          <Field label="Destination city" value={user.destinationCity} />
          <Field label="University" value={user.destinationUniversity} />

          <div className="col-span-full mt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3" /> Program &amp; Admission
            </p>
          </div>
          <Field label="Degree type" value={user.degreeType} />
          <Field label="Field of study" value={user.fieldOfStudy} />
          <Field label="Arrival" value={arrival || undefined} />
          <Field label="Admission status" value={user.admissionStatus} />
          <Field label="Applied" value={user.programApplied} />
          <Field label="Accepted" value={user.programAccepted} />

          <div className="col-span-full mt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
              <Plane className="w-3 h-3" /> Visa &amp; Immigration
            </p>
          </div>
          <Field label="EU citizen" value={user.isEuCitizen} />
          <Field label="Has visa" value={user.hasVisa} />
          <Field label="Visa type" value={user.visaType} />
          <Field label="Codice fiscale" value={user.hasCodiceFiscale} />
          <Field label="Residence permit" value={user.hasResidencePermit} />
          <Field label="Flight booked" value={user.flightBooked} />
          <Field label="Departure date" value={user.departureDate} />

          <div className="col-span-full mt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
              <Home className="w-3 h-3" /> Housing
            </p>
          </div>
          <Field label="Has housing" value={user.hasHousing} />
          <Field label="Preference" value={user.housingPreference} />
          <Field label="Budget" value={user.housingBudget} />
          <Field label="Move-in window" value={user.moveInWindow} />
          <Field label="Needs support" value={user.housingSupportNeeded} />

          <div className="col-span-full mt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3 h-3" /> Finance &amp; Banking
            </p>
          </div>
          <Field label="Monthly budget" value={user.monthlyBudgetRange} />
          <Field label="Funding source" value={user.fundingSource} />
          <Field label="Needs bank account" value={user.needsBankAccount} />
          <Field label="Has bank account" value={user.hasBankAccount} />
          <Field label="Travel insurance" value={user.hasTravelInsurance} />
          <Field label="Health insurance" value={user.hasHealthInsurance} />

          {user.buddyOptIn === 'yes' && (
            <>
              <div className="col-span-full mt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
                  <Heart className="w-3 h-3" /> Buddy System
                </p>
              </div>
              <Field label="Buddy status" value={user.buddyStatus} />
              <Field label="Looking for" value={(() => { try { return (JSON.parse(user.buddyLookingFor || '[]') as string[]).join(', ') } catch { return user.buddyLookingFor } })()} />
            </>
          )}

          {/* ── Relocation Plan ──────────────────────────────────────── */}
          {(() => {
            let plan: DashboardPlanItem[] = []
            try { plan = JSON.parse(user.dashboardPlan || '[]') } catch { /* ignore */ }
            if (!plan.length) return null
            const journey = plan.filter(m => m.stepNumber != null).sort((a, b) => (a.stepNumber ?? 999) - (b.stepNumber ?? 999))
            const tools   = plan.filter(m => m.stepNumber == null)
            return (
              <div className="col-span-full mt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
                  <Layers className="w-3 h-3" /> Relocation Plan ({plan.length} modules)
                </p>
                <div className="flex flex-wrap gap-2">
                  {journey.map((m) => (
                    <span
                      key={m.moduleId}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-indigo-700/50 bg-indigo-900/30 text-indigo-300"
                    >
                      <ModuleIcon name={m.icon} className="w-3 h-3" />
                      <span className="font-medium">{m.stepNumber}.</span>
                      {m.label}
                    </span>
                  ))}
                  {tools.map((m) => (
                    <span
                      key={m.moduleId}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-gray-700 bg-gray-800 text-gray-400"
                    >
                      <ModuleIcon name={m.icon} className="w-3 h-3" />
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            )
          })()}

          <div className="col-span-full mt-2 pt-3 border-t border-gray-800">
            {user.email && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                <Mail className="w-3 h-3 text-indigo-400" />
                <span className="text-indigo-300 font-medium">{user.email}</span>
              </p>
            )}
            <p className="text-xs text-gray-700">User ID: {user.userId}</p>
            {user.updatedAt && <p className="text-xs text-gray-700">Last updated: {new Date(user.updatedAt).toLocaleString()}</p>}
            <p className="text-xs text-gray-700">Steps completed: {user.lastCompletedStep ?? 0}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterUni, setFilterUni] = useState('all')
  const [filterNationality, setFilterNationality] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminUsers()
      setUsers(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const universities = useMemo(() => {
    const seen = new Set<string>()
    for (const u of users) if (u.destinationUniversity) seen.add(u.destinationUniversity)
    return Array.from(seen).sort()
  }, [users])

  const nationalities = useMemo(() => {
    const seen = new Set<string>()
    for (const u of users) if (u.nationality) seen.add(u.nationality)
    return Array.from(seen).sort()
  }, [users])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter((u) => {
      const matchSearch = !q ||
        (u.preferredName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.nationality || '').toLowerCase().includes(q) ||
        (u.destinationUniversity || '').toLowerCase().includes(q) ||
        (u.destinationCity || '').toLowerCase().includes(q) ||
        (u.fieldOfStudy || '').toLowerCase().includes(q) ||
        (u.admissionStatus || '').toLowerCase().includes(q)
      const matchUni = filterUni === 'all' || u.destinationUniversity === filterUni
      const matchNat = filterNationality === 'all' || u.nationality === filterNationality
      return matchSearch && matchUni && matchNat
    })
  }, [users, search, filterUni, filterNationality])

  if (loading) return <div className="flex items-center justify-center py-24"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>

  if (error) return (
    <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-5">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-300 font-medium">Failed to load users</p>
        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
        <button onClick={() => load()} className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Try again</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, nationality, university…"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
        {nationalities.length > 0 && (
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <select
              value={filterNationality}
              onChange={(e) => setFilterNationality(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-600 appearance-none"
            >
              <option value="all">All nationalities</option>
              {nationalities.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
        {universities.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <select
              value={filterUni}
              onChange={(e) => setFilterUni(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-600 appearance-none"
            >
              <option value="all">All universities</option>
              {universities.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        )}
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50 bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-2"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <p className="text-xs text-gray-600">
        {filtered.length} user{filtered.length !== 1 ? 's' : ''}{filtered.length !== users.length ? ` of ${users.length}` : ''}: click a row to expand
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="font-medium">No users found</p>
          {search && <p className="text-xs mt-1">Try adjusting your search.</p>}
        </div>
      ) : (
        <div className="space-y-2 pb-8">
          {filtered.map((u) => <UserRow key={u.userId} user={u} />)}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Buddy System
// ═══════════════════════════════════════════════════════════════════════════════

const LOOKING_FOR_LABELS: Record<string, string> = {
  flatmate: 'Flatmate',
  bureaucracy: 'Bureaucracy',
  study: 'Study partner',
  social: 'Friendship',
  career: 'Career',
  language: 'Language',
  sports: 'Sports',
  city: 'City guide',
}

function parseLookingFor(raw?: string): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function formatProgram(u: BuddyPoolUser): string {
  const parts = [u.degreeType, u.fieldOfStudy].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Unknown program'
}

function BuddyTab() {
  const [users, setUsers] = useState<BuddyPoolUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [matching, setMatching] = useState(false)
  const [matchMsg, setMatchMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminBuddyPool()
      setUsers(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load buddy pool')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const pending = users.filter((u) => u.buddyStatus === 'pending')
  const matched = users.filter((u) => u.buddyStatus === 'matched')

  function toggleSelect(userId: string) {
    setMatchMsg(null)
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : prev.length < 2
        ? [...prev, userId]
        : [prev[1], userId]
    )
  }

  async function handleMatch() {
    if (selected.length !== 2) return
    setMatching(true)
    setMatchMsg(null)
    try {
      await adminBuddyMatch(selected[0], selected[1])
      setMatchMsg({ ok: true, text: 'Matched successfully! Both users will now see each other\'s contact details.' })
      setSelected([])
      await load(true)
    } catch (e: unknown) {
      setMatchMsg({ ok: false, text: e instanceof Error ? e.message : 'Match failed' })
    } finally {
      setMatching(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>

  if (error) return (
    <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-5">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-300 font-medium">Failed to load buddy pool</p>
        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
        <button onClick={() => load()} className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Try again</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Heart className="w-5 h-5" />} label="In Pool" value={pending.length} sub="Awaiting a match" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Matched" value={matched.length} sub="Successfully paired" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Opt-ins" value={users.length} sub="All buddy sign-ups" />
      </div>

      {/* Match message */}
      {matchMsg && (
        <div className={`flex items-start gap-3 rounded-xl border p-4 ${
          matchMsg.ok ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300' : 'bg-red-950/40 border-red-700 text-red-300'
        }`}>
          {matchMsg.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <p className="text-sm">{matchMsg.text}</p>
        </div>
      )}

      {/* Manual match panel */}
      {pending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Pending: Select 2 to Match</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => load(true)} disabled={refreshing} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50">
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                onClick={handleMatch}
                disabled={selected.length !== 2 || matching}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                <Heart className="w-3.5 h-3.5" />
                {matching ? 'Matching…' : `Match${selected.length === 2 ? ` (${users.find(u => u.userId === selected[0])?.displayName} ↔ ${users.find(u => u.userId === selected[1])?.displayName})` : ''}`}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pending.map((u) => {
              const isSelected = selected.includes(u.userId)
              const lookingFor = parseLookingFor(u.lookingFor)
              return (
                <button
                  key={u.userId}
                  onClick={() => toggleSelect(u.userId)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-900/30 ring-1 ring-indigo-500'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{u.displayName}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{formatProgram(u)}</p>
                    </div>
                    {isSelected && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {lookingFor.slice(0, 3).map((id) => (
                      <span key={id} className="px-1.5 py-0.5 rounded bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs">
                        {LOOKING_FOR_LABELS[id] || id}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-0.5 text-xs text-gray-500">
                    {u.nationality && <p><Globe className="inline w-3 h-3 mr-1" />{u.nationality}</p>}
                    {u.phone && <p className="truncate"><span className="mr-1">📱</span>{u.phone}</p>}
                    {u.bio && <p className="truncate italic text-gray-600">"{u.bio}"</p>}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {pending.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <p className="font-medium">No users pending a match</p>
          <p className="text-xs mt-1">Users will appear here when they opt into the Buddy System.</p>
        </div>
      )}

      {matched.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Already Matched</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matched.map((u) => (
              <div key={u.userId} className="rounded-xl border border-gray-800 bg-gray-900 p-4 opacity-70">
                <p className="text-white font-semibold text-sm">{u.displayName}</p>
                <p className="text-gray-400 text-xs mt-0.5">{formatProgram(u)}</p>
                <p className="text-xs text-emerald-500 mt-2">
                  <CheckCircle2 className="inline w-3 h-3 mr-1" />
                  Matched with {users.find(u2 => u2.userId === u.buddyMatchedWithId)?.displayName || u.buddyMatchedWithId}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Email Templates
// ═══════════════════════════════════════════════════════════════════════════════

const TEMPLATE_VARS: Record<string, { name: string; description: string }[]> = {
  welcome: [
    { name: '{{preferredName}}',  description: "User's preferred name" },
    { name: '{{universityLine}}', description: 'Destination university (or "your destination")' },
    { name: '{{locationSuffix}}', description: 'e.g. " in Milan, Italy": empty if location unknown' },
    { name: '{{year}}',           description: 'Current calendar year' },
  ],
  deadline_reminder: [
    { name: '{{preferredName}}',   description: "User's preferred name" },
    { name: '{{deadlineTitle}}',   description: 'Title of the deadline' },
    { name: '{{dueDate}}',         description: 'Formatted due date, e.g. "Friday, 1 March 2026"' },
    { name: '{{daysUntil}}',       description: 'Number of days until the deadline (default 5)' },
    { name: '{{noteSection}}',     description: 'HTML block with deadline note: empty string if no note set' },
    { name: '{{year}}',            description: 'Current calendar year' },
  ],
}

function EmailsTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editHtml, setEditHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [testTo, setTestTo] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const [reminderSending, setReminderSending] = useState(false)
  const [reminderMsg, setReminderMsg] = useState<string | null>(null)

  async function loadTemplates(autoSelect = true) {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminEmailTemplates()
      setTemplates(data)
      if (autoSelect && data.length > 0 && !selected) {
        selectTemplate(data[0])
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  function selectTemplate(tpl: EmailTemplate) {
    setSelected(tpl.templateKey)
    setEditSubject(tpl.subject)
    setEditHtml(tpl.htmlBody)
    setSaveMsg(null)
    setPreview(false)
  }

  function resetToDefault() {
    const tpl = templates.find(t => t.templateKey === selected)
    if (!tpl) return
    setEditSubject(tpl.subject)
    setEditHtml(tpl.htmlBody)
    setSaveMsg(null)
  }

  async function sendTest() {
    if (!testTo) return
    setTestSending(true)
    setTestMsg(null)
    try {
      const year = String(new Date().getFullYear())
      const subst = (s: string) => s
        .replace(/\{\{preferredName\}\}/g, 'Alex')
        .replace(/\{\{universityLine\}\}/g, 'Bocconi University')
        .replace(/\{\{locationSuffix\}\}/g, ' in Milan, Italy')
        .replace(/\{\{deadlineTitle\}\}/g, 'Submit Housing Application')
        .replace(/\{\{dueDate\}\}/g, 'Friday, 1 March 2026')
        .replace(/\{\{daysUntil\}\}/g, '5')
        .replace(/\{\{noteSection\}\}/g, '<p style="margin:10px 0 0;color:#64748b;font-size:13px;"><strong>Note:</strong> Remember to attach proof of enrollment.</p>')
        .replace(/\{\{year\}\}/g, year)
      await sendTestEmail(testTo, { subject: subst(editSubject), html: subst(editHtml) })
      setTestMsg(`Test sent to ${testTo}`)
    } catch (e: unknown) {
      setTestMsg(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setTestSending(false)
    }
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const result = await updateAdminEmailTemplate(selected, { subject: editSubject, htmlBody: editHtml })
      setSaveMsg(`Saved at ${new Date(result.updatedAt).toLocaleTimeString()}`)
      await loadTemplates(false)
    } catch (e: unknown) {
      setSaveMsg(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => { loadTemplates() }, [])

  const activeTpl = templates.find(t => t.templateKey === selected)
  const vars = selected ? (TEMPLATE_VARS[selected] ?? []) : []

  async function sendReminders() {
    setReminderSending(true)
    setReminderMsg(null)
    try {
      const result = await sendDeadlineReminders(5)
      setReminderMsg(`Done: sent ${result.sent}, skipped ${result.skipped}, failed ${result.failed} (target date: ${result.targetDate})`)
    } catch (e: unknown) {
      setReminderMsg(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setReminderSending(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>

  if (error) return (
    <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-5">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-300 font-medium">Failed to load email templates</p>
        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
        <button onClick={() => loadTemplates()} className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Try again</button>
      </div>
    </div>
  )

  return (
    <div className="flex gap-6 items-start">
      {/* Left: template list */}
      <div className="w-56 flex-shrink-0 space-y-2">
        {templates.map((tpl) => (
          <button
            key={tpl.templateKey}
            onClick={() => selectTemplate(tpl)}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              selected === tpl.templateKey
                ? 'border-indigo-600 bg-indigo-950/30'
                : 'border-gray-800 bg-gray-900 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-white capitalize">{tpl.templateKey}</span>
            </div>
            <p className="text-xs text-gray-500 leading-snug">{tpl.description}</p>
            <p className="text-xs mt-2">
              {tpl.isDefault
                ? <span className="text-yellow-500">Built-in default</span>
                : <span className="text-emerald-400">Saved {tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleDateString() : ''}</span>
              }
            </p>
          </button>
        ))}
      </div>

      {/* Right: editor */}
      {activeTpl ? (
        <div className="flex-1 min-w-0 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white capitalize">{activeTpl.templateKey} email</h2>
              <p className="text-xs text-gray-500 mt-0.5">{activeTpl.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={resetToDefault}
                className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {saveMsg && (
            <p className={`text-xs ${saveMsg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{saveMsg}</p>
          )}

          {/* Send deadline reminders action (only for deadline_reminder template) */}
          {selected === 'deadline_reminder' && (
            <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Send reminders now</p>
                  <p className="text-xs text-amber-500/80 mt-0.5 leading-snug">Emails all users with a deadline 5 days from today and <code className="text-amber-300">sendReminder: true</code>. This is safe to run multiple times: only deadlines due exactly 5 days out are matched.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={sendReminders}
                  disabled={reminderSending}
                  className="flex items-center gap-1.5 text-xs bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <Send className="w-3.5 h-3.5" />
                  {reminderSending ? 'Sending…' : 'Send 5-day reminders'}
                </button>
                {reminderMsg && (
                  <p className={`text-xs ${reminderMsg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{reminderMsg}</p>
                )}
              </div>
            </div>
          )}

          {/* Send test email */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={testTo}
                onChange={(e) => { setTestTo(e.target.value); setTestMsg(null) }}
                placeholder="Send test to email address…"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors"
              />
              <button
                onClick={sendTest}
                disabled={!testTo || testSending}
                className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-40 text-gray-300 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                {testSending ? 'Sending…' : 'Send test'}
              </button>
            </div>
            {testMsg && (
              <p className={`text-xs ${testMsg.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{testMsg}</p>
            )}
          </div>

          {!preview ? (
            <>
              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Subject line</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-600 transition-colors"
                  placeholder="Email subject…"
                />
              </div>

              {/* Variables reference */}
              {vars.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-3">Available variables</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {vars.map((v) => (
                      <div key={v.name} className="flex items-start gap-2">
                        <code className="text-xs text-indigo-300 bg-indigo-950/50 border border-indigo-900 px-1.5 py-0.5 rounded font-mono whitespace-nowrap flex-shrink-0">{v.name}</code>
                        <span className="text-xs text-gray-500">{v.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HTML body */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">HTML body</label>
                <textarea
                  value={editHtml}
                  onChange={(e) => setEditHtml(e.target.value)}
                  rows={28}
                  spellCheck={false}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-xs text-gray-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-600 transition-colors resize-y"
                  placeholder="<!DOCTYPE html>…"
                />
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs text-gray-500 mb-3">Preview uses placeholder values for variables (Alex, Bocconi University, Milan).</p>
              <iframe
                srcDoc={editHtml
                  .replace(/\{\{preferredName\}\}/g, 'Alex')
                  .replace(/\{\{universityLine\}\}/g, 'Bocconi University')
                  .replace(/\{\{locationSuffix\}\}/g, ' in Milan, Italy')
                  .replace(/\{\{deadlineTitle\}\}/g, 'Submit Housing Application')
                  .replace(/\{\{dueDate\}\}/g, 'Friday, 1 March 2026')
                  .replace(/\{\{daysUntil\}\}/g, '5')
                  .replace(/\{\{noteSection\}\}/g, '<p style="margin:10px 0 0;color:#64748b;font-size:13px;"><strong>Note:</strong> Remember to attach proof of enrollment.</p>')
                  .replace(/\{\{year\}\}/g, String(new Date().getFullYear()))
                }
                sandbox=""
                title="Email preview"
                className="w-full rounded-xl border border-gray-700"
                style={{ height: 600 }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 text-center py-16 text-gray-600">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select a template to edit</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6 — Content Management
// ═══════════════════════════════════════════════════════════════════════════════

type ContentSubTab = 'destinations' | 'origins' | 'modules' | 'visualizer'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function ContentTab() {
  const [sub, setSub] = useState<ContentSubTab>('destinations')

  const [countries, setCountries] = useState<ContentCountry[]>([])
  const [cities, setCities] = useState<ContentCity[]>([])
  const [universities, setUniversities] = useState<ContentUniversity[]>([])
  const [modules, setModules] = useState<ContentModule[]>([])
  const [originCountries, setOriginCountries] = useState<ContentOriginCountry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [recalculatingPlans, setRecalculatingPlans] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [expandedCity, setExpandedCity] = useState<string | null>(null)
  const [showAddCountry, setShowAddCountry] = useState(false)
  const [newCountry, setNewCountry] = useState({ name: '', code: '', flagEmoji: '' })
  const [showAddCity, setShowAddCity] = useState<string | null>(null)
  const [newCity, setNewCity] = useState({ name: '' })
  const [showAddUni, setShowAddUni] = useState(false)
  const [newUni, setNewUni] = useState({ name: '', shortName: '', cityId: '' })
  const [showManageLocations, setShowManageLocations] = useState(false)
  const [showAddOrigin, setShowAddOrigin] = useState(false)
  const [newOrigin, setNewOrigin] = useState({ name: '', code: '' })

  const [showModuleForm, setShowModuleForm] = useState(false)
  const [editingModule, setEditingModule] = useState<ContentModule | null>(null)
  const [moduleForm, setModuleForm] = useState<Partial<ContentModule>>({
    label: '', icon: '', description: '', route: '', stepType: undefined, stepNumber: undefined,
    visibilityRules: {}, variants: [], active: true,
  })
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [newVariantDraft, setNewVariantDraft] = useState({
    label: '', contentNote: '',
    condition: { originEu: '', originCountry: '', degreeType: '', destinationCountry: '', destinationCity: '', universityId: '' },
  })
  const [modFilter, setModFilter] = useState('')
  const [previewRoute, setPreviewRoute] = useState<string | null>(null)

  const [vizSituation, setVizSituation] = useState<{
    destinationCountry: string
    destinationCity: string
    universityId: string
    originEu: string
    originCountry: string
    degreeType: string
  }>({ destinationCountry: '', destinationCity: '', universityId: '', originEu: '', originCountry: '', degreeType: '' })

  async function loadAll() {
    setLoading(true); setError(null)
    try {
      const [c, ci, u, m, oc] = await Promise.all([
        fetchAdminContentCountries(),
        fetchAdminContentCities(),
        fetchAdminContentUniversities(),
        fetchAdminContentModules(),
        fetchAdminContentOriginCountries(),
      ])
      setCountries(c); setCities(ci); setUniversities(u); setModules(m); setOriginCountries(oc)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load content')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function addCountry() {
    if (!newCountry.name || !newCountry.code) return
    setSaving(true)
    try {
      await createContentCountry({ name: newCountry.name, code: newCountry.code.toUpperCase(), flagEmoji: newCountry.flagEmoji || undefined, active: true })
      setNewCountry({ name: '', code: '', flagEmoji: '' }); setShowAddCountry(false)
      await loadAll(); setMsg({ ok: true, text: `Country "${newCountry.name}" added.` })
    } catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function removeCountry(countryId: string) {
    if (!confirm('Delete this country? Cities and universities under it will be orphaned.')) return
    setSaving(true)
    try { await deleteContentCountry(countryId); await loadAll(); setMsg({ ok: true, text: 'Country deleted.' }) }
    catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function addCity(countryId: string) {
    if (!newCity.name) return
    setSaving(true)
    try {
      await createContentCity({ name: newCity.name, countryId, active: true })
      setNewCity({ name: '' }); setShowAddCity(null)
      await loadAll(); setMsg({ ok: true, text: `City "${newCity.name}" added.` })
    } catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function removeCity(cityId: string) {
    if (!confirm('Delete this city? Universities under it will be orphaned.')) return
    setSaving(true)
    try { await deleteContentCity(cityId); await loadAll(); setMsg({ ok: true, text: 'City deleted.' }) }
    catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function addUniversity() {
    if (!newUni.name || !newUni.cityId) return
    const city = cities.find(c => c.cityId === newUni.cityId)
    if (!city) return
    setSaving(true)
    try {
      await createContentUniversity({ name: newUni.name, shortName: newUni.shortName || undefined, cityId: newUni.cityId, countryId: city.countryId, active: true })
      setNewUni({ name: '', shortName: '', cityId: '' }); setShowAddUni(false)
      await loadAll(); setMsg({ ok: true, text: `University "${newUni.name}" added.` })
    } catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function removeUniversity(universityId: string) {
    if (!confirm('Delete this university?')) return
    setSaving(true)
    try { await deleteContentUniversity(universityId); await loadAll(); setMsg({ ok: true, text: 'University deleted.' }) }
    catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function addOriginCountry() {
    if (!newOrigin.name || !newOrigin.code) return
    setSaving(true)
    try {
      await createContentOriginCountry({ name: newOrigin.name, code: newOrigin.code.toUpperCase(), active: true })
      setNewOrigin({ name: '', code: '' }); setShowAddOrigin(false)
      await loadAll(); setMsg({ ok: true, text: `Origin country "${newOrigin.name}" added.` })
    } catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function removeOriginCountry(originCountryId: string) {
    if (!confirm('Delete this origin country?')) return
    setSaving(true)
    try { await deleteContentOriginCountry(originCountryId); await loadAll(); setMsg({ ok: true, text: 'Origin country deleted.' }) }
    catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  function openAddModule() {
    setEditingModule(null)
    setModuleForm({ label: '', icon: '', description: '', route: '', stepType: undefined, stepNumber: undefined, visibilityRules: {}, variants: [], active: true })
    setShowVariantForm(false)
    setShowModuleForm(true)
  }

  function openEditModule(m: ContentModule) {
    setEditingModule(m)
    setModuleForm({ ...m, route: m.route ?? '', variants: m.variants ?? [] })
    setShowVariantForm(false)
    setShowModuleForm(true)
  }

  async function saveModule() {
    if (!moduleForm.label) return
    setSaving(true)
    try {
      if (editingModule) {
        await updateContentModule(editingModule.moduleId, moduleForm)
      } else {
        const id = slugify(moduleForm.label!)
        await createContentModule({ moduleId: id, label: moduleForm.label!, icon: moduleForm.icon, description: moduleForm.description, stepType: moduleForm.stepType, stepNumber: moduleForm.stepNumber, visibilityRules: moduleForm.visibilityRules ?? {}, variants: moduleForm.variants ?? [], active: moduleForm.active ?? true } as Omit<ContentModule, 'createdAt'>)
      }
      setShowModuleForm(false)
      await loadAll()
      setMsg({ ok: true, text: `Module "${moduleForm.label}" ${editingModule ? 'updated' : 'created'}.` })
    } catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function removeModule(moduleId: string) {
    if (!confirm('Delete this module?')) return
    setSaving(true)
    try { await deleteContentModule(moduleId); await loadAll(); setMsg({ ok: true, text: 'Module deleted.' }) }
    catch (e: unknown) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }) }
    finally { setSaving(false) }
  }

  async function pushModulesToExistingUsers() {
    if (!confirm('Recalculate dashboard plans for all existing users now?')) return
    setRecalculatingPlans(true)
    try {
      const result = await recalculateDashboardPlans()
      setMsg({ ok: true, text: `Plans refreshed: ${result.updatedUsers} users updated (${result.modulesEvaluated} modules evaluated).` })
    } catch (e: unknown) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed to recalculate user plans.' })
    } finally {
      setRecalculatingPlans(false)
    }
  }

  const filteredModules = useMemo(() => {
    if (!modFilter.trim()) return modules
    const q = modFilter.toLowerCase()
    return modules.filter(m =>
      m.label.toLowerCase().includes(q) || m.moduleId.toLowerCase().includes(q) ||
      (m.visibilityRules?.destinationCountry || '').toLowerCase().includes(q) ||
      (m.visibilityRules?.destinationCity || '').toLowerCase().includes(q)
    )
  }, [modules, modFilter])

  const vizModules = useMemo(() => {
    const matchField = (ruleVal: string | boolean | undefined, situationVal: string | boolean | undefined): boolean => {
      if (ruleVal === undefined || ruleVal === null || ruleVal === '') return true
      if (situationVal === undefined || situationVal === null || situationVal === '') return true
      return ruleVal === situationVal
    }
    const sit = {
      destinationCountry: vizSituation.destinationCountry || undefined,
      destinationCity:    vizSituation.destinationCity || undefined,
      universityId:       vizSituation.universityId || undefined,
      originEu:           vizSituation.originEu === '' ? undefined : vizSituation.originEu === 'true',
      originCountry:      vizSituation.originCountry || undefined,
      degreeType:         vizSituation.degreeType || undefined,
    }
    return modules
      .filter(m => {
        if (m.active === false) return false
        const r = m.visibilityRules ?? {}
        return (
          matchField(r.destinationCountry, sit.destinationCountry) &&
          matchField(r.destinationCity,    sit.destinationCity) &&
          matchField(r.universityId,       sit.universityId) &&
          matchField(r.originEu,           sit.originEu) &&
          matchField(r.originCountry,      sit.originCountry) &&
          matchField(r.degreeType,         sit.degreeType)
        )
      })
      .sort((a, b) => (a.stepNumber ?? 999) - (b.stepNumber ?? 999))
  }, [modules, vizSituation])

  function getActiveVariant(m: ContentModule): ContentVariant | null {
    if (!m.variants?.length) return null
    const strictMatch = (ruleVal: boolean | string | undefined, sitVal: string): boolean => {
      if (ruleVal === undefined) return true      // wildcard — condition doesn't care
      if (!sitVal) return false                   // situation not set → variant doesn't fire
      if (typeof ruleVal === 'boolean') return ruleVal === (sitVal === 'true')
      return ruleVal === sitVal
    }
    return m.variants.find(v => {
      const c = v.condition
      return (
        strictMatch(c.originEu,            vizSituation.originEu) &&
        strictMatch(c.originCountry,       vizSituation.originCountry) &&
        strictMatch(c.degreeType,          vizSituation.degreeType) &&
        strictMatch(c.destinationCountry,  vizSituation.destinationCountry) &&
        strictMatch(c.destinationCity,     vizSituation.destinationCity) &&
        strictMatch(c.universityId,        vizSituation.universityId)
      )
    }) ?? null
  }

  if (loading) return <div className="flex items-center justify-center py-24"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>

  if (error) return (
    <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-5">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-300 font-medium">Failed to load content data</p>
        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
        <p className="text-gray-500 text-xs mt-2">The content tables will be available after the next Amplify deploy.</p>
        <button onClick={loadAll} className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Try again</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Sub-nav */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(['destinations', 'origins', 'modules', 'visualizer'] as ContentSubTab[]).map((s) => (
          <button key={s} onClick={() => setSub(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sub === s ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {s === 'destinations'
              ? <><Globe className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />Destinations</>
              : s === 'origins'
              ? <><UserPlus className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />Origin Countries</>
              : s === 'modules'
              ? <><Layers className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />Modules</>
              : <><Eye className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />Visualizer</>
            }
          </button>
        ))}
      </div>

      {/* Toast */}
      {msg && (
        <div className={`flex items-start gap-3 rounded-xl border p-3 ${
          msg.ok ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300' : 'bg-red-950/40 border-red-700 text-red-300'
        }`}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <p className="text-sm flex-1">{msg.text}</p>
          <button onClick={() => setMsg(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── DESTINATIONS ────────────────────────────────────────────────────── */}
      {sub === 'destinations' && (
        <div className="space-y-4">

          {/* ── Universities (primary) ──────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Universities ({universities.length})</h2>
            <button onClick={() => setShowAddUni(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add University
            </button>
          </div>

          {showAddUni && (
            <div className="bg-gray-900 border border-indigo-700/50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">New University</p>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Full name (e.g. Università Bocconi)" value={newUni.name} onChange={e => setNewUni(v => ({ ...v, name: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                <input placeholder="Short name (e.g. Bocconi)" value={newUni.shortName} onChange={e => setNewUni(v => ({ ...v, shortName: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
              </div>
              <select value={newUni.cityId} onChange={e => setNewUni(v => ({ ...v, cityId: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                <option value="">Select city…</option>
                {cities.map(c => {
                  const country = countries.find(co => co.countryId === c.countryId)
                  return <option key={c.cityId} value={c.cityId}>{c.name}{country ? ` (${country.flagEmoji || country.code})` : ''}</option>
                })}
              </select>
              <div className="flex gap-2">
                <button onClick={addUniversity} disabled={saving || !newUni.name || !newUni.cityId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setShowAddUni(false)} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {universities.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <GraduationCap className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No universities yet</p>
              <p className="text-xs mt-1">Add a city first, then add universities to it.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {universities.map(u => {
                const city = cities.find(c => c.cityId === u.cityId)
                const country = countries.find(c => c.countryId === u.countryId)
                return (
                  <div key={u.universityId} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-gray-700 transition-colors group">
                    <GraduationCap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{u.name}</p>
                      {u.shortName && <p className="text-gray-500 text-xs">{u.shortName}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {city && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-900/30 border border-purple-700/50 text-purple-300 text-xs">
                          <Map className="w-3 h-3" />{city.name}
                        </span>
                      )}
                      {country && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-900/30 border border-blue-700/50 text-blue-300 text-xs">
                          {country.flagEmoji} {country.code}
                        </span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${
                        u.active ? 'border-emerald-700 text-emerald-400 bg-emerald-900/20' : 'border-gray-700 text-gray-500'
                      }`}>{u.active ? 'active' : 'inactive'}</span>
                    </div>
                    <button onClick={() => removeUniversity(u.universityId)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Manage Cities & Countries (secondary, collapsible) ───────────── */}
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowManageLocations(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-900/50 transition-colors">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Manage Cities &amp; Countries
                <span className="ml-2 font-normal normal-case text-gray-600">
                  {countries.length} countr{countries.length === 1 ? 'y' : 'ies'} · {cities.length} cit{cities.length === 1 ? 'y' : 'ies'}
                </span>
              </span>
              {showManageLocations ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>

            {showManageLocations && (
              <div className="border-t border-gray-800 p-4 space-y-4">

                {/* ── Countries ─────────────────────────────────────────────── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Countries</p>
                    <button onClick={() => setShowAddCountry(v => !v)}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Plus className="w-3 h-3" /> Add Country
                    </button>
                  </div>

                  {showAddCountry && (
                    <div className="bg-gray-950 border border-indigo-700/40 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Name (e.g. Italy)" value={newCountry.name} onChange={e => setNewCountry(v => ({ ...v, name: e.target.value }))}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                        <input placeholder="ISO (e.g. IT)" value={newCountry.code} onChange={e => setNewCountry(v => ({ ...v, code: e.target.value }))} maxLength={2}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                        <input placeholder="Flag emoji 🇮🇹" value={newCountry.flagEmoji} onChange={e => setNewCountry(v => ({ ...v, flagEmoji: e.target.value }))}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addCountry} disabled={saving || !newCountry.name || !newCountry.code}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => setShowAddCountry(false)} className="px-2 py-1 text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}

                  {countries.map(country => {
                    const isExp = expandedCountry === country.countryId
                    return (
                      <div key={country.countryId} className="rounded-lg border border-gray-800 bg-gray-950 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2">
                          <button onClick={() => setExpandedCountry(isExp ? null : country.countryId)}
                            className="flex-1 flex items-center gap-2 text-left">
                            <span>{country.flagEmoji || '🏳️'}</span>
                            <span className="text-sm text-white font-medium">{country.name}</span>
                            <span className="text-xs text-gray-600">{country.code}</span>
                            <span className="ml-auto text-gray-600">{isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</span>
                          </button>
                          <button onClick={() => removeCountry(country.countryId)}
                            className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {isExp && (
                          <div className="border-t border-gray-800 pl-6 pr-3 py-2 space-y-1.5">
                            <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Cities</p>
                            {cities.filter(c => c.countryId === country.countryId).map(city => (
                              <div key={city.cityId} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-800/50 group">
                                <div className="flex items-center gap-2">
                                  <Map className="w-3 h-3 text-gray-600" />
                                  <span className="text-xs text-white">{city.name}</span>
                                  <span className="text-xs text-gray-600">{universities.filter(u => u.cityId === city.cityId).length} unis</span>
                                </div>
                                <button onClick={() => removeCity(city.cityId)}
                                  className="p-1 rounded text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-colors">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <div className="pt-1">
                              {showAddCity !== country.countryId ? (
                                <button onClick={() => setShowAddCity(country.countryId)}
                                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                  <Plus className="w-3 h-3" /> Add City
                                </button>
                              ) : (
                                <div className="flex gap-2">
                                  <input placeholder="City name" value={newCity.name} onChange={e => setNewCity({ name: e.target.value })}
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                                  <button onClick={() => addCity(country.countryId)} disabled={saving || !newCity.name}
                                    className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold">Save</button>
                                  <button onClick={() => setShowAddCity(null)} className="text-xs text-gray-500 hover:text-white">✕</button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ORIGIN COUNTRIES ─────────────────────────────────────────────────── */}
      {sub === 'origins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Origin Countries ({originCountries.length})</h2>
              <p className="text-xs text-gray-500 mt-0.5">Countries students are coming FROM. Used as a module visibility filter.</p>
            </div>
            <button onClick={() => setShowAddOrigin(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Country
            </button>
          </div>

          {showAddOrigin && (
            <div className="bg-gray-900 border border-indigo-700/50 rounded-xl p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Country name *</label>
                <input placeholder="e.g. China" value={newOrigin.name} onChange={e => setNewOrigin(v => ({ ...v, name: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 w-44" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ISO code *</label>
                <input placeholder="e.g. CN" value={newOrigin.code} onChange={e => setNewOrigin(v => ({ ...v, code: e.target.value }))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 w-24 uppercase" maxLength={2} />
              </div>
              <div className="flex gap-2">
                <button onClick={addOriginCountry} disabled={saving || !newOrigin.name || !newOrigin.code}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold">Save</button>
                <button onClick={() => setShowAddOrigin(false)} className="text-xs text-gray-500 hover:text-white px-2">Cancel</button>
              </div>
            </div>
          )}

          {originCountries.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <Globe className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No origin countries yet</p>
              <p className="text-xs mt-1">Add countries to use as module visibility filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {originCountries.map(oc => (
                <div key={oc.originCountryId} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-white text-sm font-medium">{oc.name}</span>
                    <span className="text-xs text-gray-500 font-mono bg-gray-800 px-1.5 py-0.5 rounded">{oc.code}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${(oc.active ?? true) ? 'border-emerald-700 text-emerald-400 bg-emerald-900/20' : 'border-gray-700 text-gray-500'}`}>
                      {(oc.active ?? true) ? 'active' : 'inactive'}
                    </span>
                  </div>
                  <button onClick={() => removeOriginCountry(oc.originCountryId)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODULES ──────────────────────────────────────────────────────────── */}
      {sub === 'modules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Dashboard Modules ({modules.length})</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={pushModulesToExistingUsers}
                disabled={recalculatingPlans}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                title="Recalculate and store dashboard plans for all existing users"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recalculatingPlans ? 'animate-spin' : ''}`} /> Push to Existing Users
              </button>
              <button onClick={openAddModule}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Module
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input type="text" value={modFilter} onChange={e => setModFilter(e.target.value)}
              placeholder="Filter by label, ID, country, city…"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors" />
          </div>

          {showModuleForm && (
            <div className="bg-gray-900 border border-indigo-700/50 rounded-xl p-5 space-y-4">
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">
                {editingModule ? `Edit: ${editingModule.label}` : 'New Module'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Label *</label>
                  <input placeholder="e.g. Student Visa" value={moduleForm.label || ''} onChange={e => setModuleForm(v => ({ ...v, label: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Icon</label>
                  <select value={moduleForm.icon || ''} onChange={e => setModuleForm(v => ({ ...v, icon: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                    <option value="">None</option>
                    {ICON_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <input placeholder="Short description shown to users" value={moduleForm.description || ''} onChange={e => setModuleForm(v => ({ ...v, description: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Route</label>
                  <input placeholder="/dashboard/banking-italy" value={moduleForm.route || ''} onChange={e => setModuleForm(v => ({ ...v, route: e.target.value || undefined }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-indigo-600" />
                  <p className="text-xs text-gray-600 mt-1">Dashboard path this module links to: enables page preview in Visualizer.</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Step Type</label>
                  <select value={moduleForm.stepType ?? ''} onChange={e => setModuleForm(v => ({ ...v, stepType: (e.target.value as StepType) || undefined }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                    <option value="">unset</option>
                    <option value="journey">Journey: numbered step in student journey</option>
                    <option value="info">Info: reference / resource page</option>
                    <option value="tool">Tool: interactive tool (calculator, map…)</option>
                  </select>
                  {moduleForm.stepType && (
                    <p className="text-xs text-gray-600 mt-1">{STEP_TYPE_META[moduleForm.stepType].desc}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Step number</label>
                  <input type="number" placeholder="e.g. 3" value={moduleForm.stepNumber ?? ''} onChange={e => setModuleForm(v => ({ ...v, stepNumber: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <select value={moduleForm.active ? 'true' : 'false'} onChange={e => setModuleForm(v => ({ ...v, active: e.target.value === 'true' }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Visibility Rules <span className="text-gray-600 font-normal normal-case">(leave blank = show to everyone)</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Destination Country</label>
                    <select value={moduleForm.visibilityRules?.destinationCountry ?? ''}
                      onChange={e => setModuleForm(v => ({ ...v, visibilityRules: { ...v.visibilityRules, destinationCountry: e.target.value || undefined } }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                      <option value="">Any country</option>
                      {countries.map(c => <option key={c.countryId} value={c.countryId}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Destination City</label>
                    <select value={moduleForm.visibilityRules?.destinationCity ?? ''}
                      onChange={e => setModuleForm(v => ({ ...v, visibilityRules: { ...v.visibilityRules, destinationCity: e.target.value || undefined } }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                      <option value="">Any city</option>
                      {cities
                        .filter(c => !moduleForm.visibilityRules?.destinationCountry || c.countryId === moduleForm.visibilityRules.destinationCountry)
                        .map(c => <option key={c.cityId} value={c.cityId}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">University</label>
                    <select value={moduleForm.visibilityRules?.universityId ?? ''}
                      onChange={e => setModuleForm(v => ({ ...v, visibilityRules: { ...v.visibilityRules, universityId: e.target.value || undefined } }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                      <option value="">Any university</option>
                      {universities
                        .filter(u => !moduleForm.visibilityRules?.destinationCity || u.cityId === moduleForm.visibilityRules.destinationCity)
                        .map(u => <option key={u.universityId} value={u.universityId}>{u.shortName || u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Origin EU</label>
                    <select
                      value={moduleForm.visibilityRules?.originEu === undefined ? '' : String(moduleForm.visibilityRules.originEu)}
                      onChange={e => setModuleForm(v => ({ ...v, visibilityRules: { ...v.visibilityRules, originEu: e.target.value === '' ? undefined : e.target.value === 'true' } }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                      <option value="">Any</option>
                      <option value="true">EU only</option>
                      <option value="false">Non-EU only</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Origin Country</label>
                    <select value={moduleForm.visibilityRules?.originCountry ?? ''}
                      onChange={e => setModuleForm(v => ({ ...v, visibilityRules: { ...v.visibilityRules, originCountry: e.target.value || undefined } }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                      <option value="">Any origin</option>
                      {originCountries.map(oc => <option key={oc.originCountryId} value={oc.originCountryId}>{oc.name} ({oc.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Degree Type</label>
                    <select value={moduleForm.visibilityRules?.degreeType ?? ''}
                      onChange={e => setModuleForm(v => ({ ...v, visibilityRules: { ...v.visibilityRules, degreeType: e.target.value || undefined } }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                      <option value="">Any</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="master">Master</option>
                      <option value="phd">PhD</option>
                      <option value="exchange">Exchange</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Content Variants ── */}
              <div className="border-t border-gray-800 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Content Variants</p>
                <p className="text-xs text-gray-600 mb-3">Define different content notes for specific user situations. The first matching variant wins; unset condition fields act as wildcards.</p>

                {/* Existing variants */}
                {(moduleForm.variants ?? []).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {(moduleForm.variants ?? []).map((v, idx) => (
                      <div key={v.variantId} className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">{v.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5 whitespace-pre-wrap">{v.contentNote}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {v.condition.originEu !== undefined && <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">{v.condition.originEu ? 'EU' : 'Non-EU'}</span>}
                            {v.condition.originCountry && <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">from: {v.condition.originCountry}</span>}
                            {v.condition.degreeType && <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">{v.condition.degreeType}</span>}
                            {v.condition.destinationCountry && <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">to: {v.condition.destinationCountry}</span>}
                            {v.condition.destinationCity && <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">city: {v.condition.destinationCity}</span>}
                            {v.condition.universityId && <span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">uni: {v.condition.universityId}</span>}
                          </div>
                        </div>
                        <button onClick={() => setModuleForm(f => ({ ...f, variants: (f.variants ?? []).filter((_, i) => i !== idx) }))}
                          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add variant toggle */}
                {!showVariantForm ? (
                  <button onClick={() => setShowVariantForm(true)} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                ) : (
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-300">New Variant</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Label *</label>
                        <input placeholder="e.g. Non-EU from China" value={newVariantDraft.label}
                          onChange={e => setNewVariantDraft(d => ({ ...d, label: e.target.value }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Content Note *</label>
                        <textarea rows={2} placeholder="What content is shown for this situation…" value={newVariantDraft.contentNote}
                          onChange={e => setNewVariantDraft(d => ({ ...d, contentNote: e.target.value }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 resize-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Origin EU</label>
                        <select value={newVariantDraft.condition.originEu}
                          onChange={e => setNewVariantDraft(d => ({ ...d, condition: { ...d.condition, originEu: e.target.value } }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                          <option value="">Any</option>
                          <option value="true">EU</option>
                          <option value="false">Non-EU</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Origin Country</label>
                        <select value={newVariantDraft.condition.originCountry}
                          onChange={e => setNewVariantDraft(d => ({ ...d, condition: { ...d.condition, originCountry: e.target.value } }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                          <option value="">Any</option>
                          {originCountries.map(oc => <option key={oc.originCountryId} value={oc.originCountryId}>{oc.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Degree Type</label>
                        <select value={newVariantDraft.condition.degreeType}
                          onChange={e => setNewVariantDraft(d => ({ ...d, condition: { ...d.condition, degreeType: e.target.value } }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                          <option value="">Any</option>
                          <option value="bachelor">Bachelor</option>
                          <option value="master">Master</option>
                          <option value="phd">PhD</option>
                          <option value="exchange">Exchange</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Destination Country</label>
                        <select value={newVariantDraft.condition.destinationCountry}
                          onChange={e => setNewVariantDraft(d => ({ ...d, condition: { ...d.condition, destinationCountry: e.target.value } }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                          <option value="">Any</option>
                          {countries.map(c => <option key={c.countryId} value={c.countryId}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Destination City</label>
                        <select value={newVariantDraft.condition.destinationCity}
                          onChange={e => setNewVariantDraft(d => ({ ...d, condition: { ...d.condition, destinationCity: e.target.value } }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                          <option value="">Any</option>
                          {cities.map(c => <option key={c.cityId} value={c.cityId}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">University</label>
                        <select value={newVariantDraft.condition.universityId}
                          onChange={e => setNewVariantDraft(d => ({ ...d, condition: { ...d.condition, universityId: e.target.value } }))}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                          <option value="">Any</option>
                          {universities.map(u => <option key={u.universityId} value={u.universityId}>{u.shortName || u.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        disabled={!newVariantDraft.label || !newVariantDraft.contentNote}
                        onClick={() => {
                          const c = newVariantDraft.condition
                          const newVariant: ContentVariant = {
                            variantId: crypto.randomUUID(),
                            label: newVariantDraft.label,
                            contentNote: newVariantDraft.contentNote,
                            condition: {
                              originEu: c.originEu === '' ? undefined : c.originEu === 'true',
                              originCountry: c.originCountry || undefined,
                              degreeType: c.degreeType || undefined,
                              destinationCountry: c.destinationCountry || undefined,
                              destinationCity: c.destinationCity || undefined,
                              universityId: c.universityId || undefined,
                            },
                          }
                          setModuleForm(f => ({ ...f, variants: [...(f.variants ?? []), newVariant] }))
                          setNewVariantDraft({ label: '', contentNote: '', condition: { originEu: '', originCountry: '', degreeType: '', destinationCountry: '', destinationCity: '', universityId: '' } })
                          setShowVariantForm(false)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
                        Add Variant
                      </button>
                      <button onClick={() => setShowVariantForm(false)} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={saveModule} disabled={saving || !moduleForm.label}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
                  <Save className="w-3.5 h-3.5" /> {editingModule ? 'Update Module' : 'Create Module'}
                </button>
                <button onClick={() => setShowModuleForm(false)} className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {filteredModules.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Database className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{modules.length === 0 ? 'No modules yet' : 'No results'}</p>
              <p className="text-xs mt-1">
                {modules.length === 0 ? 'Modules define dashboard steps for specific user situations.' : 'Try adjusting your filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-8">
              {filteredModules.map(m => {
                const rules = m.visibilityRules ?? {}
                const country = countries.find(c => c.countryId === rules.destinationCountry)
                const city = cities.find(c => c.cityId === rules.destinationCity)
                const uni = universities.find(u => u.universityId === rules.universityId)
                return (
                  <div key={m.moduleId} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-gray-600 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {m.icon && <ModuleIcon name={m.icon} className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                        <span className="text-white font-semibold text-sm">{m.label}</span>
                        {m.stepNumber != null && <span className="text-xs text-gray-600">#{m.stepNumber}</span>}
                        <StepTypeBadge type={m.stepType} />
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${
                          (m.active ?? true) ? 'border-emerald-700 text-emerald-400 bg-emerald-900/20' : 'border-gray-700 text-gray-500'
                        }`}>{(m.active ?? true) ? 'active' : 'inactive'}</span>
                      </div>
                      {m.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{m.description}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {country && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-900/30 border border-blue-700/50 text-blue-300 text-xs"><Globe className="w-3 h-3" />{country.name}</span>}
                        {city && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-900/30 border border-purple-700/50 text-purple-300 text-xs"><Map className="w-3 h-3" />{city.name}</span>}
                        {uni && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-900/30 border border-indigo-700/50 text-indigo-300 text-xs"><GraduationCap className="w-3 h-3" />{uni.shortName || uni.name}</span>}
                        {rules.originEu === true && <span className="px-1.5 py-0.5 rounded-md bg-green-900/30 border border-green-700/50 text-green-300 text-xs">EU only</span>}
                        {rules.originEu === false && <span className="px-1.5 py-0.5 rounded-md bg-orange-900/30 border border-orange-700/50 text-orange-300 text-xs">Non-EU only</span>}
                        {rules.originCountry && (() => { const oc = originCountries.find(o => o.originCountryId === rules.originCountry); return oc ? <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-900/30 border border-teal-700/50 text-teal-300 text-xs"><Globe className="w-3 h-3" />From: {oc.name}</span> : null })()}
                        {rules.degreeType && <span className="px-1.5 py-0.5 rounded-md bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 text-xs capitalize">{rules.degreeType}</span>}
                        {!country && !city && !uni && rules.originEu === undefined && !rules.degreeType && (
                          <span className="text-xs text-gray-600 italic">shown to all users</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModule(m)} className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/20 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeModule(m.moduleId)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-700 font-mono hidden lg:block">{m.moduleId}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── VISUALIZER ───────────────────────────────────────────────────────── */}
      {sub === 'visualizer' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Module Visualizer</h2>
            <p className="text-xs text-gray-500 mt-0.5">Set a user's situation to preview which modules they would see and in what order.</p>
          </div>

          {/* Legend */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">How modules work: 3 layers</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                <p className="font-semibold text-white mb-1">Layer 1: Visibility Rules</p>
                <p className="text-gray-400">Decides <strong>whether</strong> a module appears for this user at all. Filters by destination, origin, EU status, degree type.</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                <p className="font-semibold text-white mb-1">Layer 2: Step Type</p>
                <div className="space-y-1 mt-1.5">
                  {(Object.keys(STEP_TYPE_META) as StepType[]).map(t => (
                    <div key={t} className="flex items-center gap-1.5">
                      <StepTypeBadge type={t} />
                      <span className="text-gray-400">{STEP_TYPE_META[t].desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                <p className="font-semibold text-white mb-1">Layer 3: Content Variants</p>
                <p className="text-gray-400">The first matching variant determines <strong>what content</strong> is shown inside the step. Unset fields act as wildcards.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* ── Inputs ── */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">User Situation</p>
                <button onClick={() => setVizSituation({ destinationCountry: '', destinationCity: '', universityId: '', originEu: '', originCountry: '', degreeType: '' })}
                  className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Destination Country</label>
                  <select value={vizSituation.destinationCountry}
                    onChange={e => setVizSituation(v => ({ ...v, destinationCountry: e.target.value, destinationCity: '', universityId: '' }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                    <option value="">Any / not set</option>
                    {countries.map(c => <option key={c.countryId} value={c.countryId}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Destination City</label>
                  <select value={vizSituation.destinationCity}
                    onChange={e => setVizSituation(v => ({ ...v, destinationCity: e.target.value, universityId: '' }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                    <option value="">Any / not set</option>
                    {cities
                      .filter(c => !vizSituation.destinationCountry || c.countryId === vizSituation.destinationCountry)
                      .map(c => <option key={c.cityId} value={c.cityId}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">University</label>
                  <select value={vizSituation.universityId}
                    onChange={e => setVizSituation(v => ({ ...v, universityId: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                    <option value="">Any / not set</option>
                    {universities
                      .filter(u => (!vizSituation.destinationCity || u.cityId === vizSituation.destinationCity) &&
                                   (!vizSituation.destinationCountry || u.countryId === vizSituation.destinationCountry))
                      .map(u => <option key={u.universityId} value={u.universityId}>{u.shortName || u.name}</option>)}
                  </select>
                </div>

                <div className="border-t border-gray-800 pt-3">
                  <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Student background</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">EU Citizen</label>
                      <select value={vizSituation.originEu}
                        onChange={e => setVizSituation(v => ({ ...v, originEu: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                        <option value="">Any / not set</option>
                        <option value="true">EU citizen</option>
                        <option value="false">Non-EU citizen</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Origin Country</label>
                      <select value={vizSituation.originCountry}
                        onChange={e => setVizSituation(v => ({ ...v, originCountry: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                        <option value="">Any / not set</option>
                        {originCountries.map(oc => <option key={oc.originCountryId} value={oc.originCountryId}>{oc.name} ({oc.code})</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Degree Type</label>
                      <select value={vizSituation.degreeType}
                        onChange={e => setVizSituation(v => ({ ...v, degreeType: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600">
                        <option value="">Any / not set</option>
                        <option value="bachelor">Bachelor</option>
                        <option value="master">Master</option>
                        <option value="phd">PhD</option>
                        <option value="exchange">Exchange</option>
                      </select>
                    </div>

                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {Object.values(vizSituation).some(v => v !== '') && (
                <div className="border-t border-gray-800 pt-3 flex flex-wrap gap-1.5">
                  {vizSituation.destinationCountry && (() => { const c = countries.find(x => x.countryId === vizSituation.destinationCountry); return c ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs"><Globe className="w-3 h-3" />{c.name}</span> : null })()}
                  {vizSituation.destinationCity && (() => { const c = cities.find(x => x.cityId === vizSituation.destinationCity); return c ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs"><Map className="w-3 h-3" />{c.name}</span> : null })()}
                  {vizSituation.universityId && (() => { const u = universities.find(x => x.universityId === vizSituation.universityId); return u ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs"><GraduationCap className="w-3 h-3" />{u.shortName || u.name}</span> : null })()}
                  {vizSituation.originEu === 'true' && <span className="px-2 py-0.5 rounded-full bg-green-900/40 border border-green-700/50 text-green-300 text-xs">EU citizen</span>}
                  {vizSituation.originEu === 'false' && <span className="px-2 py-0.5 rounded-full bg-orange-900/40 border border-orange-700/50 text-orange-300 text-xs">Non-EU citizen</span>}
                  {vizSituation.originCountry && (() => { const oc = originCountries.find(x => x.originCountryId === vizSituation.originCountry); return oc ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-900/40 border border-teal-700/50 text-teal-300 text-xs"><Globe className="w-3 h-3" />From {oc.name}</span> : null })()}
                  {vizSituation.degreeType && <span className="px-2 py-0.5 rounded-full bg-yellow-900/40 border border-yellow-700/50 text-yellow-300 text-xs capitalize">{vizSituation.degreeType}</span>}

                </div>
              )}
            </div>

            {/* ── Preview ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Dashboard Preview</p>
                <span className="text-xs text-gray-500">
                  {vizModules.length} of {modules.filter(m => m.active !== false).length} active modules shown
                </span>
              </div>

              {vizModules.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-600">
                  <EyeOff className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No modules match</p>
                  <p className="text-xs mt-1">Try loosening the situation filters.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const numbered = vizModules.filter(m => m.stepNumber != null)
                    const info     = vizModules.filter(m => m.stepNumber == null)
                    return (
                      <>
                        {numbered.length > 0 && (
                          <>
                            <p className="text-xs text-gray-600 uppercase tracking-widest px-1 pt-1">Steps</p>
                            {numbered.map((m, idx) => {
                              const activeVariant = getActiveVariant(m)
                              const variantCount = m.variants?.length ?? 0
                              return (
                              <div key={m.moduleId} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-900/40 border border-indigo-700/40 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold text-sm mt-0.5">
                                  {idx + 1}
                                </div>
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 flex-shrink-0 text-gray-400 mt-0.5">
                                  <ModuleIcon name={m.icon} className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-white text-sm font-semibold">{m.label}</p>
                                    <StepTypeBadge type={m.stepType} />
                                    <span className="text-xs text-gray-700 font-mono">#{m.stepNumber}</span>
                                  </div>
                                  {m.description && <p className="text-xs text-gray-500 truncate mt-0.5">{m.description}</p>}
                                  {variantCount > 0 && (
                                    <div className={`mt-1.5 rounded-md px-2.5 py-1.5 text-xs border ${activeVariant
                                      ? 'bg-indigo-950/50 border-indigo-700/50 text-indigo-300'
                                      : 'bg-gray-800/60 border-gray-700 text-gray-500'}`}>
                                      {activeVariant
                                        ? <><span className="font-semibold">Variant active:</span> {activeVariant.label}: {activeVariant.contentNote}</>
                                        : <>Default content ({variantCount} variant{variantCount !== 1 ? 's' : ''} not triggered)</>}
                                    </div>
                                  )}
                                  {m.route && (
                                    <button onClick={() => setPreviewRoute(m.route!)} className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                      <Eye className="w-3 h-3" /> Preview page
                                    </button>
                                  )}
                                </div>
                              </div>
                            )})}

                          </>
                        )}
                        {info.length > 0 && (
                          <>
                            <p className="text-xs text-gray-600 uppercase tracking-widest px-1 pt-2">Info pages</p>
                            {info.map(m => {
                              const activeVariant = getActiveVariant(m)
                              const variantCount = m.variants?.length ?? 0
                              return (
                              <div key={m.moduleId} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-start gap-3">
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800 flex-shrink-0 text-gray-400 mt-0.5">
                                  <ModuleIcon name={m.icon} className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-white text-sm font-semibold">{m.label}</p>
                                    <StepTypeBadge type={m.stepType} />
                                  </div>
                                  {m.description && <p className="text-xs text-gray-500 truncate mt-0.5">{m.description}</p>}
                                  {variantCount > 0 && (
                                    <div className={`mt-1.5 rounded-md px-2.5 py-1.5 text-xs border ${activeVariant
                                      ? 'bg-indigo-950/50 border-indigo-700/50 text-indigo-300'
                                      : 'bg-gray-800/60 border-gray-700 text-gray-500'}`}>
                                      {activeVariant
                                        ? <><span className="font-semibold">Variant active:</span> {activeVariant.label}: {activeVariant.contentNote}</>
                                        : <>Default content ({variantCount} variant{variantCount !== 1 ? 's' : ''} not triggered)</>}
                                    </div>
                                  )}
                                  {m.route && (
                                    <button onClick={() => setPreviewRoute(m.route!)} className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                      <Eye className="w-3 h-3" /> Preview page
                                    </button>
                                  )}
                                </div>
                              </div>
                            )})}
                          </>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Hidden modules collapsible */}
              {(() => {
                const allActive = modules.filter(m => m.active !== false)
                const hiddenModules = allActive.filter(m => !vizModules.find(v => v.moduleId === m.moduleId))
                return hiddenModules.length > 0 ? (
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1 px-1 py-2 select-none">
                      <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                      {hiddenModules.length} module{hiddenModules.length !== 1 ? 's' : ''} hidden by current filters
                    </summary>
                    <div className="space-y-1.5 mt-1">
                      {hiddenModules.map(m => (
                        <div key={m.moduleId} className="bg-gray-950 border border-gray-800/50 rounded-xl px-4 py-2.5 flex items-center gap-3 opacity-40">
                          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-800 flex-shrink-0">
                            <ModuleIcon name={m.icon} className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <p className="text-gray-500 text-sm flex-1">{m.label}</p>
                          {m.stepNumber != null && <span className="text-xs text-gray-700">#{m.stepNumber}</span>}
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Page Preview Modal ── */}
      {previewRoute && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="flex items-center gap-3 bg-gray-900 border-b border-gray-800 px-4 py-3 flex-shrink-0">
            <button onClick={() => setPreviewRoute(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Close">
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 font-mono flex-1 truncate">{window.location.origin}{previewRoute}</span>
            <a href={previewRoute} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
            </a>
          </div>
          <iframe
            key={previewRoute}
            src={previewRoute}
            className="flex-1 w-full"
            title="Page preview"
            style={{ border: 'none', background: '#fff' }}
          />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Admin Dashboard Page
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Scrapers Tab ────────────────────────────────────────────────────────────

function ScrapersTab() {
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeResults, setScrapeResults] = useState<Awaited<ReturnType<typeof scrapeDeadlines>>['results'] | null>(null)
  const [scrapeError, setScrapeError] = useState<string | null>(null)

  async function runScrapeDeadlines() {
    setScrapeLoading(true)
    setScrapeResults(null)
    setScrapeError(null)
    try {
      const data = await scrapeDeadlines()
      setScrapeResults(data.results)
    } catch (e: unknown) {
      setScrapeError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setScrapeLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-white">Web Scrapers</h2>
        <p className="text-sm text-gray-500 mt-0.5">Fetch live data from official sources via Firecrawl. Results are for review only — nothing is saved automatically.</p>
      </div>

      {/* Deadline scraper */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-950 border border-green-800 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">University Deadline Scraper</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">Scrapes Bocconi and Politecnico di Milano admissions pages and extracts upcoming deadlines using Firecrawl AI extraction.</p>
            <div className="flex gap-3 mt-0.5">
              <a href="https://www.unibocconi.eu/wps/wcm/connect/bocconi/sitopubblico_en/navigation+tree/home/programs/master+of+science/admissions" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Bocconi
              </a>
              <a href="https://www.polimi.it/en/programmes/laurea-magistrale-equivalent-to-master-of-science/how-to-apply" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Politecnico
              </a>
            </div>
          </div>
        </div>

        <button
          onClick={runScrapeDeadlines}
          disabled={scrapeLoading}
          className="flex items-center gap-1.5 text-xs bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scrapeLoading ? 'animate-spin' : ''}`} />
          {scrapeLoading ? 'Scraping…' : 'Run scrape'}
        </button>

        {scrapeError && (
          <div className="flex items-start gap-2 bg-red-950/40 border border-red-800 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{scrapeError}</p>
          </div>
        )}

        {scrapeResults && (
          <div className="space-y-3">
            {scrapeResults.map((r, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === 'ok' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-sm font-semibold text-white">{r.university}</span>
                  <a href={r.source} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 ml-auto">
                    <ExternalLink className="w-3 h-3" /> Source
                  </a>
                </div>
                {r.status === 'error' ? (
                  <p className="text-xs text-red-400">{r.error}</p>
                ) : r.deadlines && r.deadlines.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-700">
                        <th className="text-left pb-1.5 pr-4 font-medium w-28">Date</th>
                        <th className="text-left pb-1.5 pr-4 font-medium">Title</th>
                        <th className="text-left pb-1.5 font-medium hidden lg:table-cell">Description</th>
                        <th className="text-left pb-1.5 font-medium w-24 hidden md:table-cell">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {r.deadlines.map((d, j) => (
                        <tr key={j}>
                          <td className="py-1.5 pr-4 text-gray-400 tabular-nums">{d.date}</td>
                          <td className="py-1.5 pr-4 text-white font-medium">{d.title}</td>
                          <td className="py-1.5 pr-4 text-gray-500 hidden lg:table-cell">{d.description ?? '—'}</td>
                          <td className="py-1.5 hidden md:table-cell"><span className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 capitalize">{d.type ?? 'other'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-gray-500">No deadlines extracted.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placeholder for future scrapers */}
      <div className="border border-dashed border-gray-800 rounded-xl p-6 text-center">
        <Globe className="w-6 h-6 text-gray-700 mx-auto mb-2" />
        <p className="text-sm text-gray-600">More scrapers coming soon</p>
        <p className="text-xs text-gray-700 mt-0.5">Add new Firecrawl sources here (housing, visa requirements, scholarships…)</p>
      </div>
    </div>
  )
}

type Tab = 'overview' | 'analytics' | 'feedback' | 'users' | 'buddy' | 'emails' | 'content' | 'scrapers'

const ADMIN_TAB_KEY = 'adminDashboardTab'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>(
    () => (localStorage.getItem(ADMIN_TAB_KEY) as Tab | null) ?? 'overview'
  )

  function switchTab(tab: Tab) {
    setActiveTab(tab)
    localStorage.setItem(ADMIN_TAB_KEY, tab)
  }
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | undefined>()
  const [refreshing, setRefreshing] = useState(false)

  async function loadStats(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setStatsLoading(true)
    setStatsError(null)
    try {
      const [data, status] = await Promise.all([fetchAdminStats(), checkAdminStatus()])
      setStats(data)
      setAdminEmail(status.email)
    } catch (e: unknown) {
      setStatsError(e instanceof Error ? e.message : 'Failed to load stats')
    } finally {
      setStatsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',  label: 'Overview',        icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Data Analytics',   icon: <LineChart className="w-3.5 h-3.5" /> },
    { id: 'feedback',  label: 'Feedback',          icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'users',     label: 'Users',             icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'buddy',     label: 'Buddy System',      icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'emails',    label: 'Email Templates',   icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'content',   label: 'Content',            icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'scrapers',  label: 'Scrapers',           icon: <Globe className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">{adminEmail ?? 'Management view'}</p>
            </div>
          </div>
          {activeTab === 'overview' && (
            <button onClick={() => loadStats(true)} disabled={refreshing}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          )}
        </div>
        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => switchTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <>
            {statsLoading && <div className="flex items-center justify-center py-24"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>}
            {!statsLoading && statsError && (
              <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-5">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">Failed to load analytics</p>
                  <p className="text-red-400/70 text-sm mt-0.5">{statsError}</p>
                  <button onClick={() => loadStats()} className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Try again</button>
                </div>
              </div>
            )}
            {!statsLoading && stats && <OverviewTab stats={stats} />}
          </>
        )}
        {activeTab === 'analytics' && <DataAnalyticsTab />}
        {activeTab === 'feedback' && <FeedbackTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'buddy' && <BuddyTab />}
        {activeTab === 'emails' && <EmailsTab />}
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'scrapers' && <ScrapersTab />}
      </main>
    </div>
  )
}