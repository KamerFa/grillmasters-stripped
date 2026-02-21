"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { getLocalizedField } from "@/lib/utils";
import { formatPrice } from "@/config/currency";
import { useCartStore } from "@/stores/cart.store";
import { v4 as uuidv4 } from "uuid";

interface ProductCardProps {
  product: {
    id: string;
    name: Record<string, string>;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    images: { url: string; altText?: Record<string, string> | null; isPrimary: boolean }[];
    variants: { id: string; stock: number; reservedStock: number; attributes?: Record<string, string> | null }[];
    isFeatured?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);

  const name = getLocalizedField(product.name, locale);
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const totalStock = product.variants.reduce(
    (sum, v) => sum + (v.stock - v.reservedStock),
    0
  );
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariant = product.variants[0];
    if (!firstVariant || totalStock <= 0) return;

    addItem({
      id: uuidv4(),
      productId: product.id,
      variantId: firstVariant.id,
      quantity: 1,
      price: product.price,
      name,
      image: primaryImage?.url ?? null,
      slug: product.slug,
      variantName: firstVariant.attributes
        ? Object.values(firstVariant.attributes).join(" / ")
        : null,
      stock: firstVariant.stock - firstVariant.reservedStock,
    });
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={
                primaryImage.altText
                  ? getLocalizedField(primaryImage.altText, locale)
                  : name
              }
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge variant="destructive">-{discountPercent}%</Badge>
            )}
            {totalStock <= 0 && (
              <Badge variant="secondary">{t("outOfStock")}</Badge>
            )}
            {totalStock > 0 && totalStock <= 5 && (
              <Badge variant="warning">
                {t("lowStock", { count: totalStock })}
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {totalStock > 0 && (
              <Button size="icon" variant="secondary" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
