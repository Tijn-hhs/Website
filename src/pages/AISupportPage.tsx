import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import FeedbackWidget from '../components/FeedbackWidget'
import StepPageLayout from '../components/StepPageLayout'
import { fetchMe, postChat, fetchChatHistory } from '../lib/api'
import type { ChatMessage } from '../lib/api'
import type { UserProfile, StepProgress } from '../types/user'
import {
  Sparkles,
  Send,
  User,
  GraduationCap,
  Globe,
  Calendar,
  Home,
  FileText,
  CreditCard,
  Shield,
  ClipboardList,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Process knowledge (shown to the AI eventually, shown to user as context) ─

const PROCESS_STEPS = [
  { key: 'university-application', label: 'University Application',  icon: <GraduationCap size={13} /> },
  { key: 'student-visa',           label: 'Student Visa',            icon: <FileText size={13} /> },
  { key: 'codice-fiscale',         label: 'Codice Fiscale',          icon: <ClipboardList size={13} /> },
  { key: 'before-departure',       label: 'Before Departure',        icon: <Globe size={13} /> },
  { key: 'immigration-registration', label: 'Residence Permit',      icon: <ClipboardList size={13} /> },
  { key: 'housing',                label: 'Housing',                 icon: <Home size={13} /> },
  { key: 'banking',                label: 'Banking',                 icon: <CreditCard size={13} /> },
  { key: 'insurance',              label: 'Insurance',               icon: <Shield size={13} /> },
  { key: 'healthcare',             label: 'Healthcare',              icon: <Shield size={13} /> },
]

// ─── Suggested questions ──────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What should I do first after getting accepted?',
  'Do I need a student visa for Italy?',
  'How do I get a Codice Fiscale?',
  'What documents do I need for the Residence Permit?',
  'How much does student housing cost in Milan?',
  'What bank account should I open as a student?',
  'When should I apply for my visa?',
  'What is the Permesso di Soggiorno?',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatProgram(p: UserProfile): string {
  const parts = [p.degreeType, p.fieldOfStudy].filter(Boolean)
  return parts.join(' — ') || 'Not set'
}

function formatArrival(p: UserProfile): string {
  if (!p.programStartMonth) return 'Not set'
  const d = new Date(`${p.programStartMonth}-01`)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// ─── Context sidebar ──────────────────────────────────────────────────────────

function ContextPanel({
  profile,
  progress,
}: {
  profile: UserProfile
  progress: StepProgress[]
}) {
  const [stepsOpen, setStepsOpen] = useState(false)
  const progressMap = Object.fromEntries(progress.map((p) => [p.stepKey, p.completed]))

  const contextFields = [
    { icon: <User size={13} />,          label: 'Name',        value: profile.preferredName },
    { icon: <Globe size={13} />,         label: 'Nationality', value: profile.nationality },
    { icon: <GraduationCap size={13} />, label: 'Program',     value: formatProgram(profile) },
    { icon: <Globe size={13} />,         label: 'University',  value: profile.destinationUniversity },
    { icon: <Calendar size={13} />,      label: 'Arrival',     value: formatArrival(profile) },
    { icon: <Home size={13} />,          label: 'Housing',     value: profile.hasHousing === 'yes' ? 'Arranged' : profile.hasHousing === 'no' ? 'Not yet' : undefined },
    { icon: <FileText size={13} />,      label: 'Visa',        value: profile.hasVisa === 'yes' ? 'Obtained' : profile.hasVisa === 'no' ? 'Not yet' : undefined },
    { icon: <CreditCard size={13} />,    label: 'Bank account',value: profile.hasBankAccount === 'yes' ? 'Open' : profile.hasBankAccount === 'no' ? 'Not yet' : undefined },
  ].filter((f) => f.value)

  const completedCount = PROCESS_STEPS.filter((s) => progressMap[s.key]).length

  return (
    <div className="flex flex-col gap-4">
      {/* What the AI knows */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-blue-600" />
          <p className="text-xs font-semibold text-slate-700">What the AI will know</p>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          The AI will have access to your public profile data below so it can give personalised advice — no private contact details are ever shared.
        </p>
      </div>

      {/* Profile snapshot */}
      {contextFields.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Your profile</p>
          <div className="space-y-2.5">
            {contextFields.map((f) => (
              <div key={f.label} className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5 text-slate-400">{f.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{f.label}</p>
                  <p className="text-xs font-medium text-slate-800 truncate">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <button
          onClick={() => setStepsOpen((o) => !o)}
          className="w-full flex items-center justify-between"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Progress ({completedCount}/{PROCESS_STEPS.length} steps)
          </p>
          {stepsOpen ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
        </button>
        {stepsOpen && (
          <div className="mt-3 space-y-1.5">
            {PROCESS_STEPS.map((s) => {
              const done = progressMap[s.key]
              return (
                <div key={s.key} className="flex items-center gap-2">
                  {done
                    ? <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-500" />
                    : <Circle size={13} className="flex-shrink-0 text-slate-300" />
                  }
                  <span className={`text-xs ${done ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</span>
                </div>
              )
            })}
          </div>
        )}
        {!stepsOpen && (
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(completedCount / PROCESS_STEPS.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Lock size={12} className="flex-shrink-0 mt-0.5 text-slate-400" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Phone numbers, Instagram, LinkedIn, and other contact details are <strong className="text-slate-600">never</strong> shared with the AI.
        </p>
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
        isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
      }`}>
        {isUser ? <User size={13} /> : <Sparkles size={13} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
        }`}>
          {isUser ? msg.content : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="ml-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                h1: ({ children }) => <h1 className="font-bold text-base mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="font-bold mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="font-semibold mb-1">{children}</h3>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{children}</a>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
        <span className="text-xs text-slate-400 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <Sparkles size={13} className="text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AISupportPage() {
  const [profile, setProfile] = useState<UserProfile>({})
  const [progress, setProgress] = useState<StepProgress[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your Leavs AI assistant. I can help you navigate every step of moving to Italy — from your university application to opening a bank account. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Load profile + progress and chat history in parallel
    Promise.all([
      fetchMe().catch(() => null),
      fetchChatHistory().catch(() => []),
    ]).then(([data, history]) => {
      setProfile(data?.profile || {})
      setProgress(data?.progress || [])
      if (history.length > 0) {
        setMessages(
          history.map((m, i) => ({
            id: `hist-${i}`,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
          }))
        )
      }
      setDataLoaded(true)
    })
  }, [])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userTimestamp = new Date().toISOString()
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(userTimestamp),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Build chat history including the new user message
    const chatHistory: ChatMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }))

    try {
      const reply = await postChat(chatHistory, userTimestamp)
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error('[AISupportPage] Chat error:', err)
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't reach the AI service right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      <FeedbackWidget />
        <StepPageLayout
          stepNumber={0}
          totalSteps={0}
          stepLabel="TOOL"
          title="AI Support"
          subtitle="Personalised guidance for your move to Italy — powered by AI."
          useGradientBar
          fullWidth
          showChecklist={false}
        >
          {/* Main two-column layout */}
          <div className="flex gap-5 items-start">

            {/* Left: context panel */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              {dataLoaded
                ? <ContextPanel profile={profile} progress={progress} />
                : <div className="rounded-xl border border-slate-200 bg-white p-6 flex items-center justify-center"><div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" /></div>
              }
            </div>

            {/* Right: chat window */}
            <div className="flex-1 min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 520 }}>

              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Sparkles size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Leavs AI</p>
                  <p className="text-xs text-slate-400">Knows your profile · Italy relocation expert</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-400">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-slate-50/50" style={{ maxHeight: 420 }}>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isTyping && <TypingIndicator />}
              </div>

              {/* Suggestion chips — only show when just the welcome message */}
              {messages.length === 1 && (
                <div className="px-5 pt-3 pb-1 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="rounded-full border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs px-3 py-1 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input bar */}
              <div className="px-4 py-3 border-t border-slate-200 bg-white">
                <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3 py-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about moving to Italy…"
                    rows={1}
                    className="flex-1 bg-transparent resize-none text-sm text-slate-900 placeholder-slate-400 focus:outline-none min-h-[24px] leading-relaxed"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Send size={14} className="text-white" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 text-center">
                  Press <kbd className="font-mono bg-slate-100 border border-slate-200 rounded px-1">Enter</kbd> to send · <kbd className="font-mono bg-slate-100 border border-slate-200 rounded px-1">Shift+Enter</kbd> for new line
                </p>
              </div>

            </div>
          </div>
        </StepPageLayout>
    </>
  )
}
