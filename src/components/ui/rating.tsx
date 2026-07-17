"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  className?: string;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

export function Rating({ value, max = 5, size = 16, className, onChange, readOnly = true }: RatingProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rating: ${value} out of ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= Math.round(display);
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            aria-label={`${idx} star${idx > 1 ? "s" : ""}`}
            className={cn("transition-colors", readOnly ? "cursor-default" : "cursor-pointer")}
            onMouseEnter={() => !readOnly && setHover(idx)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => !readOnly && onChange?.(idx)}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(filled ? "fill-accent text-accent" : "fill-muted text-muted-foreground")}
            />
          </button>
        );
      })}
    </div>
  );
}
