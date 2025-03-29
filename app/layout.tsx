// app/layout.tsx
'use client'
import { Inter } from 'next/font/google'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='scroll-smooth'>
      <body
        className={cn('min-h-screen font-mono antialiased', inter.variable)}
      >
        <Providers>
          <AuthProvider>
            <AuthModalProvider>
              <SiteHeader />
              <div className='relative flex min-h-dvh flex-col'>
                <main className='flex-1 w-full pt-8'>{children}</main>
              </div>
              <AuthModal />
              <Toaster />
              <BlogFooter />
            </AuthModalProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
