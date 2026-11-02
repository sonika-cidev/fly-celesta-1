import { connection } from "next/server";
import type { ReactNode } from "react";
import { PostGrid } from "@/components/blog/PostCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PostSummary } from "@/lib/blog";
import { listLivePosts } from "@/lib/server/blog";
import { StoreUnavailableError } from "@/lib/server/store";
import styles from "./LatestPosts.module.css";

type LatestPostsProps = {
  /** Leave this post out (the one being read). */
  exclude?: string;
  label?: string;
  /** Use <em> for the champagne italic accent. */
  title?: ReactNode;
  intro?: ReactNode;
};

/**
 * The three newest articles, with a link to the blog. Renders nothing until there are posts — or if the
 * database can't be reached, so the page around it still loads. Wrap it in <Suspense> so it never holds the page up.
 */
export async function LatestPosts({
  exclude,
  label = "From the blog",
  title = (
    <>
      Notes from
      <br />
      <em>the skies.</em>
    </>
  ),
  intro = <p>Travel ideas, aviation insight and news from the Fly Celesta team.</p>,
}: LatestPostsProps) {
  // Outside the try: while prerendering, connection() stops the render by throwing, which must not be caught
  await connection();
  let posts: PostSummary[] = [];
  try {
    const { items } = await listLivePosts(exclude ? 4 : 3);
    posts = items.filter((post) => post.id !== exclude).slice(0, 3);
  } catch (error) {
    if (!(error instanceof StoreUnavailableError)) console.error("[blog] could not load the latest posts", error);
  }
  if (posts.length === 0) return null;

  return (
    <section className={styles.latest} aria-labelledby="latest-posts-title">
      <div className="container">
        <SectionHeading id="latest-posts-title" label={label} title={title} intro={intro} />
        <PostGrid posts={posts} />
        <Reveal className={styles.more}>
          <Button href="/blog" variant="ghost">
            All articles
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
