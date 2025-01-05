import Link from 'next/link'
import { Tag } from '../ui/tag'
import React, { useState } from 'react'
import Image from 'next/image'
import { User } from '@/types/firebase'
import {TutorialStatus} from '@/components/tutorials/tutorial-status'

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

export function TutorialItem({ post, user }: TutorialItemProps) {
  const { slug, title, description, tags, exercises, firestoreId } = post
  const [isLoading, setIsLoading] = useState<boolean>(true)

  return (
    <article className='flex-1 flex flex-col gap-2 border-border border-b py-3'>
      <div className='flex flex-col-reverse sm:flex-row justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h2 className='text-2xl font-bold'>
              <Link href={'/' + slug}>{title}</Link>
            </h2>
          </div>
          <div className='max-w-none text-muted-foreground'>{description}</div>
          <div className='flex gap-2 mt-2'>
            {tags?.map((tag) => (
              <Tag tag={tag} key={tag} />
            ))}
          </div>
          <TutorialStatus
            tutorialId={firestoreId}
            exerciseCount={exercises}
            detailed={true}
            className='my-6'
          />
        </div>
        <div className='mb-4 sm:mb-0 overflow-hidden rounded-lg bg-muted'>
          <div className={`relative ${isLoading ? 'animate-pulse' : ''}`}>
            <Image
              src={`/tutorials/${firestoreId}.webp`}
              alt={title}
              width={500} // Increased base width for better quality
              height={300} // Adjusted height to maintain aspect ratio
              onLoad={() => setIsLoading(false)}
              className={`
                w-full        // Full width on mobile
                sm:w-[9rem]   // Specific width on small screens
                md:w-[12rem]  // Slightly larger on medium screens
                lg:w-[15rem]  // Larger on large screens
                xl:w-[18rem]  // Largest on extra large screens
                2xl:w-[20rem] // Even larger for 2xl screens
                object-cover  // Ensures image covers area without distortion
                rounded-lg    // Matching your existing rounded corners
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
