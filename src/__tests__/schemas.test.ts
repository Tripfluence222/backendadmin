import { describe, it, expect } from 'vitest';
import {
  EventSchema,
  RetreatSchema,
  ActivitySchema,
  CoworkingSchema,
  RestaurantSchema,
  validateListing,
  validateEvent,
  getSchemaByType,
  getRequiredFields,
} from '../schemas/listings';

describe('Listing Schemas', () => {
  describe('EventSchema', () => {
    const validEvent = {
      type: 'event' as const,
      title: 'React Conference 2024',
      description: 'A comprehensive conference about React and modern web development',
      location: 'San Francisco, CA',
      images: ['https://example.com/image1.jpg'],
      price: 299,
      currency: 'USD',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-16'),
      startTime: '09:00',
      endTime: '17:00',
      capacity: 500,
      organizer: 'Tech Events Inc',
      category: 'conference' as const,
      venue: {
        name: 'Convention Center',
        address: '123 Market St, San Francisco, CA',
      },
      ticketTypes: [
        {
          name: 'Early Bird',
          price: 199,
          quantity: 100,
          description: 'Early bird pricing',
        },
        {
          name: 'Regular',
          price: 299,
          quantity: 400,
        },
      ],
    };

    it('should validate a valid event', () => {
      expect(() => EventSchema.parse(validEvent)).not.toThrow();
    });

    it('should require title', () => {
      const invalidEvent = { ...validEvent, title: '' };
      expect(() => EventSchema.parse(invalidEvent)).toThrow();
    });

    it('should require valid time format', () => {
      const invalidEvent = { ...validEvent, startTime: '25:00' };
      expect(() => EventSchema.parse(invalidEvent)).toThrow();
    });

    it('should require end date after start date', () => {
      const invalidEvent = {
        ...validEvent,
        startDate: new Date('2024-06-16'),
        endDate: new Date('2024-06-15'),
      };
      expect(() => EventSchema.parse(invalidEvent)).toThrow();
    });

    it('should require at least one ticket type', () => {
      const invalidEvent = { ...validEvent, ticketTypes: [] };
      expect(() => EventSchema.parse(invalidEvent)).toThrow();
    });
  });

  describe('RetreatSchema', () => {
    const validRetreat = {
      type: 'retreat' as const,
      title: 'Mindfulness Retreat',
      description: 'A peaceful retreat focused on mindfulness and meditation practices',
      location: 'Napa Valley, CA',
      images: ['https://example.com/retreat1.jpg'],
      price: 899,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-05'),
      durationDays: 4,
      capacity: 20,
      pricePerPerson: 899,
      inclusions: ['Accommodation', 'All meals', 'Guided meditation sessions'],
      difficultyLevel: 'beginner' as const,
      instructor: {
        name: 'Jane Doe',
        bio: 'Certified meditation instructor with 10 years of experience',
        certifications: ['RYT-500', 'Mindfulness Teacher Training'],
      },
      accommodation: {
        type: 'resort' as const,
        description: 'Luxury resort with spa facilities',
        amenities: ['Spa', 'Pool', 'Yoga studio'],
      },
      meals: {
        included: true,
        dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-free'],
      },
      activities: [
        {
          name: 'Morning Meditation',
          description: 'Start your day with guided meditation',
          duration: '1 hour',
          optional: false,
        },
      ],
      equipment: {
        provided: ['Yoga mats', 'Meditation cushions'],
        required: ['Comfortable clothing'],
      },
      fitnessLevel: 'low' as const,
      groupSize: {
        min: 10,
        max: 20,
      },
    };

    it('should validate a valid retreat', () => {
      expect(() => RetreatSchema.parse(validRetreat)).not.toThrow();
    });

    it('should require valid difficulty level', () => {
      const invalidRetreat = { ...validRetreat, difficultyLevel: 'invalid' };
      expect(() => RetreatSchema.parse(invalidRetreat)).toThrow();
    });

    it('should require max group size >= min group size', () => {
      const invalidRetreat = {
        ...validRetreat,
        groupSize: { min: 20, max: 10 },
      };
      expect(() => RetreatSchema.parse(invalidRetreat)).toThrow();
    });
  });

  describe('ActivitySchema', () => {
    const validActivity = {
      type: 'activity' as const,
      title: 'Rock Climbing Adventure',
      description: 'Outdoor rock climbing experience for all skill levels',
      location: 'Yosemite National Park',
      images: ['https://example.com/climbing.jpg'],
      price: 199,
      durationHours: 4,
      difficultyLevel: 'moderate' as const,
      minimumAge: 12,
      maximumAge: 65,
      maxParticipants: 8,
      instructor: {
        name: 'Mike Johnson',
        qualifications: ['AMGA Certified', 'Wilderness First Aid'],
        experience: '15 years of climbing instruction',
      },
      safetyNotes: 'All safety equipment provided. Weather dependent activity.',
      cancellationPolicy: '24 hour cancellation required for full refund',
      meetingPoint: {
        name: 'Visitor Center',
        address: 'Yosemite Valley Visitor Center, CA',
      },
      categories: ['adventure', 'nature'],
    };

    it('should validate a valid activity', () => {
      expect(() => ActivitySchema.parse(validActivity)).not.toThrow();
    });

    it('should require maximum age > minimum age', () => {
      const invalidActivity = {
        ...validActivity,
        minimumAge: 65,
        maximumAge: 12,
      };
      expect(() => ActivitySchema.parse(invalidActivity)).toThrow();
    });

    it('should require at least one category', () => {
      const invalidActivity = { ...validActivity, categories: [] };
      expect(() => ActivitySchema.parse(invalidActivity)).toThrow();
    });
  });

  describe('CoworkingSchema', () => {
    const validCoworking = {
      type: 'coworking' as const,
      title: 'Creative Coworking Space',
      description: 'Modern coworking space for creative professionals',
      location: 'Downtown San Francisco',
      images: ['https://example.com/coworking.jpg'],
      price: 45,
      address: '456 Mission St, San Francisco, CA',
      operatingHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
      },
      pricing: {
        hourlyRate: 15,
        dayPassRate: 45,
        monthlyRate: 450,
      },
      amenities: [
        {
          name: 'High-speed WiFi',
          category: 'technology' as const,
          available: true,
        },
      ],
      capacity: 50,
      wifiSpeed: {
        download: 100,
        upload: 50,
        unit: 'Mbps' as const,
      },
      parking: {
        available: true,
        type: 'paid' as const,
        spaces: 20,
        cost: 10,
      },
      accessibility: {
        wheelchairAccessible: true,
        elevatorAccess: true,
        accessibleBathroom: true,
      },
      cancellationPolicy: 'Full refund with 24 hour notice',
      contactInfo: {
        email: 'hello@creativespace.com',
      },
    };

    it('should validate a valid coworking space', () => {
      expect(() => CoworkingSchema.parse(validCoworking)).not.toThrow();
    });

    it('should require at least one amenity', () => {
      const invalidCoworking = { ...validCoworking, amenities: [] };
      expect(() => CoworkingSchema.parse(invalidCoworking)).toThrow();
    });
  });

  describe('RestaurantSchema', () => {
    const validRestaurant = {
      type: 'restaurant' as const,
      title: 'Farm to Table Bistro',
      description: 'Fresh, locally sourced cuisine in a cozy atmosphere',
      location: 'Berkeley, CA',
      images: ['https://example.com/restaurant.jpg'],
      price: 35,
      cuisineType: ['american'],
      priceRange: '$$' as const,
      address: '789 Shattuck Ave, Berkeley, CA',
      operatingHours: {
        monday: { open: '11:00', close: '22:00' },
      },
      menuHighlights: [
        {
          name: 'Seasonal Salad',
          description: 'Mixed greens with local vegetables',
          price: 16,
          category: 'appetizer' as const,
          dietary: ['vegetarian', 'gluten-free'],
        },
      ],
      capacity: 60,
      ambiance: ['casual', 'family-friendly'],
      parking: {
        available: true,
        type: 'street' as const,
      },
      acceptedPayments: ['cash', 'credit', 'debit'],
    };

    it('should validate a valid restaurant', () => {
      expect(() => RestaurantSchema.parse(validRestaurant)).not.toThrow();
    });

    it('should require at least one cuisine type', () => {
      const invalidRestaurant = { ...validRestaurant, cuisineType: [] };
      expect(() => RestaurantSchema.parse(invalidRestaurant)).toThrow();
    });

    it('should require at least one menu highlight', () => {
      const invalidRestaurant = { ...validRestaurant, menuHighlights: [] };
      expect(() => RestaurantSchema.parse(invalidRestaurant)).toThrow();
    });
  });

  describe('Utility Functions', () => {
    it('should validate listings with discriminated union', () => {
      const validEvent = {
        type: 'event' as const,
        title: 'Test Event',
        description: 'A test event description that meets minimum length',
        location: 'Test Location',
        images: ['https://example.com/test.jpg'],
        price: 100,
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-16'),
        startTime: '09:00',
        endTime: '17:00',
        capacity: 100,
        organizer: 'Test Organizer',
        category: 'conference' as const,
        venue: {
          name: 'Test Venue',
          address: 'Test Address',
        },
        ticketTypes: [
          {
            name: 'General',
            price: 100,
            quantity: 100,
          },
        ],
      };

      expect(() => validateListing(validEvent)).not.toThrow();
      expect(() => validateEvent(validEvent)).not.toThrow();
    });

    it('should get schema by type', () => {
      expect(getSchemaByType('event')).toBe(EventSchema);
      expect(getSchemaByType('retreat')).toBe(RetreatSchema);
      expect(getSchemaByType('activity')).toBe(ActivitySchema);
      expect(getSchemaByType('coworking')).toBe(CoworkingSchema);
      expect(getSchemaByType('restaurant')).toBe(RestaurantSchema);
      expect(() => getSchemaByType('invalid')).toThrow();
    });

    it('should get required fields by type', () => {
      const eventFields = getRequiredFields('event');
      expect(eventFields).toContain('title');
      expect(eventFields).toContain('startDate');
      expect(eventFields).toContain('venue');

      const restaurantFields = getRequiredFields('restaurant');
      expect(restaurantFields).toContain('cuisineType');
      expect(restaurantFields).toContain('menuHighlights');

      const unknownFields = getRequiredFields('unknown');
      expect(unknownFields).toEqual(['title', 'description', 'location', 'images', 'price']);
    });
  });
});