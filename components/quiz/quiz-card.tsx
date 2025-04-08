import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CircleHelp } from 'lucide-react'
import Image from 'next/image'

interface QuizCardProps {
  id: string
  title: string
  description: string
  tutorialId: string
  questionCount: number
  imageUrl: string
}

export default function QuizCard({
  id,
  title,
  description,
  tutorialId,
  questionCount,
  imageUrl,
}: QuizCardProps) {
  return (
    <Card className='w-full flex flex-col h-full'>
      {/* Image Section */}
      <div className='relative w-full aspect-[16/9]'>
        <Image
          src={imageUrl}
          alt={'quiz-cover'}
          layout='fill'
          objectFit='cover'
          className='rounded-t-md'
        />
      </div>
      <CardHeader className='flex-grow'>
        <CardTitle className='flex items-center gap-2 text-xl'>
          {title}
        </CardTitle>
        <CardDescription className='text-md'>{description}</CardDescription>
      </CardHeader>
      <CardFooter className='mt-auto flex flex-col gap-4 items-start'>
        <div className='flex items-center gap-2'>
          <CircleHelp className='h-4 w-4 text-purple-600' />
          <p className='text-md text-muted-foreground'>
            {questionCount} questions
          </p>
        </div>
        <div className='flex justify-between items-baseline w-full'>
          <Button variant='outline' asChild>
            <Link href={`/tutorials/${tutorialId}`}>View Tutorial</Link>
          </Button>
          <Button asChild>
            <Link href={`/quizzes/${id}`}>Start Quiz</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
