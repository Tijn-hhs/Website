import { useEffect, useState } from 'react'
import { Clock, Bell, BellOff } from 'lucide-react'
import type { Deadline } from '../lib/api'

interface DeadlineBadgesProps {
  deadlines: Deadline[]
}

function calculateTimeRemaining(dueDate: string): {
  isPast: boolean
  isToday: boolean
  displayText: string
  sortValue: number
} {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()

  // Sort value is the time difference (negative for past)
  const sortValue = diffMs

  // Check if past
  if (diffMs < 0) {
    const absDiffMs = Math.abs(diffMs)
    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24))
    
    return {
      isPast: true,
      isToday: false,
      displayText: days === 0 ? 'Expired today' : `Expired ${days}d ago`,
      sortValue,
    }
  }

  // Calculate time components
  const totalSeconds = Math.floor(diffMs / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  const hours = totalHours % 24
  const minutes = totalMinutes % 60

  // Check if today
  const isToday = totalDays === 0

  let displayText: string
  
  if (isToday && totalHours === 0 && totalMinutes === 0) {
    displayText = 'Due now'
  } else if (isToday && totalHours === 0) {
    displayText = `${minutes}m`
  } else if (isToday) {
    displayText = `${totalHours}h ${minutes}m`
  } else if (totalDays === 1) {
    displayText = 'Tomorrow'
  } else if (totalDays < 7) {
    displayText = `${totalDays}d ${hours}h`
  } else {
    displayText = `${totalDays} days`
  }

  return {
    isPast: false,
    isToday,
    displayText,
    sortValue,
  }
}

function DeadlineBadge({ deadline }: { deadline: Deadline }) {
  const [timeInfo, setTimeInfo] = useState(() => calculateTimeRemaining(deadline.dueDate))

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setTimeInfo(calculateTimeRemaining(deadline.dueDate))
    }, 60000)

    return () => clearInterval(interval)
  }, [deadline.dueDate])

  const getColorClasses = () => {
    if (timeInfo.isPast) {
      return 'bg-slate-100 text-slate-600 border-slate-300'
    }
    if (timeInfo.isToday) {
      return 'bg-red-50 text-red-700 border-red-300'
    }
    if (timeInfo.sortValue < 3 * 24 * 60 * 60 * 1000) {
      // Less than 3 days
      return 'bg-orange-50 text-orange-700 border-orange-300'
    }
    return 'bg-blue-50 text-blue-700 border-blue-300'
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all hover:shadow-md ${getColorClasses()}`}
      title={deadline.note || undefined}
    >
      <div className="flex items-center gap-1.5">
        <Clock size={16} className="flex-shrink-0" />
        <span className="font-semibold text-sm">{timeInfo.displayText}</span>
      </div>
      
      <div className="h-4 w-px bg-current opacity-30" />
      
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium">{deadline.title}</span>
        {deadline.sendReminder && (
          <Bell size={14} className="flex-shrink-0 opacity-70" />
        )}
        {!deadline.sendReminder && (
          <BellOff size={14} className="flex-shrink-0 opacity-50" />
        )}
      </div>
    </div>
  )
}

export default function DeadlineBadges({ deadlines }: DeadlineBadgesProps) {
  // Sort deadlines by nearest first
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    const timeA = calculateTimeRemaining(a.dueDate)
    const timeB = calculateTimeRemaining(b.dueDate)
    return timeA.sortValue - timeB.sortValue
  })

  if (sortedDeadlines.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="inline-flex items-center gap-2 text-slate-400">
          <Clock size={20} />
          <p className="text-sm">No deadlines yet. Click "+ Add Deadline" to create one.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {sortedDeadlines.map((deadline) => (
        <DeadlineBadge key={deadline.deadlineId} deadline={deadline} />
      ))}
    </div>
  )
}
