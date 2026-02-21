import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { getFeaturedProducts, getCategories } from "@/services/product.service";
import { getLocalizedField } from "@/lib/utils";
import { ArrowRight, Leaf, Sparkles, Heart } from "lucide-react";

const CATEGORY_COLORS = [
  "bg-rose-50/80",
  "bg-amber-50/80",
  "bg-emerald-50/80",
  "bg-sky-50/80",
  "bg-violet-50/80",
];

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
      {/* Hero Section with Parallax Feel */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 via-amber-50/20 to-emerald-50/30" />
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-rose-100/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />

        {/* Decorative floating elements */}
        <div className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-rose-200/20 blur-3xl" />
        <div className="absolute bottom-32 right-[25%] w-48 h-48 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute top-40 left-[10%] w-32 h-32 rounded-full bg-emerald-200/15 blur-2xl" />

        <div className="container relative z-10 py-24 md:py-32">
          <div className="max-w-2xl space-y-8">
            <p className="text-sm tracking-[0.3em] uppercase text-primary/70 font-medium">
              {t("common.shopName")}
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95]">
              {t("home.heroTitle")}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl max-w-lg leading-relaxed">
              {t("home.heroSubtitle")}
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="px-8 h-12 text-sm tracking-wider uppercase">
                  {t("home.shopNow")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-rose-50/20 to-background" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-sm tracking-[0.3em] uppercase text-primary/60 font-medium">
              {t("home.philosophyTitle")}
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight">
              {t("home.philosophyTitle")}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              {t("home.philosophyText")}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="container py-16 md:py-24">
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.3em] uppercase text-primary/60 font-medium mb-3">
              {t("common.categories")}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light">
              {t("home.categories")}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, idx) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={`group relative overflow-hidden rounded-xl p-8 text-center transition-all hover:shadow-lg hover:scale-[1.02] ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}`}
              >
                <h3 className="font-display text-lg font-medium">
                  {getLocalizedField(category.name, locale)}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 tracking-wider uppercase">
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
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-50/15 to-transparent" />
          <div className="container relative z-10">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm tracking-[0.3em] uppercase text-primary/60 font-medium mb-3">
                  {t("common.products")}
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-light">
                  {t("home.featuredProducts")}
                </h2>
              </div>
              <Link href="/products">
                <Button variant="ghost" className="gap-2 tracking-wider text-sm uppercase">
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
          </div>
        </section>
      )}

      {/* Promises Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-rose-50/20 to-amber-50/30" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-light">
              {t("home.promiseTitle")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100/60 flex items-center justify-center mx-auto">
                <Leaf className="h-6 w-6 text-emerald-700/60" />
              </div>
              <h3 className="font-display text-xl font-medium">
                {t("home.promise1Title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.promise1Text")}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100/60 flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-rose-700/60" />
              </div>
              <h3 className="font-display text-xl font-medium">
                {t("home.promise2Title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.promise2Text")}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-100/60 flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-amber-700/60" />
              </div>
              <h3 className="font-display text-xl font-medium">
                {t("home.promise3Title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.promise3Text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Teaser */}
      <section className="container py-16 md:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-emerald-50/60 p-12 md:p-20 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-rose-200/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-200/15 blur-3xl" />
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-light">
              {t("home.newArrivals")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("home.heroSubtitle")}
            </p>
            <Link href="/products">
              <Button variant="outline" size="lg" className="mt-4 px-8 h-12 text-sm tracking-wider uppercase border-primary/30 hover:bg-primary/5">
                {t("home.shopNow")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Empty state when no DB */}
      {featuredProducts.length === 0 && categories.length === 0 && (
        <section className="container py-24 text-center">
          <h2 className="font-display text-3xl font-light mb-4">{t("home.heroTitle")}</h2>
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
