import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostBody } from "@/components/blog/PostBody";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonInner, buttonClass } from "@/components/ui/Button";
import { RequestCharterLink } from "@/components/ui/RequestCharterLink";
import { RouteLink } from "@/components/ui/RouteLink";
import { site } from "@/data/site";
import { formatPostDate } from "@/lib/blog";
import { readingMinutes, shorten, summaryOf } from "@/lib/blog-markup";
import { breadcrumbSchema, DEFAULT_SHARE_IMAGE } from "@/lib/seo";
import { getLivePost } from "@/lib/server/blog";
import { StoreUnavailableError } from "@/lib/server/store";
import styles from "./article.module.css";

/** The published post at this address; without a database there are none. */
async function findPost(slug: string) {
  try {
    return await getLivePost(slug);
  } catch (error) {
    if (error instanceof StoreUnavailableError) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await findPost((await params).slug);
  if (!post) return { title: "Article not found" };

  // Search results show about 160 characters of description and 60 of title; a long title goes without " — Fly Celesta"
  const description = shorten(summaryOf(post), 158);
  const url = `${site.url}/blog/${post.slug}`;
  return {
    title: post.title.length > 46 ? { absolute: post.title } : post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: site.name,
      locale: "en_IN",
      title: post.title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [{ url: `${site.url}${post.coverImage}`, alt: post.coverAlt }] : [DEFAULT_SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const post = await findPost((await params).slug);
  if (!post) notFound();

  const published = post.publishedAt ?? post.createdAt;
  const url = `${site.url}/blog/${post.slug}`;
  const share = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}` },
  ];

  return (
    <>
      <article>
        <header id="top" className={styles.head}>
          <div className="container">
            <div className={styles.headInner}>
              <Reveal y={10}>
                <nav aria-label="Breadcrumb">
                  <ol className={styles.crumbs}>
                    <li>
                      <RouteLink href="/">Home</RouteLink>
                    </li>
                    <li>
                      <RouteLink href="/blog">Blog</RouteLink>
                    </li>
                  </ol>
                </nav>
              </Reveal>
              <Reveal y={12} delay={0.05}>
                <p className={styles.meta}>
                  <span className={styles.dot} aria-hidden="true" />
                  <time dateTime={published.toISOString()}>{formatPostDate(published)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{readingMinutes(post.content)} min read</span>
                </p>
              </Reveal>
              <Reveal y={20} delay={0.12}>
                <h1 className={styles.title}>{post.title}</h1>
              </Reveal>
              {post.excerpt && (
                <Reveal y={16} delay={0.25}>
                  <p className={styles.lede}>{post.excerpt}</p>
                </Reveal>
              )}
            </div>

            {post.coverImage && (
              <ImageReveal className={styles.frame} parallax={0} delay={0.2}>
                <Image src={post.coverImage} alt={post.coverAlt} fill preload sizes="(max-width: 1360px) 92vw, 1240px" className={styles.image} />
              </ImageReveal>
            )}
          </div>
        </header>

        <div className={styles.bodyWrap}>
          <div className="container">
            <PostBody content={post.content} className={styles.body} />

            <footer className={styles.footer}>
              <RouteLink href="/blog" className={styles.back}>
                <span aria-hidden="true">←</span> All articles
              </RouteLink>
              <p className={styles.share}>
                <span>Share</span>
                {share.map((s) => (
                  <a key={s.label} href={s.href} target={s.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </p>
            </footer>

            <Reveal className={styles.cta}>
              <div>
                <p className={styles.ctaLabel}>Fly with us</p>
                <p className={`serif ${styles.ctaTitle}`}>
                  Planning your <em>next journey?</em>
                </p>
                <p className={styles.ctaText}>Share your route and dates — our charter desk will come back with aircraft options and a tailored quote.</p>
              </div>
              <RequestCharterLink className={buttonClass("light")}>
                <ButtonInner>Request a charter</ButtonInner>
              </RequestCharterLink>
            </Reveal>
          </div>
        </div>
      </article>

      <Suspense fallback={null}>
        <LatestPosts
          exclude={post.id}
          label="Keep reading"
          title={
            <>
              More from
              <br />
              <em>the blog.</em>
            </>
          }
          intro={<p>More travel ideas, aviation insight and news from the Fly Celesta team.</p>}
        />
      </Suspense>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: summaryOf(post),
          datePublished: published.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          mainEntityOfPage: url,
          ...(post.coverImage ? { image: [`${site.url}${post.coverImage}`] } : {}),
          author: { "@type": "Organization", name: site.name, url: site.url },
          publisher: { "@type": "Organization", name: site.legalName, url: site.url },
        }}
      />
      <JsonLd data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }])} />
    </>
  );
}
