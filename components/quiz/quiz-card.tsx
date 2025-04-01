import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
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
  imageUrl
}: QuizCardProps) {
  return (
    <Card className='w-full'>
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
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BookOpen className='h-5 w-5' />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground'>
          {questionCount} questions
        </p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button variant='outline' asChild>
          <Link href={`/tutorials/${tutorialId}`}>View Tutorial</Link>
        </Button>
        <Button asChild>
          <Link href={`/quizzes/${id}`}>Start Quiz</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
