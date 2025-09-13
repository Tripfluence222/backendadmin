import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Get all published spaces
  const spaces = await db.space.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: {
      slug: true,
      location: true,
      updatedAt: true,
    },
  });

  // Get unique cities from spaces
  const cities = [...new Set(
    spaces
      .map(space => {
        const location = space.location as any;
        return location?.address?.split(',')[1]?.trim();
      })
      .filter(Boolean)
  )];

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/venues`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Add city pages
  cities.forEach(city => {
    if (city) {
      sitemap.push({
        url: `${baseUrl}/venues/${city.toLowerCase().replace(/\s+/g, '-')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  });

  // Add space detail pages
  spaces.forEach(space => {
    const location = space.location as any;
    const city = location?.address?.split(',')[1]?.trim();
    
    if (city) {
      sitemap.push({
        url: `${baseUrl}/venues/${city.toLowerCase().replace(/\s+/g, '-')}/${space.slug}`,
        lastModified: space.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  });

  return sitemap;
}
