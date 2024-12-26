import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'
import { Tag } from './ui/tag'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { User } from '@/utils/types/firebase'
import { getTutorialProgress } from '@/components/session-views/helpers'
import { CheckCircle } from 'lucide-react'

interface PostItemProps {
  post: {
    slug: string
    title: string
    description?: string
    date: number
    tags?: Array<string>
    image: string
    exercises: number
    firestoreId: string

  }
  user: User | null 
}

export function PostItem({ post, user }: PostItemProps) {
  const {
    slug,
    title,
    description,
    date,
    tags,
    image,
    exercises,
    firestoreId,
  } = post
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    if (user) {
      getTutorialProgress(
        user.uid,
        firestoreId,
        exercises
      ).then(setProgress)
    }
  }, [user])

  return (
    <article className='flex-1 flex flex-col gap-2 border-border border-b py-3'>
      <div className='flex flex-col-reverse sm:flex-row justify-between'>
        <div className='flex-1'>
          {user && (
            <div className='flex items-center gap-2'>
              {progress === 100 ? (
                <CheckCircle color='green' />
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
        <div>
          <Image
            src={image}
            alt=''
            className='rounded-lg sm:w-[9rem] xl:w-full p-1'
            width={300}
            height={100}
          />
        </div>
      </div>
    </article>
  )
}
