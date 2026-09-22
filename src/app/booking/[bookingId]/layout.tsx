import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Boarding Pass & Appointment Ticket',
  description: 'Verified appointment confirmation ticket on BUKKAPP.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
