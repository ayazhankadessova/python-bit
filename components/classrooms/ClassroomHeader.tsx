import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ClassroomHeaderProps {
  title: string
}

export function ClassroomHeader({ title }: ClassroomHeaderProps) {
  const router = useRouter()
  return (
    <div className='flex justify-between items-center mb-6'>
      <h1 className='text-3xl'>{title}</h1>
      <Button variant='outline' onClick={() => router.replace('/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  )
}
