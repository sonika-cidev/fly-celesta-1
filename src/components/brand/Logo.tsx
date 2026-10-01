import type React from "react";
import Image from "next/image";
import logoColor from "@/assets/brand/logo.png";
import logoLight from "@/assets/brand/logo-light.png";
import styles from "./Logo.module.css";

type LogoProps = {
  /** "light" reverses the navy lettering for dark backgrounds. */
  variant?: "color" | "light";
  /** Rendered width in CSS px; height follows the logo's native aspect ratio. */
  width?: number;
  preload?: boolean;
  className?: string;
};

export function Logo({ variant = "color", width = 200, preload = false, className }: LogoProps) {
  const src = variant === "light" ? logoLight : logoColor;

  return (
    <Image
      src={src}
      alt="Fly Celesta — Beyond Horizons"
      className={`${styles.logo} ${className ?? ""}`}
      style={{ "--logo-w": `${width}px` } as React.CSSProperties}
      sizes={`${width}px`}
      quality={85}
      preload={preload}
    />
  );
}
