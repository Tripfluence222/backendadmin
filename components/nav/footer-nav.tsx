"use client";

import Link from "next/link";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "For Guests",
    links: [
      { href: "/venues", label: "Browse Venues" },
      { href: "/search", label: "Search Spaces" },
      { href: "/help", label: "Help Center" },
    ],
  },
  {
    title: "For Hosts",
    links: [
      { href: "/dashboard", label: "Host Dashboard" },
      { href: "/spaces", label: "Manage Spaces" },
      { href: "/space-requests", label: "Booking Requests" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

interface FooterNavProps {
  className?: string;
}

export function FooterNav({ className }: FooterNavProps) {
  return (
    <footer className={`border-t bg-muted/50 ${className || ""}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Tripfluence</h3>
            <p className="text-sm text-muted-foreground">
              Discover and book amazing spaces for your events.
            </p>
          </div>
          
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-medium mb-4">{section.title}</h4>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Tripfluence. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}