import Image from 'next/image'
import Link from 'next/link'

export function MainNav() {
  return (
    <Link href='/' className='flex items-center space-x-2 rounded-lg'>
      <div className='relative w-[90px] md:w-[110px] pt-1'>
        <Image
          src='/pythonbit-2.png'
          alt='PythonBit Logo'
          width={140}
          height={30}
          className='h-auto w-full transition-all duration-200'
          priority
        />
      </div>
    </Link>
  )
}
