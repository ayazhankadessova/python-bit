import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MainNav } from './main-nav'
import MobileNav from './ui/mobile-nav'
import { UserMenu } from '@/components/user/user-menu'
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
import { ResponsiveSearch } from '@/components/ui/responsive-search' // Add this import

const activeStyles =
  'bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 text-blue-900 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800 dark:text-white shadow-sm border text-primary font-medium after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary dark:from-blue-900/70 dark:via-blue-800/70 dark:to-blue-900/70 dark:text-white dark:border-blue-700/20 dark:hover:from-blue-800/70 dark:hover:via-blue-700/70 dark:hover:to-blue-800/70'

export function SiteHeader() {
  const pathname = usePathname()
  const headerClass =
    'flex pr-8 pl-2 h-20 z-10 flex-row justify-between gap-2 items-center sticky top-0 bg-popover/80 backdrop-blur mb-4'

  return (
    <header className={headerClass}>
      {/* Desktop Navigation */}
      <div className='hidden min-[950px]:flex items-center gap-4'>
        <MainNav />
        <NavigationMenu className='hidden min-[950px]:inline-flex'>
          <NavigationMenuList className='flex gap-0'>
            {Object.values(headerNavLinks).map((dialog) => (
              <NavigationMenuItem key={dialog.title}>
                {dialog.toggle ? (
                  <>
                    <NavigationMenuTrigger
                      className={cn(
                        'transition-all duration-200 lg:text-lg relative rounded-md',
                        (pathname === dialog.href ||
                          dialog.dropdown?.some(
                            (item) => pathname === item.href
                          )) &&
                          activeStyles
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
                        'transition-all duration-200 lg:text-lg relative rounded-md hover:bg-accent/50',
                        pathname === dialog.href && activeStyles
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
      <div className='min-[950px]:hidden flex items-center justify-between gap-4'>
        <MainNav />
      </div>

      <div className='min-[950px]:hidden flex items-center justify-between gap-2'>
        <ResponsiveSearch />
        <UserMenu />
        <MobileNav />
      </div>

      {/* Desktop Right Section */}
      <div className='hidden min-[950px]:flex items-center gap-4'>
        <ResponsiveSearch />
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
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            pathname === href && activeStyles,
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
