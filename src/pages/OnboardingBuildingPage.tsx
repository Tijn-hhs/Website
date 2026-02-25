import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const TOTAL_DURATION_MS = 17000

const STAGES = [
  { pct: 0,   message: 'Getting to know you…' },
  { pct: 16,  message: 'Mapping your relocation journey' },
  { pct: 32,  message: 'Configuring your dashboard' },
  { pct: 48,  message: 'Personalising your step-by-step guide' },
  { pct: 64,  message: 'Adding your deadlines & milestones' },
  { pct: 82,  message: 'Almost there — putting the finishing touches' },
  { pct: 100, message: 'Your dashboard is ready! 🎉' },
]

// Journey emojis — one per major step + a few extras for liveliness
const EMOJIS = ['🎓', '💶', '✈️', '📋', '🧳', '🏛️', '🏠', '🏦', '🛡️', '💊', '🗺️', '🌍']

// Each emoji gets a fixed start position (seeded, not random, so no hydration flicker)
const EMOJI_CONFIG = EMOJIS.map((emoji, i) => {
  const angle = (i / EMOJIS.length) * 2 * Math.PI
  return {
    emoji,
    delay: (i / EMOJIS.length) * (TOTAL_DURATION_MS * 0.85),
    fromX: Math.round(Math.sin(angle) * 160),
    fromY: Math.round(100 + Math.cos(angle * 0.7) * 60),
    rotate: Math.round((i % 2 === 0 ? 1 : -1) * 20 + i * 5),
  }
})

function currentStage(pct: number) {
  let stage = STAGES[0]
  for (const s of STAGES) {
    if (pct >= s.pct) stage = s
  }
  return stage
}

export default function OnboardingBuildingPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [visibleEmojis, setVisibleEmojis] = useState<number[]>([])
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const emojiTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const pct = Math.min((elapsed / TOTAL_DURATION_MS) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(() => navigate('/dashboard', { replace: true }), 900)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    EMOJI_CONFIG.forEach((cfg, i) => {
      const t = setTimeout(() => {
        setVisibleEmojis(prev => [...prev, i])
      }, cfg.delay)
      emojiTimersRef.current.push(t)
    })

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      emojiTimersRef.current.forEach(clearTimeout)
    }
  }, [navigate])

  const stage = currentStage(Math.round(progress))
  const pctDisplay = Math.round(progress)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4">
        {/* Keyframe styles */}
        <style>{`
          @keyframes flyIntoBox {
            0%   { opacity: 0; transform: translate(var(--fx), calc(-1 * var(--fy))) rotate(var(--fr)); }
            20%  { opacity: 1; }
            78%  { opacity: 1; transform: translate(0px, 0px) rotate(0deg); }
            100% { opacity: 0; transform: translate(0px, 8px) scale(0.25) rotate(0deg); }
          }
          @keyframes pulseSoft {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.03); }
          }
          @keyframes fadeSlideUp {
            0%   { opacity: 0; transform: translateY(7px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 flex flex-col items-center gap-8">

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
              We're building your dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              We're making your personalised relocation journey
            </p>
          </div>

          {/* Dashboard box + flying emojis */}
          <div className="relative flex items-center justify-center" style={{ width: 240, height: 200 }}>

            {/* Flying emojis */}
            {visibleEmojis.map(i => {
              const cfg = EMOJI_CONFIG[i]
              return (
                <span
                  key={i}
                  className="absolute text-2xl pointer-events-none select-none"
                  style={{
                    '--fx': `${cfg.fromX}px`,
                    '--fy': `${cfg.fromY}px`,
                    '--fr': `${cfg.rotate}deg`,
                    animation: `flyIntoBox 2.2s cubic-bezier(.4,0,.6,1) forwards`,
                    zIndex: 10,
                  } as React.CSSProperties}
                >
                  {cfg.emoji}
                </span>
              )
            })}

            {/* Mini dashboard card */}
            <div
              className="w-48 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-md"
              style={{ animation: 'pulseSoft 2.8s ease-in-out infinite' }}
            >
              {/* Mock top bar */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-200 opacity-80" />
                <div className="h-1.5 rounded-full bg-blue-300 flex-1" />
              </div>
              {/* Mock step rows */}
              <div className="p-3 flex flex-col gap-2">
                {[1, 2, 3, 4].map(row => (
                  <div key={row} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md flex-shrink-0"
                      style={{
                        background: row <= Math.ceil(progress / 25) ? '#3b82f6' : '#e5e7eb',
                        transition: 'background 0.6s ease',
                      }}
                    />
                    <div
                      className="h-2 rounded-full flex-1"
                      style={{
                        background: row <= Math.ceil(progress / 25)
                          ? 'linear-gradient(90deg, #bfdbfe, #60a5fa)'
                          : '#f3f4f6',
                        transition: 'background 0.6s ease',
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* Percentage badge */}
              <div className="px-3 pb-3 text-right">
                <span className="text-xs font-semibold text-blue-600">{pctDisplay}%</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Building your journey</span>
              <span>{pctDisplay}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 2s linear infinite',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </div>

          {/* Stage message */}
          <p
            key={stage.message}
            className="text-sm font-medium text-blue-600 text-center min-h-[1.5rem]"
            style={{ animation: 'fadeSlideUp 0.4s ease forwards' }}
          >
            {stage.message}
          </p>

          {/* Collected emoji strip */}
          <div className="flex flex-wrap justify-center gap-1.5 min-h-[2rem]">
            {visibleEmojis.map(i => (
              <span
                key={i}
                className="text-lg opacity-60"
                style={{ animation: 'fadeSlideUp 0.3s ease forwards' }}
              >
                {EMOJI_CONFIG[i].emoji}
              </span>
            ))}
          </div>

        </div>

        {/* Sub-text */}
        <p className="mt-6 text-xs text-slate-400 text-center max-w-xs">
          We're using your answers to create a step-by-step guide made just for you.
        </p>
      </div>
    </>
  )
}
