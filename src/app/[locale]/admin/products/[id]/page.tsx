import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  let product;
  try {
    product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { orderBy: { sku: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
  } catch {
    notFound();
  }

  if (!product) notFound();

  let categories: { id: string; name: unknown }[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // ignore
  }

  return (
    <ProductForm
      product={{
        id: product.id,
        sku: product.sku,
        name: product.name as { bs: string; en: string },
        slug: product.slug,
        description: product.description as { bs: string; en: string } | undefined,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        costPrice: product.costPrice,
        categoryId: product.categoryId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        weight: product.weight ? Number(product.weight) : null,
        variants: product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          reservedStock: v.reservedStock,
          attributes: v.attributes as Record<string, string> | null,
          isActive: v.isActive,
        })),
      }}
      categories={categories}
      locale={locale}
    />
  );
}
