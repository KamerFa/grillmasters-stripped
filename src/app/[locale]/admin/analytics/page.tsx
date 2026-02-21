import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/config/currency";
import { getLocalizedField } from "@/lib/utils";

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  let topProducts: { name: unknown; totalSold: number; revenue: number }[] = [];
  let ordersByStatus: { status: string; count: number }[] = [];
  let monthlyRevenue = 0;

  try {
    // Top products by sales
    const orderItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    const productIds = orderItems
      .map((i) => i.productId)
      .filter((id): id is string => id !== null);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    topProducts = orderItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        name: product?.name ?? { bs: "Unknown", en: "Unknown" },
        totalSold: item._sum.quantity ?? 0,
        revenue: item._sum.total ?? 0,
      };
    });

    // Orders by status
    const statusGroups = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    ordersByStatus = statusGroups.map((g) => ({
      status: g.status,
      count: g._count.id,
    }));

    // Monthly revenue
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyResult = await prisma.order.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        paymentStatus: "CAPTURED",
      },
      _sum: { total: true },
    });
    monthlyRevenue = monthlyResult._sum.total ?? 0;
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("analytics")}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Last 30 Days Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(monthlyRevenue)}</p>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length > 0 ? (
              <div className="space-y-2">
                {ordersByStatus.map(({ status, count }) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span>{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top Products by Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Units Sold</th>
                      <th className="text-right py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">
                          {getLocalizedField(product.name, locale)}
                        </td>
                        <td className="py-2 text-right">
                          {product.totalSold}
                        </td>
                        <td className="py-2 text-right">
                          {formatPrice(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No sales data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
