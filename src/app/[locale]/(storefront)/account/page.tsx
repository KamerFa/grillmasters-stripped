import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Package, MapPin, Heart, Settings } from "lucide-react";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations({ locale });

  const links = [
    {
      href: "/account/orders" as const,
      icon: Package,
      title: t("account.orders"),
    },
    {
      href: "/account/addresses" as const,
      icon: MapPin,
      title: t("account.addresses"),
    },
    {
      href: "/account/wishlist" as const,
      icon: Heart,
      title: t("account.wishlist"),
    },
    {
      href: "/account/settings" as const,
      icon: Settings,
      title: t("account.settings"),
    },
  ];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-2">{t("account.title")}</h1>
      <p className="text-muted-foreground mb-8">
        {session.user.firstName} {session.user.lastName} ({session.user.email})
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {links.map(({ href, icon: Icon, title }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Icon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-sm">{title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
