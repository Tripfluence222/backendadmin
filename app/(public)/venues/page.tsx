import { Suspense } from 'react';
import { SearchBar } from '@/components/public/SearchBar';
import { Filters } from '@/components/public/Filters';
import { VenueGrid } from '@/components/public/VenueGrid';
import { Map } from '@/components/public/Map';
import { VenueSkeleton } from '@/components/public/Skeletons';

interface VenuesPageProps {
  searchParams: Promise<{
    city?: string;
    priceMin?: string;
    priceMax?: string;
    capacity?: string;
    amenities?: string;
    from?: string;
    to?: string;
    page?: string;
    sort?: string;
    lat?: string;
    lng?: string;
  }>;
}

// Force dynamic rendering to avoid SSR issues with client components
export const dynamic = 'force-dynamic';

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  const params = await searchParams;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Perfect Space</h1>
        <p className="text-muted-foreground text-lg">
          Discover amazing yoga studios, cafés, and unique venues for your events.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar initialValues={params} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Filters searchParams={params} />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Venue Grid */}
            <div>
              <Suspense fallback={<VenueSkeleton />}>
                <VenueGrid searchParams={params} />
              </Suspense>
            </div>

            {/* Map */}
            <div className="hidden xl:block">
              <div className="sticky top-4">
                <Suspense fallback={<div className="h-96 bg-muted rounded-lg animate-pulse" />}>
                  <Map searchParams={params} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
