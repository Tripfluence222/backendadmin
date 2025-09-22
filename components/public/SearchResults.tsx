'use client';

import { useEffect, useState } from 'react';
import { VenueCard } from './VenueCard';
import { VenueSkeleton } from './Skeletons';
import { Button } from '@/components/ui/button';

interface SearchResultsProps {
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

interface Space {
  id: string;
  title: string;
  slug: string;
  description: string;
  photos: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  capacity: number;
  floorAreaM2?: number;
  amenities: Array<{
    id: string;
    label: string;
    category?: string;
  }>;
  rules: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
  business: {
    id: string;
    name: string;
    slug: string;
  };
  minHourlyRate: number;
}

interface SearchResponse {
  spaces: Space[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function SearchResults({ searchParams }: SearchResultsProps) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });

        const response = await fetch(`/api/public/space?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);

  if (loading) {
    return <VenueSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!data || data.spaces.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your search criteria or browse all venues.
        </p>
        <Button onClick={() => window.location.href = '/venues'}>
          Browse All Venues
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.pagination.total} result{data.pagination.total !== 1 ? 's' : ''} found
        </p>
        <div className="text-sm text-muted-foreground">
          Page {data.pagination.page} of {data.pagination.pages}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.spaces.map((space) => (
          <VenueCard key={space.id} space={space} />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {data.pagination.page > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', (data.pagination.page - 1).toString());
                window.location.href = `/search?${params.toString()}`;
              }}
            >
              Previous
            </Button>
          )}
          
          {data.pagination.page < data.pagination.pages && (
            <Button
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', (data.pagination.page + 1).toString());
                window.location.href = `/search?${params.toString()}`;
              }}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
