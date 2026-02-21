import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/config/currency";
import { getLocalizedField } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  let products: {
    id: string;
    sku: string;
    name: unknown;
    slug: string;
    price: number;
    isActive: boolean;
    isFeatured: boolean;
    variants: { stock: number; reservedStock: number }[];
    images: { url: string }[];
  }[] = [];

  try {
    products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        variants: { select: { stock: true, reservedStock: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("products")}</h1>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("addProduct")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Image</th>
                  <th className="text-left p-4">{t("productName")}</th>
                  <th className="text-left p-4">SKU</th>
                  <th className="text-right p-4">{t("productPrice")}</th>
                  <th className="text-right p-4">{t("productStock")}</th>
                  <th className="text-center p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + v.stock - v.reservedStock,
                    0
                  );
                  return (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                          {product.images[0] && (
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium hover:underline"
                        >
                          {getLocalizedField(product.name, locale)}
                        </Link>
                        {product.isFeatured && (
                          <Badge variant="secondary" className="ml-2">
                            Featured
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {product.sku}
                      </td>
                      <td className="p-4 text-right">
                        {formatPrice(product.price)}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={
                            totalStock <= 5
                              ? "text-yellow-600 font-medium"
                              : totalStock <= 0
                                ? "text-red-600 font-medium"
                                : ""
                          }
                        >
                          {totalStock}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Badge
                          variant={product.isActive ? "success" : "secondary"}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No products yet
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
