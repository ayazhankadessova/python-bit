'use client'

import { CheckCircle, Clock, BookOpen  } from 'lucide-react'
import { useProjectProgress } from '@/hooks/projects/useProjectProgress'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'

interface ProjectStatusProps {
  projectId: string
  detailed: boolean
}

export function ProjectStatus({ projectId, detailed }: ProjectStatusProps) {
  const { user } = useAuth()
  const { progress } = useProjectProgress(projectId, user, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 600000,
  })

  if (!user || !progress) return null

  // if detailed , return this 
  if (detailed) {
    return (
      <div className='flex items-center gap-3 text-sm'>
        <div className='flex items-center gap-1'>
          {progress.completed ? (
            <>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <span className='text-green-500 font-medium'>Completed</span>
            </>
          ) : progress.totalAttempts === 0 ? (
            <>
              <BookOpen className='h-5 w-5 text-blue-500' />
              <span className='text-blue-500 font-medium'>Not Started</span>
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
            Last attempt: {formatDate(progress.lastAttempt)}
          </div>
        )}
      </div>
    )
  } else {
    return (
      <>
        {progress.completed ? (
          <CheckCircle className='h-5 w-5 text-green-500' />
        ) : progress.totalAttempts === 0 ? (
          <BookOpen className='h-5 w-5 text-blue-500' />
        ) : (
          <Clock className='h-5 w-5 text-yellow-500' />
        )}
      </>
    )
  }
  
}
