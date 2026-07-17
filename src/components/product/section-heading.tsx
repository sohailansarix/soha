import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View all",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
