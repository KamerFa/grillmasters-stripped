import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/storefront/product-card";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations({ locale });

  let wishlistItems: {
    id: string;
    product: Parameters<typeof ProductCard>[0]["product"];
  }[] = [];

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            variants: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    wishlistItems = items.map((item) => ({
      id: item.id,
      product: item.product as unknown as Parameters<typeof ProductCard>[0]["product"],
    }));
  } catch {
    // DB not available
  }

  return (
    <div className="container py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("account.title")}
        </Link>
        <span className="mx-2">/</span>
        <span>{t("account.wishlist")}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-8">{t("account.wishlist")}</h1>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map(({ product }) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("account.emptyWishlist")}</p>
        </div>
      )}
    </div>
  );
}
