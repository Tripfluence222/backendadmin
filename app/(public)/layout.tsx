import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { FooterNav } from '@/components/nav/footer-nav';
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
                  <a href="/dashboard" className="text-sm font-medium hover:text-primary">
                    Host Dashboard
                  </a>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <FooterNav />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
