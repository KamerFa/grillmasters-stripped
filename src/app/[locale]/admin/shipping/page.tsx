import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/config/currency";
import { getLocalizedField } from "@/lib/utils";

export default async function AdminShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  let zones: {
    id: string;
    name: unknown;
    countries: unknown;
    method: string;
    price: number;
    freeAbove: number | null;
    estimatedDays: string | null;
    isActive: boolean;
  }[] = [];

  try {
    zones = await prisma.shippingZone.findMany({
      orderBy: { createdAt: "asc" },
    });
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("shipping")}</h1>

      <div className="grid gap-4">
        {zones.map((zone) => {
          const countries = zone.countries as string[];
          return (
            <Card key={zone.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {getLocalizedField(zone.name, locale)}
                  </CardTitle>
                  <Badge variant={zone.isActive ? "success" : "secondary"}>
                    {zone.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Method:</span> {zone.method}
                </p>
                <p>
                  <span className="font-medium">Price:</span>{" "}
                  {formatPrice(zone.price)}
                </p>
                {zone.freeAbove && (
                  <p>
                    <span className="font-medium">Free above:</span>{" "}
                    {formatPrice(zone.freeAbove)}
                  </p>
                )}
                {zone.estimatedDays && (
                  <p>
                    <span className="font-medium">Estimated delivery:</span>{" "}
                    {zone.estimatedDays} days
                  </p>
                )}
                <p>
                  <span className="font-medium">Countries:</span>{" "}
                  {countries.join(", ")}
                </p>
              </CardContent>
            </Card>
          );
        })}

        {zones.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No shipping zones configured yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
