import { prisma } from "@/lib/db";
import type { ProductFilters, PaginatedResult } from "@/types";
import { siteConfig } from "@/config/site";
import { Prisma } from "@prisma/client";

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  variants: {
    where: { isActive: true },
    orderBy: { sku: Prisma.SortOrder.asc },
  },
  images: {
    orderBy: { sortOrder: Prisma.SortOrder.asc },
  },
} as const;

export async function getProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    search,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
  } = filters;

  const pageSize = siteConfig.pagination.productsPerPage;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug, isActive: true };
  }

  if (search) {
    where.OR = [
      { name: { path: ["en"], string_contains: search } },
      { name: { path: ["bs"], string_contains: search } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (minPrice !== undefined) {
    where.price = { ...(where.price as object ?? {}), gte: minPrice };
  }

  if (maxPrice !== undefined) {
    where.price = { ...(where.price as object ?? {}), lte: maxPrice };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = {};
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  } as PaginatedResult<typeof items[number]>;
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: productInclude,
  });
}

export async function getProductById(id: string) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: productInclude,
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true, deletedAt: null },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId: categoryId ?? undefined,
      isActive: true,
      deletedAt: null,
    },
    include: productInclude,
    take: limit,
  });
}

export async function searchProducts(query: string, limit = 10) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [
        { name: { path: ["en"], string_contains: query } },
        { name: { path: ["bs"], string_contains: query } },
        { sku: { contains: query, mode: "insensitive" } },
      ],
    },
    include: productInclude,
    take: limit,
  });
}

// Admin functions
export async function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({
    data,
    include: productInclude,
  });
}

export async function updateProduct(
  id: string,
  data: Prisma.ProductUpdateInput
) {
  return prisma.product.update({
    where: { id },
    data,
    include: productInclude,
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    include: {
      children: {
        where: { isActive: true, deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { products: { where: { isActive: true } } } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      children: {
        where: { isActive: true, deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
      parent: { select: { id: true, name: true, slug: true } },
    },
  });
}
