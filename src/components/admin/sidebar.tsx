import { Link } from "@/i18n/routing";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Truck,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin" as const, icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products" as const, icon: Package, label: "Products" },
  { href: "/admin/orders" as const, icon: ShoppingCart, label: "Orders" },
  { href: "/admin/customers" as const, icon: Users, label: "Customers" },
  { href: "/admin/discounts" as const, icon: Tag, label: "Discounts" },
  { href: "/admin/shipping" as const, icon: Truck, label: "Shipping" },
  { href: "/admin/analytics" as const, icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings" as const, icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-background min-h-screen">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold">
          SHOP.BA
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
      </div>
      <nav className="px-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-6 left-0 px-6">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Store
        </Link>
      </div>
    </aside>
  );
}
