import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Anton, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TheNerdLoop — Join the Waitlist",
  description: "Be one of the first 100 people to enter TheNerdLoop.",
  generator: "v0.app",
  openGraph: {
    title: "TheNerdLoop — Join the Waitlist",
    description: "Be one of the first 100 people to enter TheNerdLoop.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheNerdLoop — Join the Waitlist",
    description: "Be one of the first 100 people to enter TheNerdLoop.",
  },
}

export const viewport: Viewport = {
  themeColor: "#FFE900",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${jetbrainsMono.variable} bg-tnl-yellow`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
