'use client'
import { Inter, Luckiest_Guy, Maven_Pro, Open_Sans } from 'next/font/google' // Import fonts
import './globals.css'
import { cn } from '@/lib/utils'
import { SiteHeader } from '@/components/site-header'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthModalProvider } from '@/contexts/AuthModalContext'
import { BlogFooter } from '@/components/ui/footer'
import AuthModal from '@/components/AuthModal'

const inter = Inter({ subsets: ['latin'], variable: '--font-mono' })
const luckiestGuy = Luckiest_Guy({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-luckiest-guy',
})
const mavenPro = Maven_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-maven-pro',
})
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-open-sans',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='scroll-smooth light' style= {{colorScheme: 'light'}}>
      <body
        className={cn('min-h-screen antialiased', inter.variable, luckiestGuy.variable, mavenPro.variable, openSans.variable)}
      >
        <Providers>
          <AuthProvider>
            <AuthModalProvider>
              <SiteHeader />
              <div className='relative flex flex-col'>
                <main className='flex-1 w-full pt-8'>{children}</main>
              </div>
              <AuthModal />
              <Toaster />
              <div className='relative flex flex-col'>
                <BlogFooter />
              </div>
            </AuthModalProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
