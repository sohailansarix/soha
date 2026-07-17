import Image from "next/image";
import type { JSX } from "react";
import { renderInline, type ContentBlock } from "@/lib/blog";

export function BlogContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          const Tag = (`h${Math.min(b.level ?? 2, 4)}` as unknown) as keyof React.JSX.IntrinsicElements;
          return (
            <Tag key={i} id={b.id} className="scroll-mt-24 pt-2 text-2xl font-bold tracking-tight">
              {b.text}
            </Tag>
          );
        }
        if (b.type === "paragraph") {
          return (
            <p key={i} className="leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderInline(b.text ?? "") }} />
          );
        }
        if (b.type === "image") {
          return (
            <figure key={i} className="overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.url} alt={b.caption ?? ""} loading="lazy" className="w-full object-cover" />
              {b.caption && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">{b.caption}</figcaption>
              )}
            </figure>
          );
        }
        if (b.type === "video") {
          return (
            <figure key={i} className="overflow-hidden rounded-lg">
              <div className="aspect-video">
                <iframe src={b.url} title={b.caption ?? "Video"} className="h-full w-full" allowFullScreen />
              </div>
              {b.caption && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">{b.caption}</figcaption>
              )}
            </figure>
          );
        }
        if (b.type === "code") {
          return (
            <pre key={i} className="overflow-x-auto rounded-lg bg-secondary p-4 text-sm">
              <code>{b.text}</code>
            </pre>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-6 text-muted-foreground">
              {b.items?.map((it, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: renderInline(it) }} />
              ))}
            </ul>
          );
        }
        return null;
      })}
    </div>
  );
}
