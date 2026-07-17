"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  isVideo?: boolean;
}

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const safe = images.length ? images : [{ id: "x", url: "", alt: name, isVideo: false }];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className="flex gap-2 sm:flex-col">
        {safe.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-20 overflow-hidden rounded-md border-2 transition-colors",
              i === active ? "border-accent" : "border-transparent hover:border-muted",
            )}
            aria-label={`View image ${i + 1}`}
          >
            {img.url ? (
              <Image src={img.url} alt={img.alt ?? name} fill sizes="80px" className="object-cover" />
            ) : (
              <div className="h-full bg-secondary" />
            )}
          </button>
        ))}
      </div>
      <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-secondary">
        {safe[active]?.url ? (
          <Image
            src={safe[active].url}
            alt={safe[active].alt ?? name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
      </div>
    </div>
  );
}
