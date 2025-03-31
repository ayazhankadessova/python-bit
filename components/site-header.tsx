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
import { ResponsiveSearch } from '@/components/ui/responsive-search'

const activeStyles =
  'bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 text-purple-900 dark:from-purple-800 dark:via-purple-700 dark:to-purple-800 dark:text-white shadow-sm border text-primary font-medium after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary dark:from-purple-900/70 dark:via-purple-800/70 dark:to-purple-900/70 dark:text-white dark:border-purple-700/20 dark:hover:from-purple-800/70 dark:hover:via-purple-700/70 dark:hover:to-purple-800/70'

const isPathActive = (currentPath: string, href: string) => {
  if (href === '/') return currentPath === href
  // Split both paths and compare the first segment
  const currentSegment = currentPath.split('/')[1]
  const hrefSegment = href.split('/')[1]
  return currentSegment === hrefSegment
}

export function SiteHeader() {
  const pathname = usePathname()
  const headerClass =
    'sticky top-0 z-50 w-full border-b border-border/40 bg-background'

  return (
    <header className={headerClass}>
      {/* Desktop Navigation */}
      <div className='flex w-full h-20 items-center justify-between xl:px-24 lg:px-16 md:px-8 sm:px-8'>
        {/* Your existing header content */}
        <div className='hidden min-[850px]:flex items-center gap-4'>
          <MainNav />
          <NavigationMenu className='hidden min-[850px]:inline-flex'>
            <NavigationMenuList className='flex gap-0'>
              {Object.values(headerNavLinks).map((dialog) => (
                <NavigationMenuItem key={dialog.title}>
                  {dialog.toggle ? (
                    <>
                      <NavigationMenuTrigger
                        className={cn(
                          'transition-all duration-200 lg:text-lg relative rounded-md',
                          (isPathActive(pathname, dialog.href) ||
                            dialog.dropdown?.some((item) =>
                              isPathActive(pathname, item.href)
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
                          isPathActive(pathname, dialog.href) && activeStyles
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

        {/* Right Section with Responsive Search */}
        <div className='flex items-center gap-2 min-[850px]:gap-4'>
          <ResponsiveSearch />
          <div className='hidden min-[850px]:flex items-center gap-4'>
            <UserMenu />
            <ThemeToggle />
          </div>
          <div className='min-[850px]:hidden'>
            <MobileNav />
          </div>
        </div>
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
            isPathActive(pathname, href ?? '') && activeStyles,
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
