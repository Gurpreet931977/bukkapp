import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account & Bookings',
  description: 'Manage your verified appointments, digital boarding passes, and saved local businesses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
