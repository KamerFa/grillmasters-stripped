"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { ShoppingCart, Search, User, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart.store";
import { useLocale } from "next-intl";
import { PredictiveSearch } from "./predictive-search";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  const switchLocale = () => {
    const nextLocale = locale === "bs" ? "en" : "bs";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">{t("common.shopName")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/products"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("common.products")}
          </Link>
          <Link
            href="/categories/odjeca"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("nav.newArrivals")}
          </Link>
          <Link
            href="/pages/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("nav.about")}
          </Link>
          <Link
            href="/pages/contact"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("nav.contact")}
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          {searchOpen ? (
            <div className="hidden md:block">
              <PredictiveSearch
                className="w-72"
                onClose={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Language switcher */}
          <Button variant="ghost" size="icon" onClick={switchLocale}>
            <Globe className="h-5 w-5" />
          </Button>

          {/* Account */}
          <Link href="/auth/login">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-3">
            <PredictiveSearch onClose={() => setMobileMenuOpen(false)} />
            <nav className="flex flex-col space-y-2">
              <Link
                href="/products"
                className="text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("common.products")}
              </Link>
              <Link
                href="/categories/odjeca"
                className="text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.newArrivals")}
              </Link>
              <Link
                href="/pages/about"
                className="text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.about")}
              </Link>
              <Link
                href="/pages/contact"
                className="text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.contact")}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
