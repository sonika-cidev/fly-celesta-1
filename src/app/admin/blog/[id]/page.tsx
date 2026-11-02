import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { postFields, postState, type Post } from "@/lib/blog";
import { hasSession } from "@/lib/server/admin-session";
import { getStore, StoreUnavailableError } from "@/lib/server/store";
import { AdminHeader } from "../../AdminHeader";
import { DeletePost } from "../DeletePost";
import { PostEditor } from "../PostEditor";
import styles from "../../admin.module.css";
import blog from "../blog-admin.module.css";

export const metadata: Metadata = { title: "Edit post" };

// Always rendered per request: it depends on the sign-in cookie and live data.
export const dynamic = "force-dynamic";

export default async function EditPostPage(props: PageProps<"/admin/blog/[id]">) {
  if (!(await hasSession())) redirect("/admin/login");

  const [{ id }, params] = await Promise.all([props.params, props.searchParams]);
  if (!/^\d{1,18}$/.test(id)) notFound();

  let post: Post | null = null;
  let failure: string | null = null;
  try {
    post = await getStore().getPost({ id });
  } catch (error) {
    failure =
      error instanceof StoreUnavailableError
        ? "The database isn't connected. Set DATABASE_URL in the environment."
        : "Couldn't load the post just now. Please refresh the page.";
    if (!(error instanceof StoreUnavailableError)) console.error("[admin] could not load post", error);
  }
  if (!failure && !post) notFound();

  return (
    <main className={`${styles.page} ${blog.wide}`}>
      <AdminHeader title="Blog" section="blog" />
      <div className={blog.editorTop}>
        <Link href="/admin/blog" className={blog.back}>
          <span aria-hidden="true">←</span> All posts
        </Link>
        <h2 className={`serif ${blog.editorHeading}`}>Edit post</h2>
      </div>
      {failure ? (
        <p className={styles.notice} role="alert">
          {failure}
        </p>
      ) : (
        post && (
          <>
            <PostEditor
              key={post.id}
              id={post.id}
              initial={postFields(post)}
              initialState={postState(post)}
              created={params.created !== undefined}
            />
            <DeletePost id={post.id} title={post.title} />
          </>
        )
      )}
    </main>
  );
}
