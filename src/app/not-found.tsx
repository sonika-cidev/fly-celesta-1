import { Logo } from "@/components/brand/Logo";
import { RouteLink as Link } from "@/components/ui/RouteLink";
import styles from "./not-found.module.css";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className={styles.page}>
      <Link href="/" aria-label="Fly Celesta — home">
        <Logo width={160} />
      </Link>
      <p className={styles.code}>404</p>
      <h1 className={`serif ${styles.title}`}>
        Off the <em>flight plan.</em>
      </h1>
      <p className={styles.text}>The page you were looking for doesn&rsquo;t exist or has moved.</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>
          Back to home
        </Link>
        <Link href="/contact" className={styles.secondary}>
          Contact us
        </Link>
      </div>
    </main>
  );
}
