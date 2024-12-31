import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ProgressProvider } from './context/ProgressContext'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Document Upload Application',
  description: 'A modern, sleek, and responsive document upload application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <ProgressProvider>
          <main className="container mx-auto px-4 py-8 max-w-2xl">
            {children}
          </main>
          <Toaster />
        </ProgressProvider>
      </body>
    </html>
  )
}

