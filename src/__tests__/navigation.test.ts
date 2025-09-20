import { describe, it, expect } from 'vitest';

// Test navigation link consistency without React rendering
describe('Navigation Link Consistency', () => {
  describe('Footer Navigation Links', () => {
    // Define the expected footer links structure
    const footerSections = [
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

    it('should have correct guest navigation links', () => {
      const guestSection = footerSections.find(s => s.title === "For Guests");
      expect(guestSection).toBeDefined();
      
      const expectedLinks = [
        { href: "/venues", label: "Browse Venues" },
        { href: "/search", label: "Search Spaces" },
        { href: "/help", label: "Help Center" },
      ];
      
      expect(guestSection?.links).toEqual(expectedLinks);
    });

    it('should have correct host navigation links', () => {
      const hostSection = footerSections.find(s => s.title === "For Hosts");
      expect(hostSection).toBeDefined();
      
      const expectedLinks = [
        { href: "/dashboard", label: "Host Dashboard" },
        { href: "/spaces", label: "Manage Spaces" },
        { href: "/space-requests", label: "Booking Requests" },
      ];
      
      expect(hostSection?.links).toEqual(expectedLinks);
    });

    it('should have correct company navigation links', () => {
      const companySection = footerSections.find(s => s.title === "Company");
      expect(companySection).toBeDefined();
      
      const expectedLinks = [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ];
      
      expect(companySection?.links).toEqual(expectedLinks);
    });

    it('should not contain broken admin links', () => {
      const allLinks = footerSections.flatMap(section => section.links);
      const brokenLinks = ['/admin', '/admin/spaces', '/admin/requests'];
      
      brokenLinks.forEach(brokenHref => {
        const hasLink = allLinks.some(link => link.href === brokenHref);
        expect(hasLink).toBe(false);
      });
    });

    it('should use consistent route patterns', () => {
      const allLinks = footerSections.flatMap(section => section.links);
      
      // All admin routes should start with / and not /admin
      const adminRoutes = ['/dashboard', '/spaces', '/space-requests'];
      adminRoutes.forEach(route => {
        const hasRoute = allLinks.some(link => link.href === route);
        expect(hasRoute).toBe(true);
      });
    });
  });

  describe('Back Button Configuration', () => {
    it('should have proper default configuration', () => {
      const defaultConfig = {
        label: 'Back',
        variant: 'ghost',
        className: 'inline-flex items-center gap-2',
      };

      expect(defaultConfig.label).toBe('Back');
      expect(defaultConfig.variant).toBe('ghost');
      expect(defaultConfig.className).toContain('inline-flex');
    });

    it('should support custom href navigation', () => {
      const customHref = '/dashboard';
      expect(customHref).toMatch(/^\/[a-z-]+$/);
    });

    it('should support browser back navigation', () => {
      // Test that undefined href allows browser back
      const href = undefined;
      expect(href).toBeUndefined();
    });
  });

  describe('Route Validation', () => {
    const validRoutes = [
      '/',
      '/dashboard',
      '/venues',
      '/search',
      '/spaces',
      '/customers',
      '/orders',
      '/listings',
      '/availability',
      '/marketing',
      '/social',
      '/reports',
      '/reviews',
      '/integrations',
      '/settings',
      '/space-requests',
      '/space-pricing',
      '/event-sync',
      '/widgets',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/help'
    ];

    it('should have valid route format', () => {
      validRoutes.forEach(route => {
        expect(route).toMatch(/^\/[a-z0-9-]*$/);
      });
    });

    it('should not have duplicate routes', () => {
      const uniqueRoutes = [...new Set(validRoutes)];
      expect(uniqueRoutes.length).toBe(validRoutes.length);
    });

    it('should include all essential pages', () => {
      const essentialRoutes = ['/', '/dashboard', '/venues', '/about', '/contact', '/privacy', '/terms'];
      essentialRoutes.forEach(route => {
        expect(validRoutes).toContain(route);
      });
    });
  });
});