import Image from 'next/image'
import Link from 'next/link'

export function MainNav() {
  return (
    <Link href='/' className='flex items-center space-x-2 rounded-lg'>
      <div className='relative w-[100px] md:w-[130px] pt-1'>
        <Image
          src='/pythonbit-teal-yellow.png'
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
