'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Coffee, Music, Monitor } from 'lucide-react';
import { formatPrice } from '@/lib/space/pricing';

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

interface VenueCardProps {
  space: Space;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi,
  'Coffee Machine': Coffee,
  'Sound System': Music,
  'Audio System': Music,
  'Projector': Monitor,
};

export function VenueCard({ space }: VenueCardProps) {
  const primaryPhoto = space.photos[0] || '/placeholder-venue.jpg';
  const city = space.location.address.split(',')[1]?.trim() || 'Unknown';
  
  // Get top 3 amenities for display
  const topAmenities = space.amenities.slice(0, 3);
  
  return (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <Image
          src={primaryPhoto}
          alt={space.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-black">
            From {formatPrice(space.minHourlyRate)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
            {space.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{city}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {space.description}
        </p>

        {/* Amenities */}
        {topAmenities.length > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            {topAmenities.map((amenity) => {
              const IconComponent = amenityIcons[amenity.label];
              return (
                <div key={amenity.id} className="flex items-center space-x-1">
                  {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground">
                    {amenity.label}
                  </span>
                </div>
              );
            })}
            {space.amenities.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{space.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Capacity and Area */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>{space.capacity} guests</span>
          </div>
          {space.floorAreaM2 && (
            <div className="text-sm text-muted-foreground">
              {space.floorAreaM2}m²
            </div>
          )}
        </div>

        {/* Host */}
        <div className="text-sm text-muted-foreground mb-4">
          Hosted by <span className="font-medium">{space.business.name}</span>
        </div>

        {/* Action Button */}
        <Link href={`/venues/${city.toLowerCase().replace(/\s+/g, '-')}/${space.slug}`}>
          <Button className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
