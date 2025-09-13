'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, ArrowRight } from 'lucide-react';
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

interface CityLandingProps {
  cityName: string;
  spaces: Space[];
}

export function CityLanding({ cityName, spaces }: CityLandingProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Yoga & Café Spaces to Rent in {cityName}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Discover amazing venues in {cityName} perfect for your yoga classes, workshops, 
          and special events. From intimate studios to spacious cafés, find the ideal space for your gathering.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href={`/venues?city=${cityName}`}>
              Browse All Venues
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/admin">
              List Your Space
            </Link>
          </Button>
        </div>
      </div>

      {/* Featured Spaces */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Spaces in {cityName}</h2>
          <Button variant="outline" asChild>
            <Link href={`/venues?city=${cityName}`}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((space) => (
            <Card key={space.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img
                  src={space.photos[0] || '/placeholder-venue.jpg'}
                  alt={space.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    From {formatPrice(space.minHourlyRate)}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{space.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {space.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="line-clamp-1">
                    {space.location.address.split(',')[0]}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{space.capacity} guests</span>
                  </div>
                  {space.floorAreaM2 && (
                    <span className="text-sm text-muted-foreground">
                      {space.floorAreaM2}m²
                    </span>
                  )}
                </div>

                <Button asChild className="w-full">
                  <Link href={`/venues/${cityName.toLowerCase().replace(/\s+/g, '-')}/${space.slug}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Why Choose This City */}
      <div className="bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Why Choose {cityName} for Your Event?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Diverse Venues</h3>
            <p className="text-sm text-muted-foreground">
              From modern yoga studios to charming cafés, {cityName} offers a variety of spaces to suit any event.
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2">Easy Access</h3>
            <p className="text-sm text-muted-foreground">
              Well-connected location with convenient transportation options for your guests.
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2">Trusted Hosts</h3>
            <p className="text-sm text-muted-foreground">
              All venues are hosted by verified local businesses with excellent reviews.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Book Your Space in {cityName}?
        </h2>
        <p className="text-muted-foreground mb-6">
          Join hundreds of event organizers who have found their perfect venue in {cityName}.
        </p>
        <Button asChild size="lg">
          <Link href={`/venues?city=${cityName}`}>
            Start Your Search
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
