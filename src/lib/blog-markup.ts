import { MEDIA_PATH } from "./blog";

/**
 * The small, Markdown-like markup blog posts are written in. It is turned into a tree that the
 * site renders as React elements, so nothing typed in the editor is ever inserted as raw HTML.
 *
 *   ## Heading            ### Subheading
 *   **bold**  *italic*    [link text](https://example.com)
 *   - bullet item         1. numbered item
 *   > quotation           ---  (divider)
 *   ![description](/media/…)   an uploaded image, on its own line
 *
 * Any other line is a paragraph.
 */

export type Inline =
  | { type: "text"; text: string }
  | { type: "strong" | "em"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] };

export type Block =
  | { type: "heading"; level: 2 | 3; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "quote"; lines: Inline[][] }
  | { type: "image"; src: string; alt: string }
  | { type: "rule" };

const HEADING = /^(#{1,6})\s+(.+)$/;
const RULE = /^([-*_])(?:\s*\1){2,}$/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const BULLET = /^[-*•]\s+(.+)$/;
const NUMBERED = /^\d{1,3}[.)]\s+(.+)$/;
const QUOTE = /^>\s?(.*)$/;
const LINK = /^\[([^\]]+)\]\(([^()\s]+)\)/;

/** Web, email and phone links, and links within the site; nothing that could run script. */
export const isSafeHref = (href: string) => /^(https?:\/\/|mailto:|tel:|#)/i.test(href) || (href.startsWith("/") && !href.startsWith("//"));

export function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trim());
  const blocks: Block[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const heading = HEADING.exec(line);
    if (heading) {
      // The post title is the page's only h1, so "#" and "##" are both section headings
      blocks.push({ type: "heading", level: heading[1].length <= 2 ? 2 : 3, children: parseInline(heading[2]) });
      continue;
    }
    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      continue;
    }
    const image = IMAGE.exec(line);
    if (image && MEDIA_PATH.test(image[2])) {
      blocks.push({ type: "image", alt: image[1].trim(), src: image[2] });
      continue;
    }

    // Lists run over consecutive item lines (blank lines between items allowed); a quotation ends at a blank line
    const kind = BULLET.test(line) ? "bullet" : NUMBERED.test(line) ? "numbered" : QUOTE.test(line) ? "quote" : null;
    if (kind) {
      const pattern = kind === "bullet" ? BULLET : kind === "numbered" ? NUMBERED : QUOTE;
      const items: Inline[][] = [];
      for (let j = i; j < lines.length; j++) {
        const match = pattern.exec(lines[j]);
        if (match) {
          if (match[1].trim()) items.push(parseInline(match[1].trim()));
          i = j;
        } else if (lines[j] || kind === "quote") {
          break;
        }
      }
      if (items.length) {
        blocks.push(kind === "quote" ? { type: "quote", lines: items } : { type: "list", ordered: kind === "numbered", items });
      }
      continue;
    }

    blocks.push({ type: "paragraph", children: parseInline(line) });
  }
  return blocks;
}

export function parseInline(text: string, inLink = false): Inline[] {
  const out: Inline[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) out.push({ type: "text", text: buffer });
    buffer = "";
  };

  for (let i = 0; i < text.length; ) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ type: "strong", children: parseInline(text.slice(i + 2, end), inLink) });
        i = end + 2;
        continue;
      }
    } else if (text[i] === "*") {
      const end = text.indexOf("*", i + 1);
      // "*word*", not a lone asterisk as in "5 * 3"
      if (end > i + 1 && text[i + 1] !== " " && text[end - 1] !== " " && text[end + 1] !== "*") {
        flush();
        out.push({ type: "em", children: parseInline(text.slice(i + 1, end), inLink) });
        i = end + 1;
        continue;
      }
    } else if (text[i] === "[" && !inLink) {
      const link = LINK.exec(text.slice(i));
      if (link && isSafeHref(link[2])) {
        // An image from elsewhere (only uploads are shown as images) becomes a link to it
        if (buffer.endsWith("!")) buffer = buffer.slice(0, -1);
        flush();
        out.push({ type: "link", href: link[2], children: parseInline(link[1], true) });
        i += link[0].length;
        continue;
      }
    }
    buffer += text[i];
    i++;
  }
  flush();
  return out;
}

export const inlineText = (nodes: Inline[]): string => nodes.map((n) => (n.type === "text" ? n.text : inlineText(n.children))).join("");

/** The words of a post, without markup. */
export function plainText(source: string) {
  return parseBlocks(source)
    .map((block) => {
      switch (block.type) {
        case "heading":
        case "paragraph":
          return inlineText(block.children);
        case "list":
          return block.items.map(inlineText).join(" ");
        case "quote":
          return block.lines.map(inlineText).join(" ");
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(" ");
}

/** About 200 words a minute, at least one. */
export const readingMinutes = (source: string) => Math.max(1, Math.round(plainText(source).split(/\s+/).filter(Boolean).length / 200));

/** Text cut at a word boundary to at most `max` characters (plus "…"). */
export function shorten(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[\s,;:.–—-]+$/, "")}…`;
}

/** The opening paragraph, shortened to a sentence or two — used when a post has no excerpt of its own. */
export function excerptFrom(source: string, max = 200) {
  const first = parseBlocks(source).find((block) => block.type === "paragraph");
  return shorten(first ? inlineText(first.children).trim() : "", max);
}

/** The post's own excerpt, or the opening of the article. */
export const summaryOf = (post: { excerpt: string; content: string }) => post.excerpt || excerptFrom(post.content);
