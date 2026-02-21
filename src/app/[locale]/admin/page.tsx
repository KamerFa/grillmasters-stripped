import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/services/order.service";
import { formatPrice } from "@/config/currency";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  let stats: Awaited<ReturnType<typeof getDashboardStats>>;
  try {
    stats = await getDashboardStats();
  } catch {
    stats = {
      todayOrders: 0,
      todayRevenue: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      pendingOrders: 0,
      avgOrderValue: 0,
      recentOrders: [],
    };
  }

  const statCards = [
    {
      title: t("totalRevenue"),
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      title: t("totalOrders"),
      value: String(stats.totalOrders),
      icon: ShoppingCart,
    },
    {
      title: t("totalCustomers"),
      value: String(stats.totalCustomers),
      icon: Users,
    },
    {
      title: t("avgOrderValue"),
      value: formatPrice(stats.avgOrderValue),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground mt-1">
          Today: {stats.todayOrders} orders, {formatPrice(stats.todayRevenue)}{" "}
          revenue
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Orders Alert */}
      {stats.pendingOrders > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-800">
              {stats.pendingOrders} orders pending fulfillment
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : "Guest"}{" "}
                      - {order._count.items} items
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "success"
                          : order.status === "CANCELLED"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {order.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
