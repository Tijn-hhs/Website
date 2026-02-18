import { useEffect } from 'react'

interface CongratulationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CongratulationsModal({ isOpen, onClose }: CongratulationsModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // Create confetti from different positions
        if (window.confetti) {
          window.confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          })
          window.confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          })
        }
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Congratulations!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Amazing news! Getting accepted is a huge achievement. We're excited to help you with your journey to Milan!
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// TypeScript declaration for confetti
declare global {
  interface Window {
    confetti?: any
  }
}
