import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  FirestoreError,
  getDoc,
  limit,
} from 'firebase/firestore'
import type { LiveSession } from '@/types/classrooms/live-session'
import { fireStore } from '@/firebase/firebase'
import { Loader2 } from 'lucide-react'
import {formatDate, calculateDuration} from "@/lib/utils"

interface SessionManagementProps {
  classroomId: string
  teacherId: string
  isTeacher: boolean
}

interface SessionWithDuration extends LiveSession {
  duration?: string
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  classroomId,
  teacherId,
  isTeacher,
}) => {
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<SessionWithDuration[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Monitor active session and session history
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsRef = collection(
          fireStore,
          `classrooms/${classroomId}/sessions`
        )

        // Set up listener for active session
        const activeSessionQuery = query(
          sessionsRef,
          where('endedAt', '==', null),
          orderBy('startedAt', 'desc'),
          limit(1)
        )

        const unsubscribeActive = onSnapshot(
          activeSessionQuery,
          (snapshot) => {
            if (!snapshot.empty) {
              const sessionData = snapshot.docs[0].data() as Omit<
                LiveSession,
                'id'
              >
              setActiveSession({
                id: snapshot.docs[0].id,
                ...sessionData,
              })
            } else {
              setActiveSession(null)
            }
            setIsLoading(false)
          },
          (error) => {
            console.error('Error listening to active session:', error)
            setError(error.message)
            setIsLoading(false)
          }
        )

        // Fetch session history
        const historyQuery = query(
          sessionsRef,
        //   where('endedAt', '!=', null),
          orderBy('endedAt', 'desc'),
          limit(10) // Adjust limit as needed
        )

        const unsubscribeHistory = onSnapshot(
          historyQuery,
          (snapshot) => {
            const sessions = snapshot.docs.map((doc) => {
              const data = doc.data() as Omit<LiveSession, 'id'>
              return {
                id: doc.id,
                ...data,
                duration: calculateDuration(data.startedAt, data.endedAt),
              }
            })
            setSessionHistory(sessions)
          },
          (error) => {
            console.error('Error listening to session history:', error)
          }
        )

        return () => {
          unsubscribeActive()
          unsubscribeHistory()
        }
      } catch (err) {
        const firebaseError = err as FirestoreError
        setError(firebaseError.message)
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [classroomId])

  // Create new session
  const createSession = async () => {
    if (activeSession) {
      setError('A session is already in progress')
      return
    }

    try {
      setIsLoading(true)
      const sessionRef = collection(
        fireStore,
        `classrooms/${classroomId}/sessions`
      )

      const newSession = {
        startedAt: Date.now(),
        endedAt: null,
        teacherId,
      }

      await addDoc(sessionRef, newSession)
      setError(null)
    } catch (err) {
      const firebaseError = err as FirestoreError
      setError(firebaseError.message)
    } finally {
      setIsLoading(false)
    }
  }

  // End current session
  const endSession = async () => {
    if (!activeSession) return

    try {
      setIsLoading(true)
      const sessionRef = doc(
        fireStore,
        `classrooms/${classroomId}/sessions/${activeSession.id}`
      )
      await updateDoc(sessionRef, {
        endedAt: Date.now(),
      })
      setError(null)
    } catch (err) {
      const firebaseError = err as FirestoreError
      setError(firebaseError.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    )
  }

  if (error) {
    return <div className='p-4 text-red-600'>Error: {error}</div>
  }

  // For students, only show active session status
//   if (!isTeacher) {
//     return (
//       <div className='p-4'>
//         {activeSession ? (
//           <div className='text-green-600 font-medium'>
//             Class is in session (Started{' '}
//             {formatDate(activeSession.startedAt)})
//           </div>
//         ) : (
//           <div className='text-gray-600'>
//             Waiting for teacher to start the session
//           </div>
//         )}
//       </div>
//     )
//   }

  // Teacher view with session management and history
  return (
    <div className='space-y-6'>
      {/* Active Session Management */}
      <div className='p-4 border rounded-lg bg-white shadow-sm'>
        <h3 className='text-lg font-medium mb-4'>Session Management</h3>
        {activeSession ? (
          <div className='space-y-4'>
            <div className='text-green-600 font-medium'>
              Session in progress (Started {formatDate(activeSession.startedAt)}
              )
              <div className='text-sm text-gray-500'>
                Duration: {calculateDuration(activeSession.startedAt, null)}
              </div>
            </div>
            <button
              onClick={endSession}
              disabled={isLoading}
              className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50'
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'End Session'
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={createSession}
            disabled={isLoading}
            className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50'
          >
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Start New Session'
            )}
          </button>
        )}
      </div>

      {/* Session History */}
      <div className='p-4 border rounded-lg bg-white shadow-sm'>
        <h3 className='text-lg font-medium mb-4'>Recent Sessions</h3>
        {sessionHistory.length === 0 ? (
          <p className='text-gray-500'>No previous sessions</p>
        ) : (
          <div className='space-y-2'>
            {sessionHistory.map((session) => (
              <div
                key={session.id}
                className='p-3 border rounded bg-gray-50 hover:bg-gray-100 transition-colors'
              >
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='font-medium'>
                      {formatDate(session.startedAt)}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {formatDate(session.startedAt)} -{' '}
                      {session.endedAt
                        ? formatDate(session.endedAt)
                        : 'In Progress'}
                    </div>
                  </div>
                  <div className='text-sm font-medium text-gray-600'>
                    {session.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionManagement
