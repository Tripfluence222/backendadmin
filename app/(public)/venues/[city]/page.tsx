import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CityLanding } from '@/components/public/CityLanding';
import { VenueSkeleton } from '@/components/public/Skeletons';
import { db } from '@/lib/db';
import { getMinHourlyRate } from '@/lib/space/pricing';

interface CityPageProps {
  params: {
    city: string;
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const cityName = params.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Get featured spaces for this city
  const spaces = await db.space.findMany({
    where: {
      status: 'PUBLISHED',
      location: {
        path: ['address'],
        string_contains: cityName,
      },
    },
    include: {
      amenities: true,
      rules: true,
      pricingRules: true,
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  if (spaces.length === 0) {
    notFound();
  }

  // Calculate min hourly rates
  const spacesWithPricing = spaces.map(space => ({
    ...space,
    minHourlyRate: getMinHourlyRate(space.pricingRules),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<VenueSkeleton />}>
        <CityLanding cityName={cityName} spaces={spacesWithPricing} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: CityPageProps) {
  const cityName = params.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `Yoga & Café Spaces to Rent in ${cityName} | Tripfluence`,
    description: `Discover amazing yoga studios, cafés, and unique venues for rent in ${cityName}. Book your perfect event space today.`,
    openGraph: {
      title: `Yoga & Café Spaces to Rent in ${cityName}`,
      description: `Discover amazing yoga studios, cafés, and unique venues for rent in ${cityName}. Book your perfect event space today.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Yoga & Café Spaces to Rent in ${cityName}`,
      description: `Discover amazing yoga studios, cafés, and unique venues for rent in ${cityName}. Book your perfect event space today.`,
    },
  };
}
