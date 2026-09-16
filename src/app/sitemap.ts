import { MetadataRoute } from 'next';
import { INITIAL_BUSINESSES, INITIAL_CATEGORIES } from '@/lib/seed/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bukkapp.in';

  // Static routes
  const staticRoutes = [
    '',
    '/search',
    '/terms',
    '/privacy',
    '/business-terms',
    '/cancellation-policy',
    '/review-policy',
    '/faq',
    '/support',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Category routes
  const categoryRoutes = INITIAL_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Business routes
  const businessRoutes = INITIAL_BUSINESSES.map((biz) => ({
    url: `${baseUrl}/business/${biz.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.95,
  }));

  return [...staticRoutes, ...categoryRoutes, ...businessRoutes];
}
