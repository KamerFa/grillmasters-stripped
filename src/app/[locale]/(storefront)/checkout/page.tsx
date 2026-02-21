"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice } from "@/config/currency";
import { getShippingZone, calculateShippingCost } from "@/config/shipping";

type Step = "shipping" | "payment" | "confirmation";

export default function CheckoutPage() {
  const t = useTranslations();
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("shipping");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingForm, setShippingForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    zip: "",
    country: "BA",
    shippingMethod: "Standard",
  });

  const subtotal = getSubtotal();
  const shippingCost = calculateShippingCost(
    shippingForm.country,
    shippingForm.shippingMethod,
    subtotal
  );
  const taxAmount = Math.round((subtotal - discountAmount) * 0.17);
  const total = subtotal + shippingCost - discountAmount + taxAmount;

  const zone = getShippingZone(shippingForm.country);

  const updateField = (field: string, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const res = await fetch("/api/checkout/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountAmount(data.discountAmount);
        setError("");
      } else {
        setError(data.error);
        setDiscountAmount(0);
      }
    } catch {
      setError("Failed to validate discount code");
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: shippingForm.email,
          phone: shippingForm.phone,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            sku: "",
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress: {
            firstName: shippingForm.firstName,
            lastName: shippingForm.lastName,
            street: shippingForm.street,
            city: shippingForm.city,
            zip: shippingForm.zip,
            country: shippingForm.country,
            phone: shippingForm.phone,
          },
          shippingMethod: shippingForm.shippingMethod,
          shippingCost,
          discountAmount,
          discountCode: discountCode || undefined,
          taxAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create order");
        return;
      }

      const { orderNumber } = await res.json();
      clearCart();
      router.push(`/checkout/success?order=${orderNumber}`);
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">{t("checkout.title")}</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-8">
        {(["shipping", "payment", "confirmation"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-sm hidden md:inline">
              {s === "shipping"
                ? t("checkout.shippingInfo")
                : s === "payment"
                  ? t("checkout.payment")
                  : t("checkout.review")}
            </span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {step === "shipping" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.shippingInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("checkout.firstName")}</Label>
                    <Input
                      value={shippingForm.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("checkout.lastName")}</Label>
                    <Input
                      value={shippingForm.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("checkout.email")}</Label>
                  <Input
                    type="email"
                    value={shippingForm.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("checkout.phone")}</Label>
                  <Input
                    value={shippingForm.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("checkout.address")}</Label>
                  <Input
                    value={shippingForm.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("checkout.city")}</Label>
                    <Input
                      value={shippingForm.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("checkout.zip")}</Label>
                    <Input
                      value={shippingForm.zip}
                      onChange={(e) => updateField("zip", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("checkout.country")}</Label>
                  <select
                    value={shippingForm.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="BA">Bosnia and Herzegovina</option>
                    <option value="HR">Croatia</option>
                    <option value="RS">Serbia</option>
                    <option value="ME">Montenegro</option>
                    <option value="DE">Germany</option>
                    <option value="AT">Austria</option>
                  </select>
                </div>

                {/* Shipping method */}
                <div className="space-y-2 mt-6">
                  <Label>{t("checkout.shippingMethod")}</Label>
                  <div className="space-y-2">
                    {zone.methods.map((method) => {
                      const cost = calculateShippingCost(
                        shippingForm.country,
                        method.name,
                        subtotal
                      );
                      return (
                        <label
                          key={method.name}
                          className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${
                            shippingForm.shippingMethod === method.name
                              ? "border-primary bg-primary/5"
                              : "border-input"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value={method.name}
                              checked={shippingForm.shippingMethod === method.name}
                              onChange={(e) =>
                                updateField("shippingMethod", e.target.value)
                              }
                            />
                            <div>
                              <p className="font-medium text-sm">{method.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {t("checkout.estimatedDelivery", {
                                  days: method.estimatedDays,
                                })}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium text-sm">
                            {cost === 0 ? t("checkout.free") : formatPrice(cost)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => {
                    if (
                      shippingForm.firstName &&
                      shippingForm.lastName &&
                      shippingForm.email &&
                      shippingForm.street &&
                      shippingForm.city &&
                      shippingForm.zip
                    ) {
                      setStep("payment");
                    }
                  }}
                >
                  {t("common.next")}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.payment")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("checkout.cardPayment")} - Monri WebPay
                </p>
                {/* Monri Components placeholder */}
                <div
                  id="card-element"
                  className="border rounded-md p-4 min-h-[100px] bg-muted/50"
                >
                  <p className="text-sm text-muted-foreground text-center">
                    Card payment form (Monri Components will be mounted here when
                    credentials are configured)
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("shipping")}
                  >
                    {t("common.back")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep("confirmation")}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "confirmation" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.review")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shipping details review */}
                <div className="space-y-2">
                  <h3 className="font-medium">{t("checkout.shippingInfo")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {shippingForm.firstName} {shippingForm.lastName}
                    <br />
                    {shippingForm.street}
                    <br />
                    {shippingForm.zip} {shippingForm.city}
                    <br />
                    {shippingForm.email}
                  </p>
                </div>

                <Separator />

                {/* Items review */}
                <div className="space-y-2">
                  <h3 className="font-medium">{t("order.items")}</h3>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.name}{" "}
                        {item.variantName && `(${item.variantName})`} x
                        {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep("payment")}
                  >
                    {t("common.back")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading
                      ? t("checkout.processing")
                      : t("checkout.placeOrder")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>{t("checkout.orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate max-w-[200px]">
                    {item.name} x{item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />

              {/* Discount code */}
              <div className="flex gap-2">
                <Input
                  placeholder={t("cart.discountCode")}
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyDiscount}
                >
                  {t("cart.apply")}
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("cart.subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("cart.shipping")}</span>
                  <span>
                    {shippingCost === 0
                      ? t("cart.freeShipping")
                      : formatPrice(shippingCost)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("cart.discount")}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t("cart.tax")} (17%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("cart.total")}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
