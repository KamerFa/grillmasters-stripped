"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice } from "@/config/currency";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const t = useTranslations();
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t("cart.empty")}</h1>
        <Link href="/products">
          <Button className="mt-4">{t("cart.continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">{t("cart.title")}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-muted rounded-md overflow-hidden shrink-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="font-medium hover:underline truncate">
                        {item.name}
                      </h3>
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                    <p className="font-semibold mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Total + remove */}
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("checkout.orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{t("cart.subtotal")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t("cart.shipping")}</span>
                <span>{t("checkout.estimatedDelivery", { days: "2-4" })}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t("cart.total")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  {t("cart.proceedToCheckout")}
                </Button>
              </Link>
              <Link href="/products" className="block">
                <Button variant="outline" className="w-full">
                  {t("cart.continueShopping")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
