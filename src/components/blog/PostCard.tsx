import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Button";
import { RouteLink } from "@/components/ui/RouteLink";
import { formatPostDate, type PostSummary } from "@/lib/blog";
import styles from "./PostCard.module.css";

type PostCardProps = {
  post: PostSummary;
  /** Large, side-by-side layout for the newest post on the blog page. */
  featured?: boolean;
  heading?: "h2" | "h3";
  delay?: number;
};

/** Cover, date and reading time, title, summary — the blog's article card. */
export function PostCard({ post, featured = false, heading: Heading = "h3", delay = 0 }: PostCardProps) {
  const href = `/blog/${post.slug}`;
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className={`${styles.card} ${featured ? styles.featured : ""}`}>
      <RouteLink href={href} tabIndex={-1} aria-hidden="true" className={styles.frameLink}>
        <ImageReveal className={styles.frame} parallax={0} delay={delay}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverAlt}
              fill
              sizes={featured ? "(max-width: 860px) 92vw, 720px" : "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 420px"}
              className={styles.image}
            />
          ) : (
            // No cover: a midnight panel with the reversed logo
            <span className={styles.placeholder}>
              <Logo variant="light" width={featured ? 200 : 150} />
            </span>
          )}
        </ImageReveal>
      </RouteLink>

      <Reveal delay={delay + 0.1} y={18} className={styles.text}>
        <p className={styles.meta}>
          <time dateTime={date.toISOString()}>{formatPostDate(date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </p>
        <Heading className={`serif ${styles.title}`}>
          <RouteLink href={href}>{post.title}</RouteLink>
        </Heading>
        {post.summary && <p className={styles.summary}>{post.summary}</p>}
        <RouteLink href={href} className={styles.read}>
          Read article<span className="sr-only">: {post.title}</span>
          <Arrow />
        </RouteLink>
      </Reveal>
    </article>
  );
}

/** Three across on wide screens, two on tablets, one on phones. */
export function PostGrid({ posts, heading }: { posts: PostSummary[]; heading?: "h2" | "h3" }) {
  return (
    <ol className={styles.grid}>
      {posts.map((post, i) => (
        <li key={post.id}>
          <PostCard post={post} heading={heading} delay={(i % 3) * 0.1} />
        </li>
      ))}
    </ol>
  );
}
