import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MainNav } from './main-nav'
import MobileNav from './ui/mobile-nav'
import { UserMenu } from '@/components/user/user-menu'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from './ui/theme-toggle'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu'
import headerNavLinks from '@/config/headerNavLinks'
import { ChevronDown } from 'lucide-react'

export function SiteHeader() {
  const pathname = usePathname()
  const headerClass =
    'container flex max-w-screen-2xl px-6 h-20 z-10 flex flex-row justify-between gap-2 items-center sticky top-0 bg-popover mb-4'

  return (
    <header className={headerClass}>
      {/* Desktop Navigation */}
      <div className='hidden min-[850px]:flex items-center gap-4'>
        <MainNav />
        <NavigationMenu className='hidden sm:inline-flex'>
          <NavigationMenuList>
            {Object.values(headerNavLinks).map((dialog) => (
              <NavigationMenuItem key={dialog.title}>
                {dialog.toggle ? (
                  <>
                    <NavigationMenuTrigger
                      className={cn(
                        'transition-colors lg:text-lg relative',
                        (pathname === dialog.href ||
                          dialog.dropdown?.some(
                            (item) => pathname === item.href
                          )) && [
                          'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary',
                          'bg-gradient-to-r from-[hsl(var(--background-start))] to-[hsl(var(--background-end))]',
                        ]
                      )}
                    >
                      {dialog.title}
                      <ChevronDown
                        className='relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180'
                        aria-hidden='true'
                      />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className='grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
                        {dialog.dropdown?.map((component) => (
                          <ListItem
                            key={component.title}
                            title={component.title}
                            href={component.href}
                          >
                            {component.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link href={dialog.href}>
                    <NavigationMenuTrigger
                      className={cn(
                        'transition-colors lg:text-lg relative',
                        pathname === dialog.href && [
                          'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary',
                          'bg-gradient-to-r from-[hsl(var(--background-start))] to-[hsl(var(--background-end))]',
                        ]
                      )}
                    >
                      {dialog.title}
                    </NavigationMenuTrigger>
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation */}
      <div className='min-[850px]:hidden flex items-center justify-between gap-4'>
        <MainNav />
      </div>

      <div className='min-[850px]:hidden flex items-center justify-between gap-2'>
        <Input type='search' placeholder='Search' />
        <UserMenu />
        <MobileNav />
      </div>

      {/* Desktop Right Section */}
      <div className='hidden min-[850px]:flex items-center gap-4'>
        <Input type='search' placeholder='Search' className='w-64' />
        <UserMenu />
        <ThemeToggle />
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { href?: string }
>(({ className, title, children, href, ...props }, ref) => {
  const pathname = usePathname()

  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          href={href}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            pathname === href && [
              'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary',
              'bg-gradient-to-r from-[hsl(var(--background-start))] to-[hsl(var(--background-end))]',
            ],
            className
          )}
          {...props}
        >
          <div className='text-base font-medium leading-none'>{title}</div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'
