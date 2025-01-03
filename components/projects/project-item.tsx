// components/ProjectItem.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getProjectProgress } from '@/components/session-views/helpers'
import { User } from '@/types/firebase'

interface Project {
  title: string
  description: string
  difficulty: string
  estimatedTime: string
  slugAsParams: string
  theme: string
}

interface ProjectItemProps {
  project: Project
  user: User | null
}

export function ProjectItem({ project, user }: ProjectItemProps) {
  const router = useRouter()
  const [progress, setProgress] = useState<{
    completed: boolean
    totalAttempts: number
    successfulAttempts: number
  } | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      if (!user) return
      const projectProgress = await getProjectProgress(
        user.uid,
        project.slugAsParams
      )
      setProgress(projectProgress)
    }
    fetchProgress()
  }, [user, project.slugAsParams])

  const handleProjectClick = () => {
    router.push(`/projects/${project.theme}/${project.slugAsParams}`)
  }

  return (
    <Card className='hover:shadow-lg transition-shadow'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <CardTitle>{project.title}</CardTitle>
            {user && progress?.completed && (
              <CheckCircle className='h-5 w-5 text-green-500' />
            )}
          </div>
        </div>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 mb-4'>
          <Badge variant='outline'>{project.difficulty}</Badge>
          <Badge variant='outline'>{project.estimatedTime}</Badge>
          {user && (progress?.totalAttempts ?? 0) > 0 && (
            <Badge variant='outline'>
              {progress?.successfulAttempts}/{progress?.totalAttempts} attempts
            </Badge>
          )}
        </div>
        <Button className='w-full mt-4' onClick={handleProjectClick}>
          {progress?.completed ? 'Review Project' : 'Start Project'}
        </Button>
      </CardContent>
    </Card>
  )
}
