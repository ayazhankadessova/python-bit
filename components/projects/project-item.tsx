// components/ProjectItem.tsx
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
import { ProjectStatus } from './project-status'
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
  

  const handleProjectClick = () => {
    router.push(`/projects/${project.theme}/${project.slugAsParams}`)
  }

  return (
    <Card className='hover:shadow-lg transition-shadow'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <CardTitle>{project.title}</CardTitle>
            <ProjectStatus projectId={project.slugAsParams} detailed={false} />
          </div>
        </div>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 mb-4'>
          <Badge variant='outline'>{project.difficulty}</Badge>
          <Badge variant='outline'>{project.estimatedTime}</Badge>
        </div>
        <Button className='w-full mt-4' onClick={handleProjectClick}>
          {'Start Project'}
        </Button>
      </CardContent>
    </Card>
  )
}
