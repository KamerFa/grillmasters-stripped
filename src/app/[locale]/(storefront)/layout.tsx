import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartHydration } from "@/components/storefront/cart-hydration";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <CartHydration />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
