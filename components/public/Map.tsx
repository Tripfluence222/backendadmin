'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface MapProps {
  searchParams: {
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
  };
}

interface Space {
  id: string;
  title: string;
  slug: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  minHourlyRate: number;
}

interface MapData {
  spaces: Space[];
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export function Map({ searchParams }: MapProps) {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
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
          throw new Error('Failed to fetch map data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching map data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="h-96 bg-muted rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (!data || data.spaces.length === 0) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No venues to display on map</p>
      </div>
    );
  }

  // For now, we'll show a simple list of venues with their locations
  // In a real implementation, you'd integrate with MapLibre GL JS or Leaflet
  return (
    <div className="h-96 bg-muted rounded-lg p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Venues on Map</h3>
      <div className="space-y-3">
        {data.spaces.map((space) => (
          <div key={space.id} className="bg-white rounded-lg p-3 shadow-sm">
            <h4 className="font-medium text-sm mb-1">{space.title}</h4>
            <p className="text-xs text-muted-foreground mb-2">
              {space.location.address}
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                From ${space.minHourlyRate / 100}/hr
              </Badge>
              <a
                href={`https://maps.google.com/?q=${space.location.lat},${space.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View on Map
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {data.bbox && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="text-xs text-muted-foreground">
            Map bounds: {data.bbox.south.toFixed(2)}, {data.bbox.west.toFixed(2)} to{' '}
            {data.bbox.north.toFixed(2)}, {data.bbox.east.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
