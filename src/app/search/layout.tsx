import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Verified Local Businesses & Live Slots in Dehradun',
  description:
    'Search and book appointments with verified dentists, salons, sports courts, and home services in Dehradun. Filter by neighborhood, date, and live availability.',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'Search Verified Services in Dehradun | BUKKAPP',
    description: 'Instant local booking with live availability in Dehradun.',
    url: 'https://bukkapp.in/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
