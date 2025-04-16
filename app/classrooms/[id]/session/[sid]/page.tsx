'use client';
import { use } from "react";
// import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { StudentSessionView } from '@/components/session-views/student-session-view'
import { TeacherSessionView } from '@/components/session-views/teacher-session-view'
import CustomLoginRequired from '@/components/auth/login-required'

interface PageProps {
  params: Promise<{
    id: string // classroom id
    sid: string // session id
  }>
}

const SessionPage: React.FC<PageProps> = props => {
  const params = use(props.params);
  const router = useRouter()
  const { user, loading } = useAuth()

  // Get IDs from URL parameters
  const classroomId = params.id
  const sessionId = params.sid

  if (loading) return <LoadingSpinner />

  if (!user) {
    return (
      <CustomLoginRequired />
    )
  }

  // Main session view
  return user.role === 'teacher' ? (
    <TeacherSessionView
      classroomId={classroomId}
      sessionId={sessionId}
      onEndSession={() => {
        // Handle session end
        router.push(`/classrooms/${classroomId}`)
      }}
    />
  ) : (
    <StudentSessionView
      classroomId={classroomId}
      sessionId={sessionId}
      onEndSession={() => router.push(`/classrooms/${classroomId}`)}
    />
  )
}

export default SessionPage
