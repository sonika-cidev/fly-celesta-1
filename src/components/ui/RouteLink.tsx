"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type RouteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; children?: ReactNode };

/**
 * Next.js <Link> that prefetches on intent — hover, focus or touch — instead of as soon as it
 * enters the viewport. The header links are always on screen, so viewport prefetching would
 * download every page's data and styles on each visit; this keeps navigation quick without that.
 */
export function RouteLink({ href, onMouseEnter, onFocus, onTouchStart, ...rest }: RouteLinkProps) {
  const router = useRouter();
  const warm = () => router.prefetch(href);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      {...rest}
    />
  );
}
