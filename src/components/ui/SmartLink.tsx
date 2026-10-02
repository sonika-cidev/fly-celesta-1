"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { RouteLink } from "./RouteLink";

type SmartLinkProps = Omit<ComponentProps<"a">, "href"> & { href: string };

/**
 * A section on the current page → plain anchor, so Lenis glides to it (the current page
 * itself → its top; every page starts with a #top section).
 * Another page → RouteLink (client-side navigation, then scroll to any #hash).
 */
export function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  const pathname = usePathname();
  const hashAt = href.indexOf("#");
  const path = hashAt >= 0 ? href.slice(0, hashAt) || pathname : href;
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";

  if (path === pathname) {
    return (
      <a href={hash || "#top"} {...rest}>
        {children}
      </a>
    );
  }
  if (!href.startsWith("/")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <RouteLink href={href} {...rest}>
      {children}
    </RouteLink>
  );
}
