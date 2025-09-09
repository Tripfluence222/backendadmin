import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url(),
  
  // Payment providers
  STRIPE_SECRET_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  
  // Security
  WEBHOOK_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  
  // Origins
  WIDGET_ORIGIN: z.string().url().default('http://localhost:3002'),
  ADMIN_ORIGIN: z.string().url().default('http://localhost:3001'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
