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

interface QuizCardProps {
  id: string
  title: string
  description: string
  tutorialId: string
  questionCount: number
}

export default function QuizCard({
  id,
  title,
  description,
  tutorialId,
  questionCount,
}: QuizCardProps) {
  return (
    <Card className='w-full'>
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
