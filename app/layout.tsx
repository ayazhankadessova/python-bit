import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { SiteHeader } from '@/components/site-header'
// import { BlogFooter } from '@/components/footer'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'PythonBit | Blog',
  description: 'Read articles by PythonBit',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className={`scroll-smooth`}>
      <body
        className={
          (cn('min-h-screen bg-background font-mono antialiased'),
          inter.variable)
        }
      >
        <Providers>
          <div className='relative flex min-h-dvh flex-col bg-background px-4'>
            <SiteHeader />
            <main className='flex-1'>{children}</main>
            {/* <BlogFooter /> */}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}
