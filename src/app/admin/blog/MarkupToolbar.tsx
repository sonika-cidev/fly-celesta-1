"use client";

import type { RefObject } from "react";
import { isSafeHref } from "@/lib/blog-markup";
import { insertBlock, link, styleLines, wrap, type LineStyle, type TextEdit } from "./markup-edits";
import styles from "./blog-admin.module.css";

/**
 * Applies an edit to the textarea. Going through the browser's own "insert text" keeps its undo history
 * (Ctrl+Z); where that isn't available the value is set directly.
 */
export function applyEdit(textarea: HTMLTextAreaElement, edit: TextEdit, setValue: (value: string) => void) {
  textarea.focus();
  textarea.setSelectionRange(edit.start, edit.end);
  const done = edit.text ? document.execCommand("insertText", false, edit.text) : document.execCommand("delete");
  if (!done) setValue(textarea.value.slice(0, edit.start) + edit.text + textarea.value.slice(edit.end));
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(...edit.select);
  });
}

/** Asks for a link address and wraps the selection in it. */
export function promptLink(textarea: HTMLTextAreaElement, setValue: (value: string) => void) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const href = window.prompt("Link address — a web address (https://…), or a page on this site such as /contact", "https://")?.trim();
  if (!href || href === "https://") return textarea.focus();
  if (!isSafeHref(href)) {
    window.alert("Use a web address starting with https://, an email link (mailto:…), or a page on this site starting with /.");
    return textarea.focus();
  }
  applyEdit(textarea, link(value, start, end, href), setValue);
}

type ToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  setValue: (value: string) => void;
  /** Opens the file picker for an image in the article. */
  onImage: () => void;
  imageBusy: boolean;
};

const LINE_TOOLS: { style: LineStyle; label: string; title: string }[] = [
  { style: "h2", label: "H2", title: "Heading" },
  { style: "h3", label: "H3", title: "Subheading" },
  { style: "bullet", label: "• List", title: "Bulleted list" },
  { style: "numbered", label: "1. List", title: "Numbered list" },
  { style: "quote", label: "“ Quote", title: "Quotation" },
];

export function MarkupToolbar({ textareaRef, setValue, onImage, imageBusy }: ToolbarProps) {
  const run = (make: (value: string, start: number, end: number) => TextEdit) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    applyEdit(textarea, make(textarea.value, textarea.selectionStart, textarea.selectionEnd), setValue);
  };

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
      <div className={styles.toolGroup}>
        {LINE_TOOLS.slice(0, 2).map((tool) => (
          <button key={tool.style} type="button" className={styles.tool} title={tool.title} aria-label={tool.title} onClick={() => run((v, s, e) => styleLines(v, s, e, tool.style))}>
            {tool.label}
          </button>
        ))}
      </div>
      <div className={styles.toolGroup}>
        <button type="button" className={styles.tool} title="Bold (Ctrl+B)" aria-label="Bold" onClick={() => run((v, s, e) => wrap(v, s, e, "**", "bold text"))}>
          <strong>B</strong>
        </button>
        <button type="button" className={styles.tool} title="Italic (Ctrl+I)" aria-label="Italic" onClick={() => run((v, s, e) => wrap(v, s, e, "*", "italic text"))}>
          <em className="serif">I</em>
        </button>
        <button
          type="button"
          className={styles.tool}
          title="Link (Ctrl+K)"
          aria-label="Link"
          onClick={() => textareaRef.current && promptLink(textareaRef.current, setValue)}
        >
          Link
        </button>
      </div>
      <div className={styles.toolGroup}>
        {LINE_TOOLS.slice(2).map((tool) => (
          <button key={tool.style} type="button" className={styles.tool} title={tool.title} aria-label={tool.title} onClick={() => run((v, s, e) => styleLines(v, s, e, tool.style))}>
            {tool.label}
          </button>
        ))}
      </div>
      <div className={styles.toolGroup}>
        <button type="button" className={styles.tool} title="Image" onClick={onImage} disabled={imageBusy}>
          {imageBusy ? "Uploading…" : "Image"}
        </button>
        <button type="button" className={styles.tool} title="Divider" aria-label="Divider" onClick={() => run((v, s, e) => insertBlock(v, s, e, "---"))}>
          ―
        </button>
      </div>
    </div>
  );
}
