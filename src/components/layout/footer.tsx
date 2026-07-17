import Link from "next/link";
import { SITE } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/brands", label: "Brands" },
      { href: "/products?sort=newest", label: "New Arrivals" },
      { href: "/products?sort=bestseller", label: "Best Sellers" },
      { href: "/products?onSale=1", label: "Sale" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/shipping", label: "Shipping & Returns" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold tracking-tight">{SITE.name}</div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {SITE.description}
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
