// Blog helpers: reading time, table of contents, slug, excerpt.

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

const WORDS_PER_MINUTE = 200;

/** Estimate reading time in minutes from plain text / markdown content. */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Generate a URL-safe slug from a title. */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Build a short excerpt from content if none provided. */
export function makeExcerpt(content: string, max = 160): string {
  const text = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

/**
 * Parse a simple markdown-ish content for headings to build a table of contents.
 * Supports ## and ### headings. Returns items with generated ids.
 */
export function buildToc(content: string): TocItem[] {
  const lines = content.split("\n");
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  for (const line of lines) {
    const m = /^(#{2,3})\s+(.*)$/.exec(line.trim());
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/[#*_`]/g, "").trim();
    let id = slugifyTitle(text) || "section";
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ id, text, level });
  }
  return items;
}

/** Render content to a list of blocks with heading ids injected for TOC anchors. */
export interface ContentBlock {
  type: "heading" | "paragraph" | "image" | "video" | "code" | "list";
  id?: string;
  level?: number;
  text?: string;
  url?: string;
  caption?: string;
  items?: string[];
}

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)\s*(?:\*(.*)\*)?$/;
const VIDEO_RE = /^@video\(([^)]+)\)\s*(?:\*(.*)\*)?$/;
const CODE_RE = /^```(\w*)\n([\s\S]*?)```$/;
const LIST_ITEM_RE = /^[-*]\s+(.*)$/;

/**
 * Lightweight markdown renderer that splits content into blocks and injects
 * stable ids on headings so the TOC can link to them. Supports headings,
 * paragraphs, images (with optional *caption*), videos (@video(url) *caption*),
 * fenced code, and unordered lists.
 */
export function parseContent(content: string): ContentBlock[] {
  const lines = content.split("\n");
  const blocks: ContentBlock[] = [];
  const seen = new Map<string, number>();
  let i = 0;

  const headingId = (text: string) => {
    let id = slugifyTitle(text) || "section";
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    return id;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const code = CODE_RE.exec(line);
    if (code) {
      blocks.push({ type: "code", text: code[2].replace(/\n$/, "") });
      i++;
      continue;
    }

    // Heading
    const h = HEADING_RE.exec(line.trim());
    if (h) {
      const text = h[2].replace(/[#*_`]/g, "").trim();
      const id = headingId(text);
      blocks.push({ type: "heading", level: h[1].length, text, id });
      i++;
      continue;
    }

    // Image with optional caption
    const img = IMAGE_RE.exec(line.trim());
    if (img) {
      blocks.push({ type: "image", url: img[2], caption: img[1] || img[3] || undefined });
      i++;
      continue;
    }

    // Video
    const vid = VIDEO_RE.exec(line.trim());
    if (vid) {
      blocks.push({ type: "video", url: vid[1], caption: vid[2] || undefined });
      i++;
      continue;
    }

    // List
    if (LIST_ITEM_RE.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && LIST_ITEM_RE.test(lines[i].trim())) {
        const m = LIST_ITEM_RE.exec(lines[i].trim());
        if (m) items.push(m[1]);
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // Paragraph (collect consecutive non-empty, non-special lines)
    if (line.trim() === "") {
      i++;
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !HEADING_RE.test(lines[i].trim()) &&
      !IMAGE_RE.test(lines[i].trim()) &&
      !VIDEO_RE.test(lines[i].trim()) &&
      !CODE_RE.test(lines[i].trim()) &&
      !LIST_ITEM_RE.test(lines[i].trim())
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) blocks.push({ type: "paragraph", text: para.join("\n") });
  }

  return blocks;
}

/** Inline markdown -> safe HTML-ish string (bold, italic, links, inline code). */
export function renderInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent underline">$1</a>');
}
