import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProductBySlug, getRelatedProducts } from "@/services/product.service";
import { getLocalizedField } from "@/lib/utils";
import { formatPrice } from "@/config/currency";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductActions } from "@/components/storefront/product-actions";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

const BACKDROP_COLORS = [
  "bg-rose-100/60",
  "bg-amber-100/60",
  "bg-emerald-100/60",
  "bg-sky-100/60",
  "bg-violet-100/60",
  "bg-orange-100/60",
];

function getBackdropColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BACKDROP_COLORS[Math.abs(hash) % BACKDROP_COLORS.length];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return {};
    const name = getLocalizedField(product.name, locale);
    const description = getLocalizedField(product.description, locale);
    return {
      title: `${name} | HANA Beauty`,
      description: description || name,
    };
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });

  let product: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  if (!product) notFound();

  const name = getLocalizedField(product.name, locale);
  const description = getLocalizedField(product.description, locale);
  const totalStock = product.variants.reduce(
    (sum, v) => sum + (v.stock - v.reservedStock),
    0
  );

  let relatedProducts: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  try {
    relatedProducts = await getRelatedProducts(product.id, product.categoryId);
  } catch {
    // ignore
  }

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: product.images[0]?.url,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price / 100,
      priceCurrency: "BAM",
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("common.home")}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-foreground">
          {t("common.products")}
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-foreground"
            >
              {getLocalizedField(product.category.name, locale)}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className={`relative aspect-square overflow-hidden rounded-lg ${getBackdropColor(product.id)}`}>
            <img
              src={product.images[0]?.url || "/images/products/placeholder-1.svg"}
              alt={name}
              className="object-contain w-full h-full p-4"
              onError={(e) => { (e.target as HTMLImageElement).src = "/images/products/placeholder-1.svg"; }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, idx) => (
                <div
                  key={img.id}
                  className={`relative aspect-square overflow-hidden rounded-md ${BACKDROP_COLORS[(Math.abs(idx) + 1) % BACKDROP_COLORS.length]}`}
                >
                  <img
                    src={img.url}
                    alt={name}
                    className="object-contain w-full h-full p-2"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/products/placeholder-1.svg"; }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("product.sku")}: {product.sku}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div>
            {totalStock > 0 ? (
              totalStock <= 5 ? (
                <Badge variant="warning">
                  {t("product.lowStock", { count: totalStock })}
                </Badge>
              ) : (
                <Badge variant="success">{t("product.inStock")}</Badge>
              )
            ) : (
              <Badge variant="secondary">{t("product.outOfStock")}</Badge>
            )}
          </div>

          {/* Variant selection + Add to cart */}
          <ProductActions
            product={{
              id: product.id,
              name,
              slug: product.slug,
              price: product.price,
              image: product.images[0]?.url ?? null,
              variants: product.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                price: v.price,
                stock: v.stock - v.reservedStock,
                attributes: v.attributes as Record<string, string> | null,
              })),
            }}
          />

          {/* Description */}
          {description && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">
                {t("product.description")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">{t("product.related")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => (
              <ProductCard
                key={rp.id}
                product={rp as unknown as Parameters<typeof ProductCard>[0]["product"]}
              />
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
