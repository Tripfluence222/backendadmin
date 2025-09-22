'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Users, 
  Wifi, 
  Coffee, 
  Music, 
  Monitor, 
  Sun, 
  Car,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { formatPrice } from '@/lib/space/pricing';
import { RequestToBook } from './RequestToBook';

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
    domain?: string;
  };
  minHourlyRate: number;
  _count: {
    requests: number;
  };
}

interface VenueDetailProps {
  space: Space;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi,
  'Coffee Machine': Coffee,
  'Sound System': Music,
  'Audio System': Music,
  'Projector': Monitor,
  'Natural Light': Sun,
  'Parking': Car,
};

export function VenueDetail({ space }: VenueDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const city = space.location.address.split(',')[1]?.trim() || 'Unknown';

  // Group amenities by category
  const amenitiesByCategory = space.amenities.reduce((acc, amenity) => {
    const category = amenity.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, typeof space.amenities>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{space.title}</h1>
        <div className="flex items-center space-x-4 text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{space.location.address}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>Up to {space.capacity} guests</span>
          </div>
          {space.floorAreaM2 && (
            <span>{space.floorAreaM2}m²</span>
          )}
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
          <Image
            src={space.photos[selectedPhotoIndex] || '/placeholder-venue.jpg'}
            alt={space.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {space.photos.slice(0, 4).map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedPhotoIndex(index)}
              className={`relative h-20 md:h-24 rounded-lg overflow-hidden ${
                selectedPhotoIndex === index ? 'ring-2 ring-primary' : ''
              }`}
            >
              <Image
                src={photo}
                alt={`${space.title} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About this space</h2>
            <p className="text-muted-foreground leading-relaxed">
              {space.description}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="space-y-4">
              {Object.entries(amenitiesByCategory).map(([category, amenities]) => (
                <div key={category}>
                  <h3 className="font-medium mb-2">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {amenities.map((amenity) => {
                      const IconComponent = amenityIcons[amenity.label];
                      return (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          {IconComponent ? (
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{amenity.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          {space.rules.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">House Rules</h2>
              <div className="space-y-2">
                {space.rules.map((rule) => (
                  <div key={rule.id} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {rule.label}
                      {rule.required && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Required
                        </Badge>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Hosted by {space.business.name}</h2>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <span className="font-semibold text-lg">
                  {space.business.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium">{space.business.name}</p>
                <p className="text-sm text-muted-foreground">
                  {space._count.requests} successful bookings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {formatPrice(space.minHourlyRate)}
                </CardTitle>
                <span className="text-sm text-muted-foreground">per hour</span>
              </div>
            </CardHeader>
            <CardContent>
              <RequestToBook spaceId={space.id} />
              
              <Separator className="my-4" />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span>{space.capacity} guests</span>
                </div>
                {space.floorAreaM2 && (
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span>{space.floorAreaM2}m²</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Bookings:</span>
                  <span>{space._count.requests}</span>
                </div>
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href={`https://maps.google.com/?q=${space.location.lat},${space.location.lng}`} target="_blank">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                
                {space.business.domain && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`https://${space.business.domain}`} target="_blank">
                      Visit Host Website
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
