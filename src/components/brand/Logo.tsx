import type { CSSProperties } from "react";
import Image from "next/image";
import logoColor from "@/assets/brand/logo.png";
import logoLight from "@/assets/brand/logo-light.png";
import styles from "./Logo.module.css";

type LogoProps = {
  /** "light" reverses the navy lettering for dark backgrounds. */
  variant?: "color" | "light";
  /** CSS width in px; the height always follows the logo's own proportions. */
  width?: number;
  preload?: boolean;
  className?: string;
};

export function Logo({ variant = "color", width = 180, preload = false, className }: LogoProps) {
  return (
    <Image
      src={variant === "light" ? logoLight : logoColor}
      alt="Fly Celesta — Beyond Horizons"
      className={`${styles.logo} ${className ?? ""}`}
      style={{ "--logo-w": `${width}px` } as CSSProperties}
      sizes={`${width}px`}
      quality={85}
      preload={preload}
    />
  );
}
