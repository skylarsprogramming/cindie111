import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cindie - Learn English & German Online',
  description: 'Interactive courses and practice exercises to learn English and German from A1 to C1.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-dark-300">
          <Navigation />
          <main className="pt-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
