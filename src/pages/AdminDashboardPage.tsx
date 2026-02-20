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
} from 'lucide-react'
import { fetchAdminStats, fetchAdminWhatsappMessages, fetchAdminFeedback, type AdminStats, type WhatsAppMessage, type WhatsAppMessagesResponse, type FeedbackItem } from '../lib/api'
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
// Main Admin Dashboard Page
// ═══════════════════════════════════════════════════════════════════════════════

type Tab = 'overview' | 'analytics' | 'feedback'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
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
    { id: 'overview',  label: 'Overview',       icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Data Analytics', icon: <LineChart className="w-3.5 h-3.5" /> },
    { id: 'feedback',  label: 'Feedback',        icon: <MessageSquare className="w-3.5 h-3.5" /> },
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
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
      </main>
    </div>
  )
}