import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageCircle, Send, X } from 'lucide-react'
import { submitFeedback } from '../lib/api'
import './FeedbackWidget.css'

const VISIT_COUNT_KEY = 'leavs_visit_count'
const LAST_AUTO_PROMPT_KEY = 'leavs_last_auto_prompt'
const AUTO_PROMPT_VISITS = 15          // open after this many page loads
const AUTO_PROMPT_TIME_MS = 5 * 60 * 1000   // 5 minutes on one page
const AUTO_PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 h between auto-prompts

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAutoPrompt, setIsAutoPrompt] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const isOpenRef = useRef(false)

  // Keep ref in sync so timer callbacks read the latest value
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])

  const canAutoPrompt = () => {
    const last = localStorage.getItem(LAST_AUTO_PROMPT_KEY)
    if (!last) return true
    return Date.now() - parseInt(last, 10) > AUTO_PROMPT_COOLDOWN_MS
  }

  const triggerAutoPrompt = () => {
    if (isOpenRef.current || !canAutoPrompt()) return
    localStorage.setItem(LAST_AUTO_PROMPT_KEY, String(Date.now()))
    setIsAutoPrompt(true)
    setIsOpen(true)
  }

  // ── trigger 1: visit count ──────────────────────────────────────────────────
  useEffect(() => {
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) + 1
    localStorage.setItem(VISIT_COUNT_KEY, String(count))
    if (count >= AUTO_PROMPT_VISITS) {
      localStorage.setItem(VISIT_COUNT_KEY, '0')
      // Small delay so the page finishes rendering first
      const t = setTimeout(triggerAutoPrompt, 800)
      return () => clearTimeout(t)
    }
  }, []) // once on mount

  // ── trigger 2: 5 minutes on the same page ──────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(triggerAutoPrompt, AUTO_PROMPT_TIME_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [location.pathname])

  const handleSubmit = async () => {
    if (!message.trim()) return

    setIsSubmitting(true)
    setError(null)
    try {
      console.log('[FeedbackWidget] Submitting feedback:', message)
      const success = await submitFeedback(message, location.pathname)
      console.log('[FeedbackWidget] Feedback submission result:', success)
      if (success) {
        setIsSubmitted(true)
        setMessage('')
        setTimeout(() => {
          setIsSubmitted(false)
          setIsOpen(false)
          setIsAutoPrompt(false)
        }, 2000)
      }
    } catch (error) {
      console.error('[FeedbackWidget] Error submitting feedback:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setIsAutoPrompt(false)
          setError(null)
        }}
        className={`fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 ${isOpen ? 'feedback-circle-expand' : ''}`}
        aria-label="Feedback"
        title="Ask us a question"
      >
        <MessageCircle size={24} />
      </button>

      {/* Feedback Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 z-50 feedback-widget-expand animate-in fade-in duration-300">
          <div className="rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-white" />
                <h3 className="text-white font-semibold">
                  {isAutoPrompt ? 'Is there anything you want to know?' : 'Ask Us Anything'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsAutoPrompt(false)
                  setError(null)
                }}
                className="text-white hover:bg-purple-700 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                      <span className="text-2xl">✓</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Thank you!</p>
                    <p className="text-xs text-slate-600 mt-2">Your feedback has been sent successfully.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {isAutoPrompt
                      ? 'Is there anything you want to know right now? We\'re here to help — just ask!'
                      : 'Is there any information you want to know right now? Ask it to us. We can help you and make our platform better at the same time.'}
                  </p>
                  
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      setError(null)
                    }}
                    placeholder="Type your question or feedback here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-slate-900 placeholder-slate-500 transition-all"
                  />
                  
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !message.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-md transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
