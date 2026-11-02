import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { logout } from "./actions";
import styles from "./admin.module.css";

const SECTIONS = [
  { key: "inquiries", label: "Inquiries", href: "/admin" },
  { key: "blog", label: "Blog", href: "/admin/blog" },
] as const;

type AdminHeaderProps = {
  title: string;
  section: (typeof SECTIONS)[number]["key"];
};

/** Top of every signed-in admin page: brand and page title, the section switch, and sign out. */
export function AdminHeader({ title, section }: AdminHeaderProps) {
  return (
    <header className={styles.top}>
      <div className={styles.brand}>
        <Logo width={118} />
        <span className={styles.divider} aria-hidden="true" />
        <h1 className={`serif ${styles.heading}`}>{title}</h1>
      </div>
      <div className={styles.topActions}>
        <nav className={styles.sections} aria-label="Admin sections">
          {SECTIONS.map((s) => (
            <Link key={s.key} href={s.href} className={styles.section} aria-current={s.key === section ? "page" : undefined}>
              {s.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button type="submit" className={styles.ghost}>
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
