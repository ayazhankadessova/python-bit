'use client'

import { CheckCircle, Clock, BookOpen } from 'lucide-react'
import { useTutorialProgress } from '@/hooks/tutorial/useTutorialProgress'
import { useAuth } from '@/contexts/AuthContext'
import { cn, formatDate } from '@/lib/utils'

interface TutorialStatusProps {
  tutorialId: string
  exerciseCount: number
  detailed: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
}

export function TutorialStatus({
  tutorialId,
  exerciseCount,
  detailed,
  className,
  iconClassName,
  textClassName,
}: TutorialStatusProps) {
  const { user } = useAuth()
  const { progress, completedExercises, totalExercises, isLoading, lastUpdated } =
    useTutorialProgress(tutorialId, exerciseCount, user, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 600000,
    })

  // Only return null if user is not authenticated or data is still loading
  if (!user || isLoading) return null

  // Detailed view with exercise count and last updated
  if (detailed) {
    return (
      <div className={cn('flex items-center gap-3 text-sm', className)}>
        <div className='flex items-center gap-1'>
          {progress === 100 ? (
            <>
              <CheckCircle
                className={cn('h-5 w-5 text-green-500', iconClassName)}
              />
              <span className={cn('text-green-500 font-medium', textClassName)}>
                Completed
              </span>
            </>
          ) : progress > 0 ? (
            <>
              <Clock className={cn('h-5 w-5 text-yellow-500', iconClassName)} />
              <span
                className={cn('text-yellow-500 font-medium', textClassName)}
              >
                In Progress
              </span>
            </>
          ) : (
            <>
              <BookOpen
                className={cn('h-5 w-5 text-purple-500', iconClassName)}
              />
              <span className={cn('text-purple-500 font-medium', textClassName)}>
                No Submissions
              </span>
            </>
          )}
        </div>
        {progress > 0 && (
          <div className={cn('text-muted-foreground', textClassName)}>
            {completedExercises}/{totalExercises} exercises completed
          </div>
        )}
        {lastUpdated && lastUpdated > 1704449954 && (
          <div className='text-muted-foreground'>
            Last Submission: {formatDate(lastUpdated)}
          </div>
        )}
      </div>
    )
  }

  // Simple icon-only view
  return (
    <>
      {progress === 100 ? (
        <CheckCircle className={cn('h-5 w-5 text-green-500', iconClassName)} />
      ) : progress > 0 ? (
        <Clock className={cn('h-5 w-5 text-yellow-500', iconClassName)} />
      ) : (
        <BookOpen className={cn('h-5 w-5 text-purple-500', iconClassName)} />
      )}
    </>
  )
}

export default TutorialStatus
