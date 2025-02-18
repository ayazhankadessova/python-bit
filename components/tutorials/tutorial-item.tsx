import Link from 'next/link'
import { Tag } from '../ui/tag'
import React, { useState } from 'react'
import Image from 'next/image'
import { User } from '@/types/firebase'
import { TutorialStatus } from '@/components/tutorials/tutorial-status'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <article className='flex-1 flex flex-col border-border border rounded-xl p-4 group hover:shadow-lg hover:border-purple-700 transition-all duration-200'>
      <div className='flex flex-col-reverse sm:flex-row justify-between gap-4 h-full'>
        <div className='flex-1 flex flex-col min-h-full'>
          <div>
            <div className='flex items-start gap-3'>
              <div>
                <h2 className='text-2xl font-bold flex flex-col sm:flex-row sm:items-center gap-2'>
                  {title}
                </h2>
                <div className='max-w-none text-muted-foreground mt-2'>
                  {description}
                </div>
              </div>
            </div>

            <div className='flex gap-2 mt-4'>
              {tags?.map((tag) => (
                <Tag tag={tag} key={tag} />
              ))}
            </div>

            <div className='mt-6'>
              <TutorialStatus
                tutorialId={firestoreId}
                exerciseCount={exercises}
                detailed={true}
              />
            </div>
          </div>

          <div className='mt-auto pt-8'>
            <Link href={'/' + slug}>
              <Button variant='softBlue' className='gap-2'>
                <Play className='h-5 w-5' />
                Start Tutorial
              </Button>
            </Link>
          </div>
        </div>

        <div className='sm:mb-0 overflow-hidden rounded-xl group-hover:scale-[1.02] transition-transform duration-200'>
          <div className={`relative ${isLoading ? 'animate-pulse' : ''}`}>
            <Image
              src={`/tutorials/${firestoreId}.webp`}
              alt={title}
              width={500}
              height={300}
              onLoad={() => setIsLoading(false)}
              className={`
                sm:w-[9rem]
                md:w-[12rem]
                lg:w-[18rem]
                xl:w-[18rem]
                2xl:w-[20rem]
                rounded-xl
                transition-all duration-700 ease-in-out
                ${isLoading ? 'opacity-0' : 'opacity-100'}
              `}
              priority={false}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

export default TutorialItem
