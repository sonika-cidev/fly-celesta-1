import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { PostCard, PostGrid } from "@/components/blog/PostCard";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import type { PostPage, PostSummary } from "@/lib/blog";
import { pageParam } from "@/lib/pagination";
import { pageMetadata } from "@/lib/seo";
import { listLivePosts } from "@/lib/server/blog";
import { StoreUnavailableError } from "@/lib/server/store";
import styles from "./blog.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Blog — Helicopter & Private Jet Travel",
  description:
    "Helicopter joyrides, private jet travel tips and aviation news from Fly Celesta — helicopter and private jet services across Kerala, Karnataka and Tamil Nadu.",
  path: "/blog",
  keywords: ["helicopter travel blog", "private jet travel India", "aviation blog India"],
});

// The first page leads with one featured article over a 3 × 3 grid; later pages are 3 × 3
const FIRST_PAGE = 10;
const PER_PAGE = 9;
const offsetOf = (page: number) => (page === 1 ? 0 : FIRST_PAGE + (page - 2) * PER_PAGE);
const pageCount = (total: number) => (total <= FIRST_PAGE ? 1 : 1 + Math.ceil((total - FIRST_PAGE) / PER_PAGE));
const href = (page: number) => (page > 1 ? `/blog?page=${page}` : "/blog");

export default async function BlogPage(props: PageProps<"/blog">) {
  const page = pageParam((await props.searchParams).page);

  let result: PostPage<PostSummary> | null = null;
  try {
    result = await listLivePosts(page === 1 ? FIRST_PAGE : PER_PAGE, offsetOf(page));
  } catch (error) {
    if (!(error instanceof StoreUnavailableError)) console.error("[blog] could not list posts", error);
  }

  const pages = result ? pageCount(result.total) : 1;
  if (result && result.total > 0 && page > pages) redirect(href(pages));
  const [featured, ...rest] = result && page === 1 ? result.items : [];
  const grid = page === 1 ? rest : (result?.items ?? []);

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        label="Helicopter & private jet travel blog"
        title={["Notes from", <em key="t">the skies.</em>]}
        lede="Travel ideas, aviation insight and news from the Fly Celesta team — from helicopter getaways to buying your first aircraft."
      />

      <section className={styles.listing} aria-label="Articles">
        <div className="container">
          {result && result.total > 0 ? (
            <>
              {featured && <PostCard post={featured} featured heading="h2" />}
              {grid.length > 0 && (
                <div className={featured ? styles.gridAfterFeatured : undefined}>
                  <PostGrid posts={grid} heading="h2" />
                </div>
              )}
              <BlogPagination page={page} pages={pages} href={href} />
            </>
          ) : (
            <Reveal className={styles.empty}>
              <p className="serif">{result ? "Our first articles are on their way." : "The articles couldn’t be loaded just now."}</p>
              <span>{result ? "In the meantime, explore our services or get in touch with the team." : "Please try again in a moment."}</span>
              <div className={styles.emptyActions}>
                <Button href="/services">Our services</Button>
                <Button href="/contact" variant="ghost">
                  Contact us
                </Button>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
