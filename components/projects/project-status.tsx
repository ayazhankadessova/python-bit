'use client'

import { CheckCircle, Clock } from 'lucide-react'
import { useProgress } from '@/hooks/projects/useProjectProgress'
import { useAuth } from '@/contexts/AuthContext'

interface ProjectStatusProps {
  projectId: string
}

export function ProjectStatus({ projectId }: ProjectStatusProps) {
  const { user } = useAuth()
  const { progress } = useProgress(projectId, user, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 600000,
  })

  if (!user || !progress) return null

  // If no attempts, don't show anything
  if (progress.totalAttempts === 0) return null

  return (
    <div className='flex items-center gap-3 text-sm'>
      <div className='flex items-center gap-1'>
        {progress.completed ? (
          <>
            <CheckCircle className='h-5 w-5 text-green-500' />
            <span className='text-green-500 font-medium'>Completed</span>
          </>
        ) : (
          <>
            <Clock className='h-5 w-5 text-yellow-500' />
            <span className='text-yellow-500 font-medium'>In Progress</span>
          </>
        )}
      </div>
      <div className='text-muted-foreground'>
        {progress.successfulAttempts}/{progress.totalAttempts} attempts
      </div>
      {progress.lastAttempt && (
        <div className='text-muted-foreground'>
          Last attempt: {progress.lastAttempt}
        </div>
      )}
    </div>
  )
}
