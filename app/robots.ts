import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/venues',
          '/venues/*',
          '/search',
        ],
        disallow: [
          '/admin',
          '/api',
          '/_next',
          '/static',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
