// useStudentMonitoring.ts
import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { debounce } from 'lodash'

interface MonitoringState {
  isTabActive: boolean
  isFullscreen: boolean
  lastActiveTime: number
  screenWidth: number
  browserWidth: number
}

export const useStudentMonitoring = (
  classroomId: string,
  sessionId: string,
  studentId: string
) => {
  const [monitoringState, setMonitoringState] = useState<MonitoringState>({
    isTabActive: true,
    isFullscreen: false,
    lastActiveTime: Date.now(),
    screenWidth: window.screen.width,
    browserWidth: window.innerWidth,
  })

  // Update Firebase with the latest state
  const updateMonitoringState = debounce(async (state: MonitoringState) => {
    try {
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions/${sessionId}`
      )

      await updateDoc(sessionRef, {
        [`students.${studentId}.monitoring`]: {
          ...state,
          updatedAt: Date.now(),
        },
      })
    } catch (error) {
      console.error('Error updating monitoring state:', error)
    }
  }, 1000) // Debounce updates to avoid too many writes

  useEffect(() => {
    const handleVisibilityChange = () => {
      const newState = {
        ...monitoringState,
        isTabActive: !document.hidden,
        lastActiveTime: Date.now(),
      }
      setMonitoringState(newState)
      updateMonitoringState(newState)
    }

    const handleFullscreenChange = () => {
      const newState = {
        ...monitoringState,
        isFullscreen: Boolean(document.fullscreenElement),
        lastActiveTime: Date.now(),
      }
      setMonitoringState(newState)
      updateMonitoringState(newState)
    }

    const handleResize = () => {
      const newState = {
        ...monitoringState,
        screenWidth: window.screen.width,
        browserWidth: window.innerWidth,
        lastActiveTime: Date.now(),
      }
      setMonitoringState(newState)
      updateMonitoringState(newState)
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('resize', handleResize)

    // Set initial state
    updateMonitoringState(monitoringState)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [classroomId, sessionId, studentId, monitoringState, updateMonitoringState])

  return monitoringState
}
