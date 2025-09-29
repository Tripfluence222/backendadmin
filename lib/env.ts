import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("Invalid database URL"),
  
  // Redis
  REDIS_URL: z.string().url("Invalid Redis URL").optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  NEXTAUTH_SECRET: z.string().min(32, "NextAuth secret must be at least 32 characters").optional(),
  NEXTAUTH_URL: z.string().url("Invalid NextAuth URL").optional(),
  
  // Payment Gateways
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "Invalid Stripe secret key").optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_", "Invalid Stripe publishable key").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  
  // Webhooks
  WEBHOOK_SECRET: z.string().min(32, "Webhook secret must be at least 32 characters"),
  
  // Social Media APIs
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  FACEBOOK_PAGE_CONFIG_ID: z.string().optional(),
  INSTAGRAM_CONFIG_ID: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Event Platforms
  EVENTBRITE_CLIENT_ID: z.string().optional(),
  EVENTBRITE_CLIENT_SECRET: z.string().optional(),
  MEETUP_CLIENT_ID: z.string().optional(),
  MEETUP_CLIENT_SECRET: z.string().optional(),
  
  // OAuth Configuration
  OAUTH_REDIRECT_BASE: z.string().url("Invalid OAuth redirect base URL").optional(),
  GRAPH_API_BASE: z.string().url("Invalid Graph API base URL").default("https://graph.facebook.com"),
  GOOGLE_BUSINESS_API_BASE: z.string().url("Invalid Google Business Profile API base URL").default("https://mybusiness.googleapis.com"),
  ENCRYPTION_KEY: z.string().length(64, "Encryption key must be 64 hex characters (32 bytes)").optional(),
  
  // Feature Flags
  FEATURE_REAL_PROVIDERS: z.string().transform(val => val === "true").default("false"),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email("Invalid SMTP from email").optional(),
  
  // SMS
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // File Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url("Invalid Sentry DSN").optional(),
  
  // Development
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("3000"),
});

// Parse and validate environment variables
const parseEnv = () => {
  // Skip validation during build if SKIP_ENV_VALIDATION is set
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    return {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
      JWT_SECRET: process.env.JWT_SECRET || 'dummy-jwt-secret-key-minimum-32-characters-long',
      WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'dummy-webhook-secret-key-minimum-32-characters-long',
      NODE_ENV: process.env.NODE_ENV || 'production',
      PORT: process.env.PORT || '3000',
      FEATURE_REAL_PROVIDERS: false,
      GRAPH_API_BASE: 'https://graph.facebook.com',
      GOOGLE_BUSINESS_API_BASE: 'https://mybusiness.googleapis.com',
    } as any;
  }

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError && error.errors) {
      const missingVars = error.errors
        .filter(err => err.code === "invalid_type" && err.received === "undefined")
        .map(err => err.path.join("."));
      
      const invalidVars = error.errors
        .filter(err => err.code !== "invalid_type")
        .map(err => `${err.path.join(".")}: ${err.message}`);
      
      let message = "Environment validation failed:\n";
      
      if (missingVars.length > 0) {
        message += `\nMissing required variables:\n${missingVars.map(v => `  - ${v}`).join("\n")}`;
      }
      
      if (invalidVars.length > 0) {
        message += `\nInvalid variables:\n${invalidVars.map(v => `  - ${v}`).join("\n")}`;
      }
      
      throw new Error(message);
    }
    throw error;
  }
};

export const env = parseEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

// Helper functions
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

// Database helpers
export const getDatabaseUrl = () => env.DATABASE_URL;
export const getRedisUrl = () => env.REDIS_URL;

// Payment helpers
export const hasStripe = () => !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY);
export const hasRazorpay = () => !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

// Social media helpers
export const hasFacebook = () => !!(env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET);
export const hasGoogleBusiness = () => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const hasEventbrite = () => !!(env.EVENTBRITE_CLIENT_ID && env.EVENTBRITE_CLIENT_SECRET);
export const hasMeetup = () => !!(env.MEETUP_CLIENT_ID && env.MEETUP_CLIENT_SECRET);
export const hasRealProviders = () => env.FEATURE_REAL_PROVIDERS;

// Email helpers
export const hasEmail = () => !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);

// SMS helpers
export const hasSMS = () => !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);

// Storage helpers
export const hasS3 = () => !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET);