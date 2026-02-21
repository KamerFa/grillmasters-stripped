import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  street: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(1, "Postal code is required"),
  country: z.string().min(2).max(2, "Country code required"),
  phone: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  shippingMethod: z.string().min(1, "Shipping method required"),
  discountCode: z.string().optional(),
  notes: z.string().optional(),
});

export const discountCodeSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().int().positive(),
  minimumOrderAmount: z.number().int().positive().optional().nullable(),
  maximumDiscountAmount: z.number().int().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
  applicableCategories: z.array(z.string().uuid()).optional().nullable(),
  applicableProducts: z.array(z.string().uuid()).optional().nullable(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type DiscountCodeInput = z.infer<typeof discountCodeSchema>;
