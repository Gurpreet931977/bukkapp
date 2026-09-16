import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/business/dashboard', '/business/bookings', '/business/calendar', '/business/settings'],
    },
    sitemap: 'https://bukkapp.in/sitemap.xml',
  };
}
