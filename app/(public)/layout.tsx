import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Tripfluence - Find & Book Amazing Spaces',
  description: 'Discover and book yoga studios, cafés, and unique venues for your events. From intimate gatherings to large workshops.',
  keywords: ['space rental', 'venue booking', 'yoga studio', 'café rental', 'event space'],
  openGraph: {
    title: 'Tripfluence - Find & Book Amazing Spaces',
    description: 'Discover and book yoga studios, cafés, and unique venues for your events.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tripfluence - Find & Book Amazing Spaces',
    description: 'Discover and book yoga studios, cafés, and unique venues for your events.',
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-primary">Tripfluence</h1>
                  <span className="text-sm text-muted-foreground">Spaces</span>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/venues" className="text-sm font-medium hover:text-primary">
                    Browse Venues
                  </a>
                  <a href="/search" className="text-sm font-medium hover:text-primary">
                    Search
                  </a>
                  <a href="/admin" className="text-sm font-medium hover:text-primary">
                    Host Dashboard
                  </a>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="border-t bg-muted/50">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Tripfluence</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover and book amazing spaces for your events.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-4">For Guests</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/venues" className="text-muted-foreground hover:text-foreground">Browse Venues</a></li>
                    <li><a href="/search" className="text-muted-foreground hover:text-foreground">Search Spaces</a></li>
                    <li><a href="/help" className="text-muted-foreground hover:text-foreground">Help Center</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-4">For Hosts</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/admin" className="text-muted-foreground hover:text-foreground">Host Dashboard</a></li>
                    <li><a href="/admin/spaces" className="text-muted-foreground hover:text-foreground">Manage Spaces</a></li>
                    <li><a href="/admin/requests" className="text-muted-foreground hover:text-foreground">Booking Requests</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Company</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/about" className="text-muted-foreground hover:text-foreground">About</a></li>
                    <li><a href="/contact" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                    <li><a href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                <p>&copy; 2024 Tripfluence. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
