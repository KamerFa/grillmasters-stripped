"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { v4 as uuidv4 } from "uuid";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    variants: {
      id: string;
      sku: string;
      price: number | null;
      stock: number;
      attributes: Record<string, string> | null;
    }[];
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const t = useTranslations("product");
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  );
  const price = selectedVariant?.price ?? product.price;
  const stock = selectedVariant?.stock ?? 0;

  // Extract unique attribute types
  const attributeTypes = new Set<string>();
  product.variants.forEach((v) => {
    if (v.attributes) {
      Object.keys(v.attributes).forEach((k) => attributeTypes.add(k));
    }
  });

  const handleAddToCart = () => {
    if (!selectedVariant || stock <= 0) return;

    addItem({
      id: uuidv4(),
      productId: product.id,
      variantId: selectedVariant.id,
      quantity,
      price,
      name: product.name,
      image: product.image,
      slug: product.slug,
      variantName: selectedVariant.attributes
        ? Object.values(selectedVariant.attributes).join(" / ")
        : null,
      stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Variant selection */}
      {product.variants.length > 1 && (
        <div className="space-y-3">
          {Array.from(attributeTypes).map((attrType) => (
            <div key={attrType}>
              <Label className="text-sm font-medium capitalize">
                {attrType === "size" ? t("size") : attrType === "color" ? t("color") : attrType}
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.variants
                  .filter((v) => v.attributes?.[attrType])
                  .map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    const isOutOfStock = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setQuantity(1);
                        }}
                        disabled={isOutOfStock}
                        className={`
                          px-4 py-2 text-sm border rounded-md transition-colors
                          ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary"}
                          ${isOutOfStock ? "opacity-50 cursor-not-allowed line-through" : "cursor-pointer"}
                        `}
                      >
                        {v.attributes![attrType]}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity */}
      <div>
        <Label className="text-sm font-medium">{t("quantity")}</Label>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            disabled={quantity >= stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to cart button */}
      <Button
        size="lg"
        className="w-full gap-2"
        onClick={handleAddToCart}
        disabled={stock <= 0}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            {t("addedToCart")}
          </>
        ) : stock <= 0 ? (
          t("outOfStock")
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            {t("addToCart")}
          </>
        )}
      </Button>
    </div>
  );
}
