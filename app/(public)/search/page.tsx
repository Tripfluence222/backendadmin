import { Suspense } from 'react';
import { SearchResults } from '@/components/public/SearchResults';
import { SearchSkeleton } from '@/components/public/Skeletons';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    priceMin?: string;
    priceMax?: string;
    capacity?: string;
    amenities?: string;
    page?: string;
  }>;
}

// Force dynamic rendering to avoid SSR issues with client components
export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        {params.q && (
          <p className="text-muted-foreground">
            Showing results for "{params.q}"
          </p>
        )}
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults searchParams={params} />
      </Suspense>
    </div>
  );
}
