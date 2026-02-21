export interface LocalizedString {
  bs: string;
  en: string;
}

export interface ProductWithDetails {
  id: string;
  sku: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString | null;
  price: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  weight: number | null;
  createdAt: Date;
  category: {
    id: string;
    name: LocalizedString;
    slug: string;
  } | null;
  variants: {
    id: string;
    sku: string;
    name: LocalizedString | null;
    price: number | null;
    stock: number;
    reservedStock: number;
    attributes: Record<string, string> | null;
    isActive: boolean;
  }[];
  images: {
    id: string;
    url: string;
    altText: LocalizedString | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
}

export interface CartItemData {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  name: string;
  image: string | null;
  slug: string;
  variantName: string | null;
  stock: number;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone?: string;
}

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "popular";

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
  attributes?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
