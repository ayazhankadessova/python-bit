// app/layout.tsx
'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { SiteHeader } from '@/components/site-header'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { RecoilRoot } from 'recoil'

const inter = Inter({ subsets: ['latin'], variable: '--font-mono' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='scroll-smooth'>
      <body
        className={cn(
          'min-h-screen bg-background font-mono antialiased',
          inter.variable
        )}
      >
        <Providers>
          <div className='relative flex min-h-dvh flex-col bg-background px-4'>
            <RecoilRoot>
              <AuthProvider>
                <SiteHeader />
                <main className='flex-1'>{children}</main>
                <Toaster />
              </AuthProvider>
            </RecoilRoot>
          </div>
        </Providers>
      </body>
    </html>
  )
}
