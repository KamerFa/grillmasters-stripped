import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale });

  const orderNumber = sp.order ?? "";

  return (
    <div className="container py-16 flex items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="py-12 space-y-6">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
          <h1 className="text-2xl font-bold">{t("order.thankYou")}</h1>
          {orderNumber && (
            <p className="text-muted-foreground">
              {t("order.orderNumber")}: <strong>{orderNumber}</strong>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {t("order.confirmationEmail", { email: "your email" })}
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Link href="/products">
              <Button variant="outline">{t("cart.continueShopping")}</Button>
            </Link>
            <Link href="/account/orders">
              <Button>{t("order.history")}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
