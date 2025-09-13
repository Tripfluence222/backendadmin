import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Wifi, Coffee, Music, Monitor, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect
            <span className="text-primary"> Space</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover and book amazing yoga studios, cafés, and unique venues for your events. 
            From intimate gatherings to large workshops.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/venues">
                Browse Venues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/admin">
                Host Your Space
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Tripfluence?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make it easy to find and book the perfect space for your event, 
              whether you're hosting a yoga class, workshop, or special gathering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Discover Amazing Spaces</CardTitle>
                <CardDescription>
                  Browse curated yoga studios, cafés, and unique venues in your area.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Booking Process</CardTitle>
                <CardDescription>
                  Request to book with just a few clicks. Hosts respond within 24 hours.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Trusted Hosts</CardTitle>
                <CardDescription>
                  All spaces are verified and hosted by trusted local businesses.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Amenities */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Amenities</h2>
            <p className="text-muted-foreground">
              Find spaces with the features you need for your event.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Wifi, label: 'WiFi' },
              { icon: Coffee, label: 'Coffee Machine' },
              { icon: Music, label: 'Sound System' },
              { icon: Monitor, label: 'Projector' },
            ].map((amenity, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <amenity.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{amenity.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Space?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who have found their perfect venue on Tripfluence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/venues">
                Start Searching
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
      </section>
    </div>
  );
}
