import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc,
} from 'firebase/firestore'
import { fireStore } from '@/firebase/firebase'
import type { LiveSession } from '@/types/classrooms/live-session'
import { User } from '@/types/firebase'

export const sessionsService = {
  getSessionsRef: (classroomId: string) =>
    collection(fireStore, `classrooms/${classroomId}/sessions`),

  getActiveSessionQuery: (classroomId: string) => {
    const ref = sessionsService.getSessionsRef(classroomId)
    return query(
      ref,
      where('endedAt', '==', null),
      orderBy('startedAt', 'desc'),
      limit(1)
    )
  },

  getHistoryQuery: (classroomId: string) => {
    const ref = sessionsService.getSessionsRef(classroomId)
    return query(ref, where('endedAt', '!=', null), orderBy('endedAt', 'desc'))
  },

  subscribeToActiveSession: (
    classroomId: string,
    onData: (session: LiveSession | null) => void,
    onError: (error: Error) => void
  ) => {
    return onSnapshot(
      sessionsService.getActiveSessionQuery(classroomId),
      (snapshot) => {
        if (!snapshot.empty) {
          const sessionData = snapshot.docs[0].data() as Omit<LiveSession, 'id'>
          onData({
            id: snapshot.docs[0].id,
            ...sessionData,
          })
        } else {
          onData(null)
        }
      },
      onError
    )
  },

  subscribeToSessionHistory: (
    classroomId: string,
    onData: (sessions: LiveSession[]) => void,
    onError: (error: Error) => void
  ) => {
    return onSnapshot(
      sessionsService.getHistoryQuery(classroomId),
      (snapshot) => {
        const sessions = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<LiveSession, 'id'>
          return {
            id: doc.id,
            ...data,
          }
        })
        onData(sessions)
      },
      onError
    )
  },

  // Create, Join, End Sessions

  createSession: async (
    classroomId: string,
    sessionData: Omit<LiveSession, 'id'>
  ) => {
    const sessionsRef = collection(
      fireStore,
      `classrooms/${classroomId}/sessions`
    )
    const docRef = await addDoc(sessionsRef, sessionData)
    return docRef.id
  },

  endSession: async (classroomId: string, sessionId: string) => {
    const sessionRef = doc(
      fireStore,
      `classrooms/${classroomId}/sessions/${sessionId}`
    )
    await updateDoc(sessionRef, {
      endedAt: Date.now(),
    })
  },

  addStudentToSession: async (
    classroomId: string,
    sessionId: string,
    user: User
  ) => {
    const sessionRef = doc(
      fireStore,
      `classrooms/${classroomId}/sessions/${sessionId}`
    )

    // Create ActiveStudent object
    const activeStudent = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || user.uid,
    }

    await updateDoc(sessionRef, {
      activeStudents: arrayUnion(activeStudent),
      [`students.${user.uid}`]: {
        code: '',
        lastUpdated: Date.now(),
        submissions: [],
        displayName: activeStudent.displayName,
      },
    })
  },

  deleteSession: async (classroomId: string, documentId: string) => {
    const sessionRef = doc(
      fireStore,
      `classrooms/${classroomId}/sessions/${documentId}`
    )
    await deleteDoc(sessionRef)
  },
}
