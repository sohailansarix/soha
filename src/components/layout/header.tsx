"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/components/cart/cart-context";
import { CurrencySwitcher } from "@/components/currency/currency-switcher";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/brands", label: "Brands" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [query, setQuery] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="mb-6 text-2xl font-bold tracking-tight">{SITE.name}</div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary",
                      pathname === item.href && "bg-secondary",
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          {SITE.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(item.href) && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={onSearch} className="ml-auto hidden flex-1 justify-center px-4 lg:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
              aria-label="Search products"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild aria-label="Cart" className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          <CurrencySwitcher />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

function AccountMenu() {
  const [user, setUser] = React.useState<{ name?: string | null; email?: string; image?: string | null; role?: string } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Button variant="ghost" size="icon" aria-label="Account">
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="ghost" size="icon" asChild aria-label="Sign in">
        <Link href="/auth/login">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Account menu">
          <Avatar className="h-8 w-8">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? "User"} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-medium">{user.name ?? "Account"}</div>
          <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">My Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/orders">Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist">Wishlist</Link>
        </DropdownMenuItem>
        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin Dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/api/auth/signout">Sign out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
