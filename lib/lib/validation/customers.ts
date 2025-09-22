import { z } from "zod";

export const customerStatusSchema = z.enum([
  "active",
  "inactive",
  "blocked",
  "vip"
]);

export const createCustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    sms: z.boolean().default(false),
    marketing: z.boolean().default(false),
  }).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: customerStatusSchema.default("active"),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addCustomerNoteSchema = z.object({
  note: z.string().min(1, "Note is required"),
  type: z.enum(["general", "booking", "payment", "support"]).default("general"),
  isPrivate: z.boolean().default(false),
});

export const updateCustomerPreferencesSchema = z.object({
  newsletter: z.boolean(),
  sms: z.boolean(),
  marketing: z.boolean(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddCustomerNoteInput = z.infer<typeof addCustomerNoteSchema>;
export type UpdateCustomerPreferencesInput = z.infer<typeof updateCustomerPreferencesSchema>;
export type CustomerStatus = z.infer<typeof customerStatusSchema>;
