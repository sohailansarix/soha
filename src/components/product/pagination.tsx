import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-secondary"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="flex items-center">
            {gap && <span className="px-2 text-muted-foreground">…</span>}
            <Link
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm",
                p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}
      {page < totalPages && (
        <Link
          href={hrefFor(page + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-secondary"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
