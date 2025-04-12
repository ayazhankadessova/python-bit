import Image from 'next/image'
import { useState } from 'react'

interface ThemeImageProps {
  readonly src: string
  readonly alt: string
}

export function ThemeImage({
  src,
  alt
}: ThemeImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className='overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 relative block h-[220px] w-full'>
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
        onLoad={() => setIsLoading(false)}
        className={`
          ${
            isLoading
              ? 'duration-700 ease-in-outscale-110 blur-2xl grayscale'
              : ''
          }
        `}
      />
    </div>
  )
}