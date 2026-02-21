import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default async function AddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations({ locale });

  let addresses: { id: string; firstName: string; lastName: string; street: string; city: string; zip: string; country: string; isDefault: boolean; type: string }[] = [];
  try {
    addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    });
  } catch {
    // DB not available
  }

  return (
    <div className="container py-8 max-w-2xl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("account.title")}
        </Link>
        <span className="mx-2">/</span>
        <span>{t("account.addresses")}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t("account.addresses")}</h1>
      </div>

      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {addr.firstName} {addr.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.zip} {addr.city}, {addr.country}
                      </p>
                    </div>
                  </div>
                  {addr.isDefault && (
                    <Badge variant="secondary">
                      {t("account.defaultAddress")}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No addresses saved yet.</p>
        </div>
      )}
    </div>
  );
}
