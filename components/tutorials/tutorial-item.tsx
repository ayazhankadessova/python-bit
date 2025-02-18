import Link from 'next/link'
import { Tag } from '../ui/tag'
import React, { useState } from 'react'
import Image from 'next/image'
import { User } from '@/types/firebase'
import { TutorialStatus } from '@/components/tutorials/tutorial-status'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'

interface TutorialItemProps {
  post: {
    slug: string
    title: string
    description?: string
    date: number
    tags?: Array<string>
    exercises: number
    firestoreId: string
  }
  user: User | null
}

export function TutorialItem({ post }: TutorialItemProps) {
  const { slug, title, description, tags, exercises, firestoreId } = post
  const [isLoading, setIsLoading] = useState<boolean>(true)

  return (
    <Card className='flex flex-col h-full'>
      <div className='flex flex-col sm:flex-row gap-2 h-full'>
        <div className='w-full sm:w-auto overflow-hidden rounded-xl'>
          <div className={`relative ${isLoading ? 'animate-pulse' : ''}`}>
            <Image
              src={`/tutorials/${firestoreId}.webp`}
              alt={title}
              width={500}
              height={300}
              onLoad={() => setIsLoading(false)}
              className={`
                w-full
                sm:w-72
                xl:w-72
                2xl:w-80
                rounded-xl
                transition-all duration-700 ease-in-out
                ${isLoading ? 'opacity-0' : 'opacity-100'}
                object-cover
              `}
              priority={false}
            />
          </div>
        </div>

        <div className='flex-1 flex flex-col min-h-full'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-2xl'>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent className='flex-1'>
            <div className='flex flex-wrap gap-2 mb-6'>
              {tags?.map((tag) => (
                <Tag tag={tag} key={tag} />
              ))}
            </div>

            <TutorialStatus
              tutorialId={firestoreId}
              exerciseCount={exercises}
              detailed={true}
            />
          </CardContent>

          <CardFooter className='mt-auto pt-4'>
            <Link href={'/' + slug} className='w-full'>
              <Button variant='softBlue' className='gap-2 w-full'>
                <Play className='h-5 w-5' />
                Start Tutorial
              </Button>
            </Link>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}

export default TutorialItem
