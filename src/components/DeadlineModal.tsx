import { useState, useEffect } from 'react'
import { X, Calendar, Bell, FileText, Trash2 } from 'lucide-react'
import type { Deadline } from '../lib/api'

interface DeadlineModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; dueDate: string; sendReminder: boolean; note?: string; templateKey?: string }) => Promise<void>
  initialData?: Deadline
  /** Pre-fill when the user clicks a suggested milestone dot to claim it */
  prefill?: { title: string; suggestedDate: string; templateKey: string }
  onDelete?: () => Promise<void>
}

export default function DeadlineModal({ isOpen, onClose, onSave, initialData, prefill, onDelete }: DeadlineModalProps) {
  const isEditMode = !!initialData
  const isClaimMode = !initialData && !!prefill

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [sendReminder, setSendReminder] = useState(false)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Pre-fill when opening in edit mode or claim mode
  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title)
      // dueDate may come as ISO string "YYYY-MM-DD" or full ISO, trim to date part
      setDueDate(initialData.dueDate.slice(0, 10))
      setSendReminder(initialData.sendReminder)
      setNote(initialData.note ?? '')
      setErrors({})
      setConfirmDelete(false)
    } else if (isOpen && prefill) {
      setTitle(prefill.title)
      setDueDate(prefill.suggestedDate)
      setSendReminder(false)
      setNote('')
      setErrors({})
      setConfirmDelete(false)
    } else if (isOpen && !initialData) {
      setTitle('')
      setDueDate('')
      setSendReminder(false)
      setNote('')
      setErrors({})
      setConfirmDelete(false)
    }
  }, [isOpen, initialData, prefill])

  if (!isOpen) return null

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Deadline name is required'
    if (!dueDate) {
      newErrors.dueDate = 'Date is required'
    } else if (isNaN(new Date(dueDate).getTime())) {
      newErrors.dueDate = 'Invalid date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      await onSave({ title: title.trim(), dueDate, sendReminder, note: note.trim() || undefined, templateKey: prefill?.templateKey })
      onClose()
    } catch {
      setErrors({ submit: 'Failed to save deadline. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsLoading(true)
    try {
      await onDelete()
      onClose()
    } catch {
      setErrors({ submit: 'Failed to delete deadline. Please try again.' })
    } finally {
      setIsLoading(false)
      setConfirmDelete(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={handleClose} />

        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isEditMode ? 'Edit Deadline' : isClaimMode ? 'Set your date' : 'Add Deadline'}
              </h2>
              {isClaimMode && (
                <p className="mt-0.5 text-sm text-slate-500">Personalise the suggested milestone</p>
              )}
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
                Deadline name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g., Book flight to Milan"
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.title ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isLoading}
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.dueDate ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>}
            </div>

            {/* Reminder */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Send reminder?
              </label>
              <div className="flex gap-3">
                {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSendReminder(value)}
                    disabled={isLoading}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all disabled:opacity-50 ${
                      sendReminder === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {value && <Bell size={13} className="inline mr-1.5 -mt-0.5" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-1.5">
                Note <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                disabled={isLoading}
                placeholder="Any extra details..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
              />
            </div>

            {errors.submit && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              {/* Delete button (edit mode only) */}
              {isEditMode && onDelete && (
                confirmDelete ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Deleting…' : 'Confirm delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={isLoading}
                      className="py-2.5 px-3 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )
              )}

              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="py-2.5 px-5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving…' : isEditMode ? 'Save changes' : 'Add deadline'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
