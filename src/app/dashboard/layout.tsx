import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { auth } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/dashboard");

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Link>
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </SiteLayout>
  );
}
