import { IMAGE_ALT_PLACEHOLDER } from "@/lib/blog";

// The editor toolbar's changes to the article text, as pure functions: each says which range of the
// text to replace, with what, and what to select afterwards (positions in the new text).

export type TextEdit = { start: number; end: number; text: string; select: [number, number] };

export type LineStyle = "h2" | "h3" | "bullet" | "numbered" | "quote";

const BLOCK_PREFIX = /^(#{1,6}\s+|[-*•]\s+|\d{1,3}[.)]\s+|>\s?)/;
const NUMBERED = /^\d{1,3}[.)]\s+/;

const linePrefix = (style: LineStyle, index: number) =>
  ({ h2: "## ", h3: "### ", bullet: "- ", numbered: `${index + 1}. `, quote: "> " })[style];

/** **bold** or *italic* around the selection (or a placeholder); applied again, removes it. */
export function wrap(value: string, start: number, end: number, marker: "**" | "*", placeholder: string): TextEdit {
  const m = marker.length;
  const wrapped = value.slice(start - m, start) === marker && value.slice(end, end + m) === marker;
  // For italic, the asterisks must not belong to a bold marker
  const partOfBold = marker === "*" && (value[start - m - 1] === "*" || value[end + m] === "*");
  if (wrapped && !partOfBold) {
    const inner = value.slice(start, end);
    return { start: start - m, end: end + m, text: inner, select: [start - m, start - m + inner.length] };
  }

  const selected = value.slice(start, end);
  // Keep spaces caught in the selection outside the markers: "**word** ", not "**word **"
  const core = selected.trim();
  const lead = core ? selected.slice(0, selected.indexOf(core)) : selected;
  const trail = core ? selected.slice(lead.length + core.length) : "";
  const inner = core || placeholder;
  const at = start + lead.length + m;
  return { start, end, text: `${lead}${marker}${inner}${marker}${trail}`, select: [at, at + inner.length] };
}

/** Turns the selected lines into a heading, list or quotation; applied again, back into paragraphs. */
export function styleLines(value: string, start: number, end: number, style: LineStyle): TextEdit {
  const from = value.lastIndexOf("\n", start - 1) + 1;
  // A selection ending just after a line break doesn't include the next line
  const stop = end > start && value[end - 1] === "\n" ? end - 1 : end;
  let to = value.indexOf("\n", stop);
  if (to < 0) to = value.length;

  const lines = value.slice(from, to).split("\n");
  const filled = lines.filter((line) => line.trim());
  if (filled.length === 0) {
    const prefix = linePrefix(style, 0);
    return { start: from, end: to, text: prefix, select: [from + prefix.length, from + prefix.length] };
  }

  const has = (line: string) => (style === "numbered" ? NUMBERED.test(line) : line.startsWith(linePrefix(style, 0)));
  const remove = filled.every(has);
  let n = 0;
  const text = lines.map((line) => (line.trim() ? (remove ? "" : linePrefix(style, n++)) + line.replace(BLOCK_PREFIX, "") : line)).join("\n");
  const caret = from + text.length;
  return { start: from, end: to, text, select: lines.length === 1 ? [caret, caret] : [from, caret] };
}

/** [selected text](href), with the link text selected. */
export function link(value: string, start: number, end: number, href: string): TextEdit {
  const label = value.slice(start, end).trim() || "link text";
  return { start, end, text: `[${label}](${href})`, select: [start + 1, start + 1 + label.length] };
}

/** A block on lines of its own (an image or a divider), separated from the text around it by blank lines. */
export function insertBlock(value: string, start: number, end: number, block: string, selectWithin?: [number, number]): TextEdit {
  const before = value.slice(0, start);
  const after = value.slice(end);
  const lead = !before || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const trail = !after ? "\n" : after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  const text = lead + block + trail;
  const at = start + lead.length;
  return { start, end, text, select: selectWithin ? [at + selectWithin[0], at + selectWithin[1]] : [start + text.length, start + text.length] };
}

export const imageMarkup = (url: string) => `![${IMAGE_ALT_PLACEHOLDER}](${url})`;
