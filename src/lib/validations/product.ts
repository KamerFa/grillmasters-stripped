import { z } from "zod";

const localizedString = z.object({
  bs: z.string().min(1),
  en: z.string().min(1),
});

export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: localizedString,
  slug: z.string().min(1, "Slug is required"),
  description: localizedString.optional(),
  price: z.number().int().positive("Price must be positive"),
  compareAtPrice: z.number().int().positive().optional().nullable(),
  costPrice: z.number().int().positive().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  weight: z.number().positive().optional().nullable(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional()
    .nullable(),
  metaTitle: localizedString.optional().nullable(),
  metaDescription: localizedString.optional().nullable(),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: localizedString.optional().nullable(),
  price: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  attributes: z.record(z.string()).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: localizedString,
  slug: z.string().min(1, "Slug is required"),
  description: localizedString.optional().nullable(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
