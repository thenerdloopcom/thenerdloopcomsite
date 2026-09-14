import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Anton, JetBrains_Mono } from 'next/font/google'
import './globals.css'

import { Providers } from './providers'
import { SiteHeader } from '@/components/storefront/site-header'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import { SiteFooter } from '@/components/storefront/site-footer'

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'TheNerdLoop — Fan-made objects for the long way home',
  description:
    'Small-batch graphic masks and collectible objects for people who read the side quests.',
  generator: 'TheNerdLoop',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fff4a8',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${jetbrains.variable}`}>
      <body className="antialiased">
        <Providers>
          <SiteHeader />
          <CartDrawer />
          {children}
          <SiteFooter />
        </Providers>

        {process.env.NODE_ENV === 'production' && <Analytics />}

        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </body>
    </html>
  )
}