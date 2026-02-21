import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { getFeaturedProducts, getCategories } from "@/services/product.service";
import { getLocalizedField } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [featuredProducts, categories] = await Promise.all([
      getFeaturedProducts(8),
      getCategories(),
    ]);
  } catch {
    // Database may not be available yet
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container py-24 md:py-32">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              {t("home.heroSubtitle")}
            </p>
            <div className="flex gap-4">
              <Link href="/products">
                <Button size="lg">{t("home.shopNow")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t("home.categories")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-lg border bg-muted/50 p-6 text-center transition-all hover:shadow-md hover:bg-muted"
              >
                <h3 className="font-semibold">
                  {getLocalizedField(category.name, locale)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category._count.products}{" "}
                  {t("common.products").toLowerCase()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {t("home.featuredProducts")}
            </h2>
            <Link href="/products">
              <Button variant="ghost" className="gap-2">
                {t("home.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product as unknown as Parameters<typeof ProductCard>[0]["product"]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state when no DB */}
      {featuredProducts.length === 0 && categories.length === 0 && (
        <section className="container py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">{t("home.heroTitle")}</h2>
          <p className="text-muted-foreground mb-8">
            Set up the database and run seed to see products here.
          </p>
          <Link href="/products">
            <Button size="lg">{t("home.shopNow")}</Button>
          </Link>
        </section>
      )}
    </div>
  );
}
