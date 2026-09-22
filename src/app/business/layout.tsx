import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Business Console',
  description: 'Manage your appointments, service catalog, working hours, and customer reviews on BUKKAPP.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BusinessLayoutWrapper({ children }: { children: React.ReactNode }) {
  return children;
}
