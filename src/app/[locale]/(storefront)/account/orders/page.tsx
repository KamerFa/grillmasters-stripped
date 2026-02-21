import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/services/order.service";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/config/currency";

const statusVariant = {
  PENDING: "warning" as const,
  CONFIRMED: "default" as const,
  PROCESSING: "default" as const,
  SHIPPED: "default" as const,
  DELIVERED: "success" as const,
  CANCELLED: "destructive" as const,
  REFUNDED: "secondary" as const,
};

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations({ locale });

  let ordersResult: Awaited<ReturnType<typeof getUserOrders>>;
  try {
    ordersResult = await getUserOrders(session.user.id);
  } catch {
    ordersResult = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  return (
    <div className="container py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("account.title")}
        </Link>
        <span className="mx-2">/</span>
        <span>{t("account.orders")}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-8">{t("account.orders")}</h1>

      {ordersResult.items.length > 0 ? (
        <div className="space-y-4">
          {ordersResult.items.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(locale)} -{" "}
                        {order.items.length} {t("order.items").toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusVariant[order.status]}>
                        {t(`order.${order.status.toLowerCase()}`)}
                      </Badge>
                      <p className="font-semibold mt-1">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("order.noOrders")}</p>
        </div>
      )}
    </div>
  );
}
