import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#111111',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bukkapp.in'),
  title: {
    default: 'BUKKAPP - Universal Local Booking Marketplace',
    template: '%s | BUKKAPP',
  },
  description:
    'Discover trusted local businesses, see real-time availability, and book appointments in minutes. Dentists, salons, pickleball, AC repair, detailing and more in Dehradun.',
  keywords: [
    'booking marketplace',
    'local appointments',
    'dehradun dentists',
    'pickleball court dehradun',
    'salon booking dehradun',
    'ac service dehradun',
    'bukkapp',
  ],
  authors: [{ name: 'BUKKAPP Technologies' }],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-dark.png', type: 'image/png', sizes: '32x32', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon-light.png', type: 'image/png', sizes: '32x32', media: '(prefers-color-scheme: light)' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'BUKKAPP - Everything you need Booked.',
    description: 'Universal local booking marketplace with real-time availability in Dehradun.',
    type: 'website',
    url: 'https://bukkapp.in',
    siteName: 'BUKKAPP',
    images: [
      {
        url: '/logos/primary-wordmark.png',
        width: 1497,
        height: 371,
        alt: 'BUKKAPP Official Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BUKKAPP - Everything you need Booked.',
    description: 'Universal local booking marketplace with real-time availability in Dehradun.',
    images: ['/logos/primary-wordmark.png'],
  },
};

import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import 'lenis/dist/lenis.css';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://bukkapp.in/#website',
      url: 'https://bukkapp.in',
      name: 'BUKKAPP',
      description: 'Universal Local Booking Marketplace in Dehradun',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://bukkapp.in/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://bukkapp.in/#organization',
      name: 'BUKKAPP Technologies',
      url: 'https://bukkapp.in',
      logo: 'https://bukkapp.in/logos/primary-wordmark.png',
    },
  ],
};

import { Preloader } from '@/components/ui/Preloader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} font-sans`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111111] font-sans antialiased">
        <Preloader />
        <SmoothScrollProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <div className="flex-1 pb-16 md:pb-0">{children}</div>
              <Footer />
              <MobileBottomNav />
            </ToastProvider>
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
