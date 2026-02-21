import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/storefront/product-card";
import { getProducts, getCategories } from "@/services/product.service";
import { getLocalizedField } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { SortOption } from "@/types";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale });

  const page = Number(sp.page) || 1;
  const sort = (sp.sort as SortOption) || "newest";
  const categorySlug = sp.category as string | undefined;
  const search = sp.q as string | undefined;
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  let result: Awaited<ReturnType<typeof getProducts>>;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [result, categories] = await Promise.all([
      getProducts({ categorySlug, search, minPrice, maxPrice, sort, page }),
      getCategories(),
    ]);
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
        <span>{t("common.products")}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <h2 className="text-lg font-semibold mb-4">
            {t("common.categories")}
          </h2>
          <nav className="space-y-2">
            <Link
              href="/products"
              className={`block text-sm py-1 ${!categorySlug ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("common.all")}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`block text-sm py-1 ${categorySlug === cat.slug ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {getLocalizedField(cat.name, locale)} ({cat._count.products})
              </Link>
            ))}
          </nav>

          {/* Sort */}
          <h2 className="text-lg font-semibold mb-4 mt-8">
            {t("product.sortBy")}
          </h2>
          <nav className="space-y-2">
            {(
              [
                ["newest", t("product.sortNewest")],
                ["price-asc", t("product.sortPriceAsc")],
                ["price-desc", t("product.sortPriceDesc")],
              ] as const
            ).map(([value, label]) => (
              <Link
                key={value}
                href={`/products?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), sort: value }).toString()}`}
                className={`block text-sm py-1 ${sort === value ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {result.total} {t("common.products").toLowerCase()}
            </p>
          </div>

          {result.items.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Link href="/products" className="mt-4 inline-block">
                <Button variant="outline">{t("product.clearFilters")}</Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={`/products?${new URLSearchParams({
                      ...(categorySlug ? { category: categorySlug } : {}),
                      sort,
                      page: String(p),
                    }).toString()}`}
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
      </div>
    </div>
  );
}
