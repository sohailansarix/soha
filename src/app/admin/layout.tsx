import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/constants";
import { CurrencySwitcher } from "@/components/currency/currency-switcher";
import { BarChart3, Package, ShoppingCart, Users, Tag, FolderTree, Building2, Settings, LineChart, Star, CreditCard, UserCog, Newspaper } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/reports", label: "Sales Reports", icon: LineChart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "ADMIN")) redirect("/dashboard");

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-60 shrink-0 border-r bg-muted/30 p-4 md:block">
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="text-sm font-semibold text-muted-foreground">Admin</span>
          <CurrencySwitcher align="end" />
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
