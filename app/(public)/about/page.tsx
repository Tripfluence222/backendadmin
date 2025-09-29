import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Tripfluence',
  description: 'Learn about Tripfluence and our mission to connect people with amazing spaces.',
};

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Tripfluence</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground mb-8">
            We&apos;re on a mission to make amazing spaces accessible to everyone, 
            whether you&apos;re hosting a yoga class, planning a workshop, or organizing a community event.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-muted-foreground">
                Founded in 2024, Tripfluence was born from the simple idea that great experiences 
                happen in great spaces. We noticed that finding the perfect venue for events, 
                workshops, and gatherings was unnecessarily complicated and expensive.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To democratize access to amazing spaces and empower communities to come together. 
                We believe that every event, no matter how small, deserves a space that inspires 
                and enables meaningful connections.
              </p>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">What We Do</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">For Event Organizers</h3>
                <p className="text-sm text-muted-foreground">
                  Discover and book unique venues for your events, from intimate workshops to large conferences.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">For Space Owners</h3>
                <p className="text-sm text-muted-foreground">
                  Monetize your space by hosting events and connecting with your local community.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">For Communities</h3>
                <p className="text-sm text-muted-foreground">
                  Enable meaningful connections and experiences through accessible, inspiring spaces.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-6">
              Whether you&apos;re looking to host or attend amazing events, we&apos;d love to have you as part of our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/venues"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Browse Venues
              </a>
              <a 
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Become a Host
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}