import Image from 'next/image'

interface ThemeImageProps {
  readonly src: string
  readonly alt: string
}

export function ThemeImage({ src, alt }: ThemeImageProps) {

  return (
    <div className='overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 relative block h-[220px] w-full'>
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
