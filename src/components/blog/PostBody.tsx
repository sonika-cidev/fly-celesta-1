import Image from "next/image";
import type { ReactNode } from "react";
import { RouteLink } from "@/components/ui/RouteLink";
import { parseBlocks, type Block, type Inline } from "@/lib/blog-markup";
import styles from "./PostBody.module.css";

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return node.text;
      case "strong":
        return <strong key={i}>{renderInline(node.children)}</strong>;
      case "em":
        return <em key={i}>{renderInline(node.children)}</em>;
      case "link":
        return node.href.startsWith("/") ? (
          <RouteLink key={i} href={node.href}>
            {renderInline(node.children)}
          </RouteLink>
        ) : (
          <a key={i} href={node.href} {...(/^https?:/i.test(node.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {renderInline(node.children)}
          </a>
        );
    }
  });
}

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? <h2 key={key}>{renderInline(block.children)}</h2> : <h3 key={key}>{renderInline(block.children)}</h3>;
    case "paragraph":
      return <p key={key}>{renderInline(block.children)}</p>;
    case "list": {
      const items = block.items.map((item, i) => <li key={i}>{renderInline(item)}</li>);
      return block.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
    }
    case "quote":
      return (
        <blockquote key={key}>
          {block.lines.map((line, i) => (
            <p key={i}>{renderInline(line)}</p>
          ))}
        </blockquote>
      );
    case "image":
      return (
        <figure key={key}>
          {/* Shown at its own proportions; the width and height here only size the generated versions */}
          <Image src={block.src} alt={block.alt} width={1600} height={1000} sizes="(max-width: 860px) 92vw, 760px" className={styles.image} />
        </figure>
      );
    case "rule":
      return <hr key={key} />;
  }
}

/** A blog post's body, from its markup (see lib/blog-markup.ts). */
export function PostBody({ content, className }: { content: string; className?: string }) {
  return <div className={`${styles.body} ${className ?? ""}`}>{parseBlocks(content).map(renderBlock)}</div>;
}
