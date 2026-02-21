import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  let customers: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    createdAt: Date;
    _count: { orders: number };
  }[] = [];

  try {
    customers = await prisma.user.findMany({
      where: { role: "CUSTOMER", deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("customers")}</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-center p-4">Orders</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-left p-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {customer.email}
                    </td>
                    <td className="p-4 text-center">
                      {customer._count.orders}
                    </td>
                    <td className="p-4 text-center">
                      <Badge
                        variant={customer.isActive ? "success" : "secondary"}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString(locale)}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No customers yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
