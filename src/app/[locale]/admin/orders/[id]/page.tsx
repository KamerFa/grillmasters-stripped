import { notFound } from "next/navigation";
import { getOrderById } from "@/services/order.service";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/config/currency";
import { AdminOrderActions } from "@/components/admin/order-actions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  let order: Awaited<ReturnType<typeof getOrderById>>;
  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }
  if (!order) notFound();

  const shippingAddr = order.shippingAddress as Record<string, string>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-bold mt-2">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString(locale)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge>{order.status}</Badge>
          <Badge variant={order.paymentStatus === "CAPTURED" ? "success" : "warning"}>
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku} | Qty: {item.quantity} | {formatPrice(item.price)} each
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
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

          {/* Actions */}
          <AdminOrderActions orderId={order.id} currentStatus={order.status} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {order.user && (
                <p className="font-medium">
                  {order.user.firstName} {order.user.lastName}
                </p>
              )}
              <p className="text-muted-foreground">{order.email}</p>
              {order.phone && (
                <p className="text-muted-foreground">{order.phone}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{shippingAddr.firstName} {shippingAddr.lastName}</p>
              <p>{shippingAddr.street}</p>
              <p>{shippingAddr.zip} {shippingAddr.city}</p>
              <p>{shippingAddr.country}</p>
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{order.trackingNumber}</p>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Track package
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {order.adminNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{order.adminNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
