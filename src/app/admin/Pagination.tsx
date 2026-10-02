import Link from "next/link";
import styles from "./admin.module.css";

type PaginationProps = {
  page: number;
  pages: number;
  /** URL of a given page, keeping the current filter. */
  href: (page: number) => string;
};

/** Page numbers to show: the first, the last and the current one with its neighbours; gaps become "…". */
function pageNumbers(page: number, pages: number): (number | "gap")[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  // Fill a gap of exactly one page rather than showing "…" for it
  if (wanted.has(3) && !wanted.has(2) && pages >= 3) wanted.add(2);
  if (wanted.has(pages - 2) && !wanted.has(pages - 1)) wanted.add(pages - 1);
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? (["gap", n] as const) : ([n] as const)));
}

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
