import type { Metadata } from 'next';
import { INITIAL_CATEGORIES } from '@/lib/seed/data';

interface Props {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = INITIAL_CATEGORIES.find((c) => c.slug === params.slug);

  if (!cat) {
    return {
      title: 'Service Category',
      description: 'Explore verified local businesses in Dehradun.',
    };
  }

  return {
    title: `${cat.name} in Dehradun - Book Appointments Online`,
    description: `Find top-rated ${cat.name.toLowerCase()} in Dehradun. ${cat.description} Real-time slots, verified reviews, transparent pricing.`,
    alternates: {
      canonical: `/category/${cat.slug}`,
    },
    openGraph: {
      title: `${cat.name} in Dehradun | BUKKAPP`,
      description: cat.description,
      url: `https://bukkapp.in/category/${cat.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cat.name} in Dehradun | BUKKAPP`,
      description: cat.description,
    },
  };
}

export default function CategoryLayout({ children }: Props) {
  return children;
}
