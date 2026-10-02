import type { Metadata } from "next";
import type { ReactNode } from "react";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Inquiries",
  robots: { index: false, follow: false },
};

/** Private area: plain page, no site header, footer or smooth scrolling. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
