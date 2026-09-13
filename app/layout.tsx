import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Anton, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = { title: 'TheNerdLoop — Fan-made objects for the long way home', description: 'Small-batch graphic masks and collectible objects for people who read the side quests.', generator: 'TheNerdLoop' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#ffffff', userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${anton.variable} ${jetbrains.variable} bg-background`}><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
