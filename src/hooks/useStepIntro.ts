import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMe, markStepStarted } from '../lib/api'

interface UseStepIntroResult {
  showModal: boolean
  handleConfirm: () => Promise<void>
  handleBack: () => void
  isChecking: boolean
}

export function useStepIntro(stepKey: string): UseStepIntroResult {
  const [showModal, setShowModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkStepStatus()
  }, [stepKey])

  async function checkStepStatus() {
    try {
      setIsChecking(true)
      const data = await fetchMe()
      
      // Find the progress entry for this step
      const stepProgress = data.progress.find(p => p.stepKey === stepKey)
      
      // Show modal if step has never been started
      if (!stepProgress || !stepProgress.started) {
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error checking step status:', error)
      // On error, don't show modal to avoid blocking the user
    } finally {
      setIsChecking(false)
    }
  }

  async function handleConfirm() {
    try {
      const success = await markStepStarted(stepKey)
      if (success) {
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error marking step as started:', error)
      // Even on error, close modal to not block the user
      setShowModal(false)
    }
  }

  function handleBack() {
    navigate('/dashboard')
  }

  return {
    showModal,
    handleConfirm,
    handleBack,
    isChecking,
  }
}
