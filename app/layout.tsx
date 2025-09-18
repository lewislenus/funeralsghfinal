import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from './error-boundary'
import { BrochureViewerProvider } from '@/components/brochure-viewer-provider'
import '@/lib/init-storage'

export const metadata: Metadata = {
  title: 'damerifa Dua - Honoring Lives, Celebrating Memories',
  description: 'damerifa Dua is a compassionate funeral services platform dedicated to honoring the lives of loved ones and celebrating their cherished memories. Find funeral announcements, share condolences, and support families during their time of need.',
  keywords: 'funeral services, memorial, obituary, condolences, funeral announcements, Ghana funeral, tribute, remembrance, damerifa Dua',
  generator: 'Next.js',
  metadataBase: new URL('https://damerifadua.netlify.app'),
  
  // Open Graph metadata
  openGraph: {
    title: 'damerifa Dua - Honoring Lives, Celebrating Memories',
    description: 'A compassionate platform for funeral services, memorial announcements, and celebrating the lives of our loved ones. Join us in honoring their legacy.',
    url: 'https://damerifadua.netlify.app',
    siteName: 'damerifa Dua',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'damerifa Dua - Funeral Services Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'damerifa Dua - Honoring Lives, Celebrating Memories',
    description: 'A compassionate platform for funeral services and memorial announcements in Ghana.',
    images: ['/og-image.jpg'],
    creator: '@damerifadua',
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Favicon and icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  // Verification tags (add your actual verification codes)
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
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
