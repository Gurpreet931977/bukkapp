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
  title: 'BUKKAPP — Universal Local Booking Marketplace',
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
  openGraph: {
    title: 'BUKKAPP — Everything you need. Booked.',
    description: 'Universal local booking marketplace with real-time availability in Dehradun.',
    type: 'website',
    url: 'https://bukkapp.in',
  },
};

import { ToastProvider } from '@/components/ui/Toast';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} font-sans scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111111] font-sans antialiased">
        <ToastProvider>
          <Navbar />
          <div className="flex-1 pb-16 md:pb-0">{children}</div>
          <Footer />
          <MobileBottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
