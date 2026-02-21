import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/services/order.service";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/config/currency";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations({ locale });

  let order: Awaited<ReturnType<typeof getOrderById>>;
  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }
  if (!order) notFound();
  if (order.userId !== session.user.id && session.user.role === "CUSTOMER") {
    notFound();
  }

  const shippingAddr = order.shippingAddress as Record<string, string>;

  return (
    <div className="container py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("account.title")}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/account/orders" className="hover:text-foreground">
          {t("account.orders")}
        </Link>
        <span className="mx-2">/</span>
        <span>{order.orderNumber}</span>
      </nav>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order info */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <Badge>{t(`order.${order.status.toLowerCase()}`)}</Badge>
          </div>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t("order.items")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("product.sku")}: {item.sku} | {t("product.quantity")}:{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {order.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("order.status")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.timeline.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium text-sm">{event.status}</p>
                        {event.note && (
                          <p className="text-sm text-muted-foreground">
                            {event.note}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString(locale)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("checkout.orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>{t("cart.subtotal")}</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("cart.shipping")}</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t("cart.discount")}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t("cart.tax")}</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("cart.total")}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("checkout.shippingInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                {shippingAddr.firstName} {shippingAddr.lastName}
              </p>
              <p>{shippingAddr.street}</p>
              <p>
                {shippingAddr.zip} {shippingAddr.city}
              </p>
              <p>{shippingAddr.country}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
