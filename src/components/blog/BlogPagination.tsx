import { RouteLink } from "@/components/ui/RouteLink";
import { pageNumbers } from "@/lib/pagination";
import styles from "./BlogPagination.module.css";

type BlogPaginationProps = {
  page: number;
  pages: number;
  href: (page: number) => string;
};

/** Newer · page numbers · older, under the blog's article grid. */
export function BlogPagination({ page, pages, href }: BlogPaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="More articles">
      {page > 1 ? (
        <RouteLink href={href(page - 1)} className={styles.step} rel="prev">
          <span aria-hidden="true">←</span> Newer
        </RouteLink>
      ) : (
        <span className={styles.step} aria-disabled="true">
          <span aria-hidden="true">←</span> Newer
        </span>
      )}

      <ol className={styles.pages}>
        {pageNumbers(page, pages).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              <RouteLink href={href(n)} className={styles.page} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`}>
                {n}
              </RouteLink>
            </li>
          ),
        )}
      </ol>

      {page < pages ? (
        <RouteLink href={href(page + 1)} className={styles.step} rel="next">
          Older <span aria-hidden="true">→</span>
        </RouteLink>
      ) : (
        <span className={styles.step} aria-disabled="true">
          Older <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
