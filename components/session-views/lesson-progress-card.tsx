import React, { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'
import {
  ActiveStudent,
  AssignmentProgressProps,
  SessionStudent,
} from '@/types/classrooms/live-session'
import { StudentProgress } from '@/types/classrooms/live-session'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { MonitoringIndicator } from './monitoring-state'

interface ExtendedAssignmentProgressProps extends AssignmentProgressProps {
  selectedStudent: ActiveStudent | null
  onStudentSelect: (student: ActiveStudent) => void
  sessionStudents: Record<string, SessionStudent>
}

const AssignmentProgress = ({
  assignmentId,
  activeStudents,
  selectedStudent,
  onStudentSelect,
  sessionStudents,
}: ExtendedAssignmentProgressProps) => {
  const [progressData, setProgressData] = useState<
    Record<string, StudentProgress>
  >({})
  const [loading, setLoading] = useState(true)

  const { studentsCompleted, completionPercentage } = useMemo(() => {
    const completed = Object.values(progressData).filter(
      (data) => data.completed
    ).length
    return {
      studentsCompleted: completed,
      completionPercentage:
        activeStudents.length > 0
          ? (completed / activeStudents.length) * 100
          : 0,
    }
  }, [progressData, activeStudents.length])

  useEffect(() => {
    setProgressData({})

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

  return (
    <div className='border-t bg-muted/50 p-4'>
      <div className='mb-4'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='font-semibold'>Assignment Progress</h3>
          <p className='text-sm text-muted-foreground'>
            {studentsCompleted} of {activeStudents.length} online completed
          </p>
        </div>
        <p className='text-sm text-muted-foreground'>
          Click on a student to view their code
        </p>
        <Progress value={completionPercentage} className='h-2' />
      </div>

      <div className='space-y-2 max-h-[40vh] overflow-y-auto'>
        {activeStudents.map((student) => {
          const progress = progressData[student.uid] || {
            completed: false,
            totalAttempts: 0,
            successfulAttempts: 0,
            lastAttempt: null,
          }

          const isSelected = selectedStudent?.uid === student.uid
          const studentMonitoring = sessionStudents?.[student.uid]?.monitoring

          return (
            <Card
              key={student.uid}
              className={`cursor-pointer hover:bg-accent transition-colors ${
                isSelected ? 'border-primary bg-accent' : ''
              }`}
              onClick={() => onStudentSelect(student)}
            >
              <CardHeader className='p-3'>
                <div className='flex items-center justify-between'>
                  {/* Left side with student info */}
                  <div className='flex items-center space-x-3'>
                    {progress.completed ? (
                      <CheckCircle2 className='w-4 h-4 text-green-500' />
                    ) : (
                      <XCircle className='w-4 h-4 text-gray-400' />
                    )}
                    <div>
                      <CardTitle className='text-sm font-normal'>
                        {student.displayName}
                      </CardTitle>
                      <p className='text-xs text-muted-foreground'>
                        Attempts: {Number(progress.successfulAttempts)}/
                        {Number(progress.totalAttempts)}
                      </p>
                    </div>
                  </div>

                  {/* Right side with monitoring and time */}
                  <div className='flex items-center space-x-4'>
                    {studentMonitoring && (
                      <MonitoringIndicator state={studentMonitoring} />
                    )}
                    {progress.lastAttempt && (
                      <div className='flex items-center text-xs text-muted-foreground'>
                        <Clock className='w-3 h-3 mr-1' />
                        {new Date(progress.lastAttempt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default AssignmentProgress
