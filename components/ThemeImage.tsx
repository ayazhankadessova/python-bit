// components/ThemeImage.tsx
import Image from 'next/image'
import { useState } from 'react'

interface ThemeImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}

export function ThemeImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: ThemeImageProps) {
  const [isLoading, setLoading] = useState(true)

  return (
      <div className='overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 relative block h-[220px] w-full'>
        <Image
          src={`/themes/${src}`}
          alt='image'
          fill
          style={{ objectFit: 'cover' }}
          onLoad={() => setLoading(false)}
          className={`
          duration-700 ease-in-out
          ${
            isLoading
              ? 'scale-110 blur-2xl grayscale'
              : 'scale-100 blur-0 grayscale-0'
          }
        `}
        />
      </div>
  )
}