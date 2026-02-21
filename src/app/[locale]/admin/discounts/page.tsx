import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/config/currency";
import { Plus } from "lucide-react";

export default async function AdminDiscountsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  let discounts: {
    id: string;
    code: string;
    type: string;
    value: number;
    isActive: boolean;
    usageCount: number;
    usageLimit: number | null;
    validFrom: Date | null;
    validUntil: Date | null;
  }[] = [];

  try {
    discounts = await prisma.discountCode.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("discounts")}</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addDiscount")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">{t("discountCode")}</th>
                  <th className="text-left p-4">{t("discountType")}</th>
                  <th className="text-right p-4">{t("discountValue")}</th>
                  <th className="text-center p-4">Usage</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-left p-4">Valid Until</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-muted/30">
                    <td className="p-4 font-mono font-medium">{d.code}</td>
                    <td className="p-4 text-muted-foreground">{d.type}</td>
                    <td className="p-4 text-right">
                      {d.type === "PERCENTAGE"
                        ? `${d.value}%`
                        : d.type === "FIXED_AMOUNT"
                          ? formatPrice(d.value)
                          : "Free Shipping"}
                    </td>
                    <td className="p-4 text-center">
                      {d.usageCount}
                      {d.usageLimit ? ` / ${d.usageLimit}` : ""}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={d.isActive ? "success" : "secondary"}>
                        {d.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {d.validUntil
                        ? new Date(d.validUntil).toLocaleDateString(locale)
                        : "No expiry"}
                    </td>
                  </tr>
                ))}
                {discounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No discount codes yet
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
