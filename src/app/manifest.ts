import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BUKKAPP — Universal Local Booking Marketplace',
    short_name: 'BUKKAPP',
    description: 'Discover trusted local businesses, see real availability, and confirm appointments in minutes in Dehradun.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#111111',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
