import Link from "next/link";
import { pageNumbers } from "@/lib/pagination";
import styles from "./admin.module.css";

type PaginationProps = {
  page: number;
  pages: number;
  /** URL of a given page, keeping the current filter. */
  href: (page: number) => string;
};

export function Pagination({ page, pages, href }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={styles.pageStep} rel="prev">
          <span aria-hidden="true">←</span> Previous
        </Link>
      ) : (
        <span className={styles.pageStep} aria-disabled="true">
          <span aria-hidden="true">←</span> Previous
        </span>
      )}

      <ol className={styles.pageList}>
        {pageNumbers(page, pages).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} className={styles.pageGap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                className={styles.pageLink}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Page ${n}`}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ol>

      {page < pages ? (
        <Link href={href(page + 1)} className={styles.pageStep} rel="next">
          Next <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className={styles.pageStep} aria-disabled="true">
          Next <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
