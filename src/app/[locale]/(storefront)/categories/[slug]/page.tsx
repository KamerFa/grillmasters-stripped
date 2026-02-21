import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCategoryBySlug, getProducts } from "@/services/product.service";
import { getLocalizedField } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return {};
    const name = getLocalizedField(category.name, locale);
    return { title: `${name} | SHOP.BA` };
  } catch {
    return {};
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale });

  let category: Awaited<ReturnType<typeof getCategoryBySlug>>;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }
  if (!category) notFound();

  const name = getLocalizedField(category.name, locale);
  const description = getLocalizedField(category.description, locale);

  const page = Number(sp.page) || 1;
  const sort = (sp.sort as "newest" | "price-asc" | "price-desc") ?? "newest";

  let result: Awaited<ReturnType<typeof getProducts>>;
  try {
    result = await getProducts({ categorySlug: slug, sort, page });
  } catch {
    result = { items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("common.home")}
        </Link>
        <span className="mx-2">/</span>
        {category.parent && (
          <>
            <Link
              href={`/categories/${category.parent.slug}`}
              className="hover:text-foreground"
            >
              {getLocalizedField(category.parent.name, locale)}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{name}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {category.children.map((child) => (
            <Link key={child.id} href={`/categories/${child.slug}`}>
              <Button variant="outline" size="sm">
                {getLocalizedField(child.name, locale)}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Products */}
      {result.items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {result.items.map((product) => (
            <ProductCard
              key={product.id}
              product={product as unknown as Parameters<typeof ProductCard>[0]["product"]}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("common.noResults")}</p>
        </div>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={`/categories/${slug}?sort=${sort}&page=${p}`}
              >
                <Button
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                >
                  {p}
                </Button>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
