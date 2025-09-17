import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from './error-boundary'
import { BrochureViewerProvider } from '@/components/brochure-viewer-provider'
import '@/lib/init-storage'

export const metadata: Metadata = {
  title: 'damarifadue',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <BrochureViewerProvider>
            {children}
            <Toaster />
          </BrochureViewerProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
