import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { fetchAdminStats, type AdminStats } from '../lib/api'
import { checkAdminStatus } from '../lib/adminAuth'

// ─── Stat card ───────────────────────────────────────────────────────────────

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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | undefined>()
  const [refreshing, setRefreshing] = useState(false)

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const [data, status] = await Promise.all([
        fetchAdminStats(),
        checkAdminStatus(),
      ])
      setStats(data)
      setAdminEmail(status.email)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const generatedAt = stats?.generatedAt
    ? new Date(stats.generatedAt).toLocaleString()
    : null

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
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-xl p-5">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Failed to load analytics</p>
              <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
              <button
                onClick={() => load()}
                className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && stats && (
          <>
            {/* Overview cards */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  icon={<Users className="w-5 h-5" />}
                  label="Total Users"
                  value={stats.overview.totalUsers}
                  sub="All registered accounts"
                />
                <StatCard
                  icon={<UserCheck className="w-5 h-5" />}
                  label="Active Users"
                  value={stats.overview.activeUsers}
                  sub="Have completed ≥1 step"
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Avg. Steps Done"
                  value={stats.overview.avgStepsCompleted}
                  sub="Per active user"
                />
                <StatCard
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="Feedback"
                  value={stats.overview.totalFeedback}
                  sub="Total submissions"
                />
              </div>
            </section>

            {/* Signup timeline */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5" />
                Signups Over Time
              </h2>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <Sparkline data={stats.signupTimeline} />
              </div>
            </section>

            {/* Destinations + Nationalities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top destinations */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                  <Map className="w-3.5 h-3.5" />
                  Top Destinations
                </h2>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
                  {stats.topDestinations.length === 0 ? (
                    <p className="text-gray-600 text-sm">No data yet.</p>
                  ) : (
                    stats.topDestinations.map((d) => (
                      <HorizontalBar
                        key={d.city}
                        label={d.city}
                        value={d.count}
                        max={stats.topDestinations[0].count}
                      />
                    ))
                  )}
                </div>
              </section>

              {/* Top nationalities */}
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  Top Nationalities
                </h2>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
                  {stats.topNationalities.length === 0 ? (
                    <p className="text-gray-600 text-sm">No data yet.</p>
                  ) : (
                    stats.topNationalities.map((n) => (
                      <HorizontalBar
                        key={n.nationality}
                        label={n.nationality}
                        value={n.count}
                        max={stats.topNationalities[0].count}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Step completion breakdown */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5" />
                Step Completion Breakdown
              </h2>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
                {stats.stepBreakdown.length === 0 ? (
                  <p className="text-gray-600 text-sm">No step data yet.</p>
                ) : (
                  stats.stepBreakdown.map((s) => (
                    <HorizontalBar
                      key={s.step}
                      label={s.step}
                      value={s.completions}
                      max={stats.stepBreakdown[0].completions}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Footer */}
            {generatedAt && (
              <p className="text-xs text-gray-700 text-right pb-6">
                Data generated at {generatedAt}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  )
}
