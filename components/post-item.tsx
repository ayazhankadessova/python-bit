import Link from 'next/link'
import { Tag } from './ui/tag'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { User } from '@/types/firebase'
import { getTutorialProgress } from '@/components/session-views/helpers'
import { CheckCircle } from 'lucide-react'

interface PostItemProps {
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

export function PostItem({ post, user }: PostItemProps) {
  const { slug, title, description, tags, exercises, firestoreId } = post
  const [progress, setProgress] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (user) {
      getTutorialProgress(user.uid, firestoreId, exercises).then(setProgress)
    }
  }, [user, firestoreId, exercises])

  return (
    <article className='flex-1 flex flex-col gap-2 border-border border-b py-3'>
      <div className='flex flex-col-reverse sm:flex-row justify-between'>
        <div className='flex-1'>
          {user && (
            <div className='flex items-center gap-2'>
              {progress === 100 ? (
                <CheckCircle className='text-green-500' />
              ) : (
                <div className='relative h-6 w-6 mt-1'>
                  <svg className='h-6 w-6' viewBox='0 0 36 36'>
                    <path
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='#E5E7EB'
                      strokeWidth='3'
                    />
                    <path
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='#10B981'
                      strokeWidth='3'
                      strokeDasharray={`${progress}, 100`}
                    />
                  </svg>
                </div>
              )}
              <h2 className='text-2xl font-bold'>
                <Link href={'/' + slug}>{title}</Link>
              </h2>
            </div>
          )}
          {!user && (
            <div className='flex items-center gap-2'>
              <h2 className='text-2xl font-bold'>
                <Link href={'/' + slug}>{title}</Link>
              </h2>
            </div>
          )}
          <div className='max-w-none text-muted-foreground'>{description}</div>
          <div className='flex gap-2 mt-2'>
            {tags?.map((tag) => (
              <Tag tag={tag} key={tag} />
            ))}
          </div>
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

export default PostItem
