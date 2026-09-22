import type { Metadata } from 'next';
import { INITIAL_BUSINESSES } from '@/lib/seed/data';

interface Props {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const biz = INITIAL_BUSINESSES.find((b) => b.slug === params.slug);

  if (!biz) {
    return {
      title: 'Business Storefront',
      description: 'Book verified local appointments in Dehradun.',
    };
  }

  return {
    title: `${biz.name} - Book Appointments Online`,
    description: `${biz.tagline || biz.description} Real-time availability, instant slot confirmation, and verified reviews at ${biz.address}, ${biz.neighborhood}, Dehradun.`,
    alternates: {
      canonical: `/business/${biz.slug}`,
    },
    openGraph: {
      title: `${biz.name} | BUKKAPP Dehradun`,
      description: biz.tagline || biz.description,
      url: `https://bukkapp.in/business/${biz.slug}`,
      images: [
        {
          url: biz.coverImage,
          width: 1200,
          height: 630,
          alt: biz.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${biz.name} | BUKKAPP`,
      description: biz.tagline,
      images: [biz.coverImage],
    },
  };
}

export default function BusinessProfileLayout({ children, params }: Props) {
  const biz = INITIAL_BUSINESSES.find((b) => b.slug === params.slug);

  const localBusinessJsonLd = biz
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: biz.name,
        description: biz.description,
        image: biz.coverImage,
        telephone: biz.phone,
        email: biz.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: biz.address,
          addressLocality: biz.neighborhood,
          addressRegion: 'Uttarakhand',
          addressCountry: 'IN',
          postalCode: biz.postalCode,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: biz.latitude,
          longitude: biz.longitude,
        },
        url: `https://bukkapp.in/business/${biz.slug}`,
        priceRange: '₹₹',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: biz.rating,
          reviewCount: biz.reviewCount,
        },
      }
    : null;

  return (
    <>
      {localBusinessJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
