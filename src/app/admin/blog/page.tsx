import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatPostDate, postState, type PostPage, type PostSummary } from "@/lib/blog";
import { pageParam } from "@/lib/pagination";
import { hasSession } from "@/lib/server/admin-session";
import { getStore, StoreUnavailableError } from "@/lib/server/store";
import { AdminHeader } from "../AdminHeader";
import { Pagination } from "../Pagination";
import styles from "../admin.module.css";
import blog from "./blog-admin.module.css";

export const metadata: Metadata = { title: "Blog posts" };

// Always rendered per request: it depends on the sign-in cookie and live data.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const STATE_LABEL = { draft: "Draft", scheduled: "Scheduled", published: "Published" } as const;

export default async function AdminBlogPage(props: PageProps<"/admin/blog">) {
  if (!(await hasSession())) redirect("/admin/login");

  const params = await props.searchParams;
  const page = pageParam(params.page);
  const deleted = params.deleted !== undefined;

  let result: PostPage<PostSummary> | null = null;
  let failure: string | null = null;
  try {
    result = await getStore().listPosts({ live: false, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  } catch (error) {
    failure =
      error instanceof StoreUnavailableError
        ? "The database isn't connected. Set DATABASE_URL in the environment."
        : "Couldn't load the posts just now. Please refresh the page.";
    if (!(error instanceof StoreUnavailableError)) console.error("[admin] could not list posts", error);
  }

  const href = (n: number) => (n > 1 ? `/admin/blog?page=${n}` : "/admin/blog");
  const pages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;
  if (result && result.total > 0 && page > pages) redirect(href(pages));

  return (
    <main className={styles.page}>
      <AdminHeader title="Blog" section="blog" />

      <div className={blog.listBar}>
        <p className={blog.count}>
          {result ? `${result.total} ${result.total === 1 ? "post" : "posts"} · newest first` : " "}
        </p>
        <Link href="/admin/blog/new" className={blog.newPost}>
          <span aria-hidden="true">+</span> New post
        </Link>
      </div>

      {deleted && (
        <p className={styles.success} role="status">
          The post was deleted.
        </p>
      )}

      {failure ? (
        <p className={styles.notice} role="alert">
          {failure}
        </p>
      ) : result && result.total === 0 ? (
        <div className={styles.empty}>
          <p className="serif">No posts yet.</p>
          <span>Write the first article — it appears on the website as soon as you publish it.</span>
        </div>
      ) : (
        result && (
          <>
            <ol className={blog.list}>
              {result.items.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </ol>
            <Pagination page={page} pages={pages} href={href} />
          </>
        )
      )}
    </main>
  );
}

function PostRow({ post }: { post: PostSummary }) {
  const state = postState(post);
  const edit = `/admin/blog/${post.id}`;
  const when =
    state === "draft"
      ? `Last edited ${formatPostDate(post.updatedAt)}`
      : `${state === "scheduled" ? "Goes live" : "Published"} ${formatPostDate(post.publishedAt!)}`;

  return (
    <li className={blog.row}>
      <Link href={edit} className={blog.thumb} tabIndex={-1} aria-hidden="true">
        {post.coverImage ? <Image src={post.coverImage} alt="" fill sizes="132px" className={blog.thumbImage} /> : <span className={blog.noCover} />}
      </Link>
      <div className={blog.rowMain}>
        <div className={styles.cardHead}>
          <span className={styles.badge} data-state={state}>
            {STATE_LABEL[state]}
          </span>
          <span className={styles.time}>{when}</span>
        </div>
        <h2 className={`serif ${blog.rowTitle}`}>
          <Link href={edit}>{post.title}</Link>
        </h2>
        <p className={blog.rowSlug}>/blog/{post.slug}</p>
      </div>
      <div className={blog.rowActions}>
        <Link href={edit} className={styles.ghost}>
          Edit
        </Link>
        {state === "published" && (
          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener" className={styles.ghost}>
            View <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </li>
  );
}
