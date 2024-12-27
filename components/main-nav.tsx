'use client'
import { siteConfig } from '@/config/site'
import Link from 'next/link'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
// Initialize the font you want to use
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
})

// Or for a different style, you could use JetBrains Mono
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export function MainNav() {
  return (
    <nav className='flex items-center ml-0 min-[750px]:ml-0'>
      <Link href='/'>
        <h4 className='text-md ${jetbrains.className}'>{siteConfig.name + " ()"} </h4>
      </Link>
    </nav>
  )
}
