import React, { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'
import { ActiveStudent } from '@/types/classrooms/live-session'

interface AssignmentProgressProps {
  assignmentId: string | null
  activeStudents: ActiveStudent[]
}

interface StudentProgress {
  completed: boolean
  totalAttempts: number
  successfulAttempts: number
  lastAttempt: number | null
}

const AssignmentProgress = ({
  assignmentId,
  activeStudents,
}: AssignmentProgressProps) => {
  const [progressData, setProgressData] = useState<
    Record<string, StudentProgress>
  >({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!assignmentId || activeStudents.length === 0) {
      setLoading(false)
      return
    }

    const unsubscribers = activeStudents.map((student) => {
      const assignmentDocRef = doc(
        fireStore,
        'users',
        student.uid,
        'assignments',
        assignmentId
      )

      return onSnapshot(
        assignmentDocRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data()
            setProgressData((prev) => ({
              ...prev,
              [student.uid]: {
                completed: data.completed || false,
                totalAttempts: data.totalAttempts || 0,
                successfulAttempts: data.successfulAttempts || 0,
                lastAttempt: data.lastAttempt || null,
              },
            }))
          } else {
            // If document doesn't exist, set default values
            setProgressData((prev) => ({
              ...prev,
              [student.uid]: {
                completed: false,
                totalAttempts: 0,
                successfulAttempts: 0,
                lastAttempt: null,
              },
            }))
          }
          setLoading(false)
        },
        (error) => {
          console.error('Error fetching assignment progress:', error)
          setLoading(false)
        }
      )
    })

    // Cleanup subscriptions
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [assignmentId, activeStudents])

  if (!assignmentId) return null

  if (loading) {
    return (
      <div className='bg-muted/50 p-4'>
        <div className='flex items-center justify-center'>
          <span className='text-muted-foreground'>
            Loading progress data...
          </span>
        </div>
      </div>
    )
  }

  const studentsCompleted = Object.values(progressData).filter(
    (data) => data.completed
  ).length
  const completionPercentage = (studentsCompleted / activeStudents.length) * 100

  return (
    <div className='bg-muted/50 p-4'>
      <div className='mb-4'>
        <h3 className='font-semibold mb-2'>Assignment Progress</h3>
        <Progress value={completionPercentage} className='h-2' />
        <p className='text-sm text-muted-foreground mt-1'>
          {studentsCompleted} of {activeStudents.length} students completed
        </p>
      </div>

      <div className='space-y-2'>
        {activeStudents.map((student) => {
          const progress = progressData[student.uid] || {
            completed: false,
            totalAttempts: 0,
            successfulAttempts: 0,
            lastAttempt: null,
          }

          return (
            <div
              key={student.uid}
              className='flex items-center justify-between p-2 bg-background rounded-lg'
            >
              <div className='flex items-center space-x-3'>
                {progress.completed ? (
                  <CheckCircle2 className='w-4 h-4 text-green-500' />
                ) : (
                  <XCircle className='w-4 h-4 text-gray-400' />
                )}
                <div>
                  <p className='text-sm font-medium'>{student.displayName}</p>
                  <p className='text-xs text-muted-foreground'>
                    Attempts: {progress.successfulAttempts}/
                    {progress.totalAttempts}
                  </p>
                </div>
              </div>
              {progress.lastAttempt && (
                <div className='flex items-center text-xs text-muted-foreground'>
                  <Clock className='w-3 h-3 mr-1' />
                  {new Date(progress.lastAttempt).toLocaleTimeString()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AssignmentProgress
