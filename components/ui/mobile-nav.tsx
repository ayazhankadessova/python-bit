"use client"
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from './sheet'
import { Button } from './button'
import { Menu, User, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { siteConfig } from '@/config/site'
import headerNavLinks from '@/config/headerNavLinks'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const MobileNav = () => {
  const [open, setOpen] = useState(false)
  
  const { user, signOut } = useAuth()
  const { onOpen } = useAuthModal()

  const onToggleNav = () => {
    setOpen((status) => !status)
  }

  return (
    <Sheet open={open} onOpenChange={onToggleNav}>
      <ThemeToggle />
      <SheetTrigger asChild>
        <Button variant='ghost' className='ml-2 pr-0 min-[950px]:hidden'>
          <Menu className='h-6 w-6' />
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='flex flex-col'>
        <div className='flex flex-col gap-4'>
          <MobileLink
            href='/'
            onOpenChange={onToggleNav}
            className='flex items-center'
          >
            <span className='font-bold'>{siteConfig.name}</span>
          </MobileLink>
          <div className='flex flex-col gap-3'>
            {Object.values(headerNavLinks).map((dialog) => (
              <MobileLink
                key={dialog.title}
                onOpenChange={onToggleNav}
                href={dialog.href}
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                {dialog.title}
              </MobileLink>
            ))}
          </div>
        </div>

        {/* User section at top */}
        <div className='flex flex-col space-y-4 mb-6'>
          {user ? (
            <>
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={'/tutorials/python101-1-what-is-python.webp'}
                    alt={user.displayName || 'User avatar'}
                  />
                  <AvatarFallback>
                    {user.displayName
                      ? user.displayName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='font-normal'>
                    {user.displayName || 'User'}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {user.email}
                  </span>
                </div>
              </div>
              <div className='flex flex-col space-y-2'>
                <MobileLink
                  href='/dashboard'
                  onOpenChange={onToggleNav}
                  className='flex items-center space-x-2'
                >
                  <User className='h-4 w-4' />
                  <span>Dashboard</span>
                </MobileLink>
                <MobileLink
                  href='/settings'
                  onOpenChange={onToggleNav}
                  className='flex items-center space-x-2'
                >
                  <Settings className='h-4 w-4' />
                  <span>Settings</span>
                </MobileLink>
                <Button
                  variant='ghost'
                  className='justify-start px-2'
                  onClick={() => {
                    signOut()
                    onToggleNav()
                  }}
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  <span>Log out</span>
                </Button>
              </div>
            </>
          ) : (
            <div className='flex flex-col space-y-2'>
              <Button
                variant='default'
                onClick={() => {
                  onOpen('login')
                  onToggleNav()
                }}
              >
                Log in
              </Button>
              <Button
                variant='softBlue'
                onClick={() => {
                  onOpen('register')
                  onToggleNav()
                }}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps {
  href: string
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

function MobileLink({ href, onOpenChange, children, className }: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={className}
    >
      {children}
    </Link>
  )
}

export default MobileNav