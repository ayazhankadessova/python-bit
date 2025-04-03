import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ThumbsUp } from 'lucide-react'

interface TutorialQuizCTAProps {
  quizSlug: string
  className?: string
}

export function TutorialQuizCTA({
  quizSlug,
  className = '',
}: TutorialQuizCTAProps) {
  return (
    <div
      className={`p-12 border border-purple-200 rounded-lg bg-card shadow-sm ${className}`}
    >
      <p className='mt-0 mb-4 flex items-center font-normal text-md text-muted-foreground '>
        <ThumbsUp className='mr-2 h-5 w-5 text-green-600 mb-2' />
        Great job finishing the tutorial!
      </p>

      <h1 className='text-2xl font-medium mb-0'>
        Ready to test your knowledge?
      </h1>

      <p className='mb-4 mt-1 text-muted-foreground text-md'>
        Take a quick quiz to reinforce what you&apos;ve learned and make sure
        you&apos;ve mastered the key concepts.
      </p>

      <Link href={`/quizzes/${quizSlug}`} passHref>
        <Button className='group'>
          Take the Quiz
          <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
        </Button>
      </Link>
    </div>
  )
}
