import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{t("common.shopName")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.newsletterText")}
            </p>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              {t("footer.customerService")}
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/pages/contact"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("nav.contact")}
              </Link>
              <Link
                href="/pages/shipping"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("nav.shippingPolicy")}
              </Link>
              <Link
                href="/account/orders"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("order.trackOrder")}
              </Link>
            </nav>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              {t("footer.information")}
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/pages/about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("nav.about")}
              </Link>
              <Link
                href="/pages/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("nav.privacyPolicy")}
              </Link>
              <Link
                href="/pages/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("nav.terms")}
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t("footer.newsletter")}</h4>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("footer.subscribe")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {t("common.shopName")}.{" "}
          {t("footer.allRightsReserved")}.
        </div>
      </div>
    </footer>
  );
}
