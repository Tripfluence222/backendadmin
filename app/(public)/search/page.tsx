import { Suspense } from 'react';
import { SearchResults } from '@/components/public/SearchResults';
import { SearchSkeleton } from '@/components/public/Skeletons';

interface SearchPageProps {
  searchParams: {
    q?: string;
    city?: string;
    priceMin?: string;
    priceMax?: string;
    capacity?: string;
    amenities?: string;
    page?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        {searchParams.q && (
          <p className="text-muted-foreground">
            Showing results for "{searchParams.q}"
          </p>
        )}
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
