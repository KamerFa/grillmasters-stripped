import { getTranslations } from "next-intl/server";
import { getOrders } from "@/services/order.service";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/config/currency";
import type { OrderStatus } from "@prisma/client";

const statusVariant: Record<string, "default" | "success" | "destructive" | "warning" | "secondary"> = {
  PENDING: "warning",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "secondary",
};

const paymentVariant: Record<string, "default" | "success" | "destructive" | "warning" | "secondary"> = {
  PENDING: "warning",
  AUTHORIZED: "default",
  CAPTURED: "success",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin" });

  const page = Number(sp.page) || 1;

  let result: Awaited<ReturnType<typeof getOrders>>;
  try {
    result = await getOrders({
      status: sp.status as OrderStatus | undefined,
      search: sp.search,
      page,
    });
  } catch {
    result = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("orders")}</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
          (status) => (
            <Link
              key={status}
              href={`/admin/orders${status ? `?status=${status}` : ""}`}
            >
              <Button
                variant={
                  (sp.status ?? "") === status ? "default" : "outline"
                }
                size="sm"
              >
                {status || "All"}
              </Button>
            </Link>
          )
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-center p-4">Payment</th>
                  <th className="text-right p-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : order.email}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(locale)}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={statusVariant[order.status]}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={paymentVariant[order.paymentStatus]}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
                {result.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Link key={p} href={`/admin/orders?page=${p}${sp.status ? `&status=${sp.status}` : ""}`}>
                <Button
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                >
                  {p}
                </Button>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
