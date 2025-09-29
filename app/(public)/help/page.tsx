import { Metadata } from 'next';
import { Search, Book, Home, MessageSquare, CreditCard, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Center - Tripfluence',
  description: 'Find answers to frequently asked questions about booking spaces and hosting on Tripfluence.',
};

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function HelpPage() {
  const helpCategories = [
    {
      icon: Search,
      title: "Finding Spaces",
      description: "How to search and filter spaces",
      articles: [
        "How to search for spaces",
        "Understanding space listings",
        "Using filters effectively",
        "Reading reviews and ratings"
      ]
    },
    {
      icon: Book,
      title: "Making Bookings",
      description: "Booking process and requirements",
      articles: [
        "How to make a booking request",
        "Understanding booking confirmations",
        "Modifying your booking",
        "Cancellation policies"
      ]
    },
    {
      icon: Home,
      title: "Hosting Spaces",
      description: "Getting started as a host",
      articles: [
        "Creating your first listing",
        "Setting competitive pricing",
        "Managing your calendar",
        "Communicating with guests"
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Payment methods and billing",
      articles: [
        "Accepted payment methods",
        "Understanding fees",
        "Getting paid as a host",
        "Refunds and disputes"
      ]
    },
    {
      icon: MessageSquare,
      title: "Communication",
      description: "Messaging and support",
      articles: [
        "Messaging other users",
        "Contact preferences",
        "Reporting issues",
        "Getting help from support"
      ]
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Staying safe on our platform",
      articles: [
        "Identity verification",
        "Safety guidelines",
        "Insurance coverage",
        "Reporting concerns"
      ]
    }
  ];

  const popularQuestions = [
    {
      question: "How do I book a space?",
      answer: "Browse available spaces, select your dates and requirements, then submit a booking request. The host will respond within 24 hours to confirm or decline your request."
    },
    {
      question: "What happens after I submit a booking request?",
      answer: "The host has 24 hours to respond to your request. If approved, you'll receive a confirmation email with payment instructions and event details."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, but cancellation policies vary by host. Check the specific cancellation policy for your booking in your reservation details."
    },
    {
      question: "How do I become a host?",
      answer: "Sign up for a host account, create a listing with photos and details about your space, set your pricing and availability, then submit for approval."
    },
    {
      question: "What fees does Tripfluence charge?",
      answer: "We charge a service fee on successful bookings. The exact fee is shown during the booking process before you confirm your reservation."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard encryption and work with trusted payment processors to ensure your financial information is protected."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions and get the help you need
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              />
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="border border-input rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <h3 className="font-semibold">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Questions */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {popularQuestions.map((faq, index) => (
              <div key={index} className="border border-input rounded-lg p-6">
                <h3 className="font-semibold mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@tripfluence.com"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Email Us
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-16 border-t">
          <h2 className="text-2xl font-semibold mb-8 text-center">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold mb-3">For Guests</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/venues" className="text-muted-foreground hover:text-primary">Browse Venues</a></li>
                <li><a href="/search" className="text-muted-foreground hover:text-primary">Search Spaces</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Booking Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">For Hosts</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/dashboard" className="text-muted-foreground hover:text-primary">Host Dashboard</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Hosting Guide</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Best Practices</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li><a href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}