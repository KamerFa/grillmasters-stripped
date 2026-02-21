import { getTranslations } from "next-intl/server";
import { searchProducts } from "@/services/product.service";
import { ProductCard } from "@/components/storefront/product-card";
import { Link } from "@/i18n/routing";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale });
  const query = sp.q ?? "";

  let results: Awaited<ReturnType<typeof searchProducts>> = [];
  if (query.trim()) {
    try {
      results = await searchProducts(query, 20);
    } catch {
      // DB not available
    }
  }

  return (
    <div className="container py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("common.home")}
        </Link>
        <span className="mx-2">/</span>
        <span>{t("common.search")}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-2">{t("common.search")}</h1>
      {query && (
        <p className="text-muted-foreground mb-8">
          {results.length} results for &quot;{query}&quot;
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product as unknown as Parameters<typeof ProductCard>[0]["product"]}
            />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("common.noResults")}</p>
        </div>
      ) : null}
    </div>
  );
}
