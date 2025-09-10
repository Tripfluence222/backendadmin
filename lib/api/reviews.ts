import { CreateReviewInput, UpdateReviewInput, ReplyToReviewInput, ModerateReviewInput, ReviewStatus } from "@/lib/validation/reviews";

export interface Review {
  id: string;
  listingId: string;
  listingTitle: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  content: string;
  status: ReviewStatus;
  isVerified: boolean;
  images?: string[];
  tags?: string[];
  reply?: {
    content: string;
    isPublic: boolean;
    createdAt: string;
    createdBy: string;
  };
  moderatorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewMetrics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  verifiedReviews: number;
}

// Mock data
const mockReviews: Review[] = [
  {
    id: "1",
    listingId: "1",
    listingTitle: "Sunset Yoga Retreat",
    customerId: "1",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    rating: 5,
    title: "Absolutely Amazing Experience!",
    content: "The sunset yoga retreat was everything I hoped for and more. The instructor was knowledgeable, the setting was breathtaking, and the overall experience was transformative. I can't wait to book again!",
    status: "approved",
    isVerified: true,
    tags: ["amazing", "transformative", "recommended"],
    reply: {
      content: "Thank you so much for your wonderful review, Sarah! We're thrilled you had such a positive experience. We look forward to welcoming you back soon!",
      isPublic: true,
      createdAt: "2024-01-21T09:00:00Z",
      createdBy: "Retreat Manager",
    },
    createdAt: "2024-01-20T18:30:00Z",
    updatedAt: "2024-01-21T09:00:00Z",
  },
  {
    id: "2",
    listingId: "2",
    listingTitle: "Farm-to-Table Cooking Class",
    customerId: "2",
    customerName: "Michael Chen",
    customerEmail: "m.chen@email.com",
    rating: 4,
    title: "Great Learning Experience",
    content: "The cooking class was very informative and hands-on. Chef Maria was excellent at explaining techniques. The only minor issue was that some ingredients weren't as fresh as expected, but overall a great experience.",
    status: "approved",
    isVerified: true,
    tags: ["informative", "hands-on", "chef"],
    createdAt: "2024-01-22T16:00:00Z",
    updatedAt: "2024-01-22T16:00:00Z",
  },
  {
    id: "3",
    listingId: "5",
    listingTitle: "Fine Dining Restaurant",
    customerId: "4",
    customerName: "David Kim",
    customerEmail: "david.kim@email.com",
    rating: 5,
    title: "Exceptional Dining Experience",
    content: "From the moment we walked in, the service was impeccable. The food was beautifully presented and tasted even better. The wine pairing was perfect. Worth every penny!",
    status: "approved",
    isVerified: true,
    tags: ["exceptional", "service", "wine"],
    createdAt: "2024-01-19T20:00:00Z",
    updatedAt: "2024-01-19T20:00:00Z",
  },
  {
    id: "4",
    listingId: "1",
    listingTitle: "Sunset Yoga Retreat",
    customerId: "6",
    customerName: "Jennifer Smith",
    customerEmail: "j.smith@email.com",
    rating: 3,
    title: "Good but could be better",
    content: "The yoga session was decent, but I expected more for the price. The instructor was good but seemed rushed. The location was beautiful though. Not sure if I'd book again at this price point.",
    status: "pending",
    isVerified: false,
    tags: ["decent", "pricey", "location"],
    createdAt: "2024-01-25T14:00:00Z",
    updatedAt: "2024-01-25T14:00:00Z",
  },
  {
    id: "5",
    listingId: "3",
    listingTitle: "Luxury Beach Villa",
    customerId: "3",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@email.com",
    rating: 5,
    title: "Paradise Found!",
    content: "This villa exceeded all our expectations. The views are absolutely stunning, the amenities are top-notch, and the staff was incredibly helpful. Perfect for a romantic getaway or family vacation.",
    status: "approved",
    isVerified: true,
    tags: ["paradise", "stunning", "romantic"],
    createdAt: "2024-01-26T10:00:00Z",
    updatedAt: "2024-01-26T10:00:00Z",
  },
  {
    id: "6",
    listingId: "2",
    listingTitle: "Farm-to-Table Cooking Class",
    customerId: "7",
    customerName: "Robert Wilson",
    customerEmail: "r.wilson@email.com",
    rating: 2,
    title: "Disappointing Experience",
    content: "The class was overcrowded and the instructor seemed overwhelmed. We didn't get much hands-on experience as promised. The recipes were basic and not worth the high price. Would not recommend.",
    status: "flagged",
    isVerified: false,
    tags: ["overcrowded", "disappointing", "overpriced"],
    moderatorNotes: "Review contains negative feedback about class size and instructor. May need investigation.",
    createdAt: "2024-01-24T19:00:00Z",
    updatedAt: "2024-01-24T19:30:00Z",
  },
];

export const reviewsApi = {
  async getAll(): Promise<Review[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockReviews];
  },

  async getById(id: string): Promise<Review | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockReviews.find(review => review.id === id) || null;
  },

  async getByListing(listingId: string): Promise<Review[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockReviews.filter(review => review.listingId === listingId);
  },

  async getPending(): Promise<Review[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockReviews.filter(review => review.status === "pending");
  },

  async getFlagged(): Promise<Review[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockReviews.filter(review => review.status === "flagged");
  },

  async create(data: CreateReviewInput): Promise<Review> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newReview: Review = {
      id: (mockReviews.length + 1).toString(),
      listingTitle: "Unknown Listing", // Would be fetched from listing
      customerName: "Unknown Customer", // Would be fetched from customer
      customerEmail: "unknown@email.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockReviews.push(newReview);
    return newReview;
  },

  async update(id: string, data: UpdateReviewInput): Promise<Review> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockReviews.findIndex(review => review.id === id);
    if (index === -1) {
      throw new Error("Review not found");
    }
    mockReviews[index] = {
      ...mockReviews[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockReviews[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockReviews.findIndex(review => review.id === id);
    if (index === -1) {
      throw new Error("Review not found");
    }
    mockReviews.splice(index, 1);
  },

  async moderate(id: string, data: ModerateReviewInput): Promise<Review> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockReviews.findIndex(review => review.id === id);
    if (index === -1) {
      throw new Error("Review not found");
    }
    mockReviews[index] = {
      ...mockReviews[index],
      status: data.status,
      moderatorNotes: data.moderatorNotes,
      updatedAt: new Date().toISOString(),
    };
    return mockReviews[index];
  },

  async reply(id: string, data: ReplyToReviewInput): Promise<Review> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockReviews.findIndex(review => review.id === id);
    if (index === -1) {
      throw new Error("Review not found");
    }
    mockReviews[index] = {
      ...mockReviews[index],
      reply: {
        content: data.reply,
        isPublic: data.isPublic,
        createdAt: new Date().toISOString(),
        createdBy: "Admin", // Would be current user
      },
      updatedAt: new Date().toISOString(),
    };
    return mockReviews[index];
  },

  async getMetrics(): Promise<ReviewMetrics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const approvedReviews = mockReviews.filter(r => r.status === "approved");
    const totalReviews = approvedReviews.length;
    const averageRating = totalReviews > 0 
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      pendingReviews: mockReviews.filter(r => r.status === "pending").length,
      approvedReviews: mockReviews.filter(r => r.status === "approved").length,
      rejectedReviews: mockReviews.filter(r => r.status === "rejected").length,
      verifiedReviews: mockReviews.filter(r => r.isVerified).length,
    };
  },

  async getMetricsByListing(listingId: string): Promise<ReviewMetrics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const listingReviews = mockReviews.filter(r => r.listingId === listingId);
    const approvedReviews = listingReviews.filter(r => r.status === "approved");
    const totalReviews = approvedReviews.length;
    const averageRating = totalReviews > 0 
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      pendingReviews: listingReviews.filter(r => r.status === "pending").length,
      approvedReviews: listingReviews.filter(r => r.status === "approved").length,
      rejectedReviews: listingReviews.filter(r => r.status === "rejected").length,
      verifiedReviews: listingReviews.filter(r => r.isVerified).length,
    };
  },
};
