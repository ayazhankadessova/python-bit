'use client'
import { siteConfig } from '@/config/site'
import Link from 'next/link'
// Initialize the font you want to use

export function MainNav() {
  return (
    <nav className='flex items-center ml-0 min-[750px]:ml-0'>
      <Link href='/'>
        <h4 className='text-md'>{siteConfig.name + " ()"} </h4>
      </Link>
    </nav>
  )
}
