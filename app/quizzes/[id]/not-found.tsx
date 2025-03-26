// app/quiz/[id]/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function QuizNotFound() {
  return (
    <div className='container flex flex-col items-center justify-center max-w-md py-16 text-center'>
      <h1 className='text-4xl font-bold tracking-tight mb-2'>Quiz Not Found</h1>
      <p className='text-muted-foreground mb-8'>
        Sorry, we could not find the quiz you were looking for.
      </p>
      <Button asChild>
        <Link href='/'>Go back to homepage</Link>
      </Button>
    </div>
  )
}
