import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { VenueDetail } from '@/components/public/VenueDetail';
import { VenueDetailSkeleton } from '@/components/public/Skeletons';
import { db } from '@/lib/db';
import { getMinHourlyRate } from '@/lib/space/pricing';

interface VenueDetailPageProps {
  params: {
    city: string;
    slug: string;
  };
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const space = await db.space.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED',
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
          domain: true,
        },
      },
      _count: {
        select: {
          requests: {
            where: {
              status: 'CONFIRMED',
            },
          },
        },
      },
    },
  });

  if (!space) {
    notFound();
  }

  // Calculate min hourly rate
  const minHourlyRate = getMinHourlyRate(space.pricingRules);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<VenueDetailSkeleton />}>
        <VenueDetail space={{ ...space, minHourlyRate }} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: VenueDetailPageProps) {
  const space = await db.space.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED',
    },
    include: {
      business: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!space) {
    return {
      title: 'Venue Not Found',
    };
  }

  const city = (space.location as any)?.address?.split(',')[1]?.trim() || 'Unknown';
  const title = `${space.title} - ${city} | Tripfluence`;
  const description = space.description.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: space.photos.length > 0 ? [space.photos[0]] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: space.photos.length > 0 ? [space.photos[0]] : [],
    },
  };
}
