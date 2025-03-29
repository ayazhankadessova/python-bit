import { siteConfig } from '@/config/site'
import { Icons } from './icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BlogFooter() {

  const pathname = usePathname()

  if (pathname.startsWith('/quizzes/')) {
    return null
  }

  return (
    <footer className='flex flex-col gap-4 items-center justify-center pb-8 container'>
      <div className='mb-6 mt-14 flex flex-col items-center'>
        <div className='mb-3 flex gap-8'>
          <a target='_blank' rel='noreferrer' href={siteConfig.socials.discord}>
            <span className='sr-only'>Discord</span>
            <Icons.Discord />
          </a>
          <a
            target='_blank'
            rel='noreferrer'
            href={siteConfig.socials.linkedin}
          >
            <span className='sr-only'>Linkedin</span>
            <Icons.Linkedin />
          </a>
          <a target='_blank' rel='noreferrer' href={siteConfig.socials.youtube}>
            <span className='sr-only'>YouTube</span>
            <Icons.Youtube />
          </a>
          <a target='_blank' rel='noreferrer' href={siteConfig.socials.twitter}>
            <span className='sr-only'>Twitter</span>
            <Icons.Twitter />
          </a>
          <a target='_blank' rel='noreferrer' href={siteConfig.socials.discord}>
            <span className='sr-only'>Medium</span>
            <Icons.Medium />
          </a>
        </div>
        <p className='mt-2 text-sm font-light'>
          © 2025 PythonBit, all rights reserved
        </p>
        <div className='mt-2 flex gap-x-4 gap-y-2 text-xs text-muted-foreground items-center justify-center underline flex-wrap lg:gap-x-6'>
          <Link href='/terms-of-use' className='mr-2'>
            <p className='underline text-sm text-gray-500'>Terms of Use</p>
          </Link>
          <Link href='/subscription-agreement' className='mr-2'>
            <p className='underline text-sm text-gray-500'>
              Subscription Agreement
            </p>
          </Link>
          <Link href='/privacy-policy'>
            <p className='underline text-sm text-gray-500'>Privacy Policy</p>
          </Link>
        </div>
      </div>
    </footer>
  )
}
