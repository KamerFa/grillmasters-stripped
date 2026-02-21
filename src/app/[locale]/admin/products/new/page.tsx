import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminProductNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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

  return <ProductForm categories={categories} locale={locale} />;
}
