import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EMPTY_POST } from "@/lib/blog";
import { hasSession } from "@/lib/server/admin-session";
import { AdminHeader } from "../../AdminHeader";
import { PostEditor } from "../PostEditor";
import styles from "../../admin.module.css";
import blog from "../blog-admin.module.css";

export const metadata: Metadata = { title: "New post" };

// Rendered per request: it depends on the sign-in cookie.
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  if (!(await hasSession())) redirect("/admin/login");

  return (
    <main className={`${styles.page} ${blog.wide}`}>
      <AdminHeader title="Blog" section="blog" />
      <div className={blog.editorTop}>
        <Link href="/admin/blog" className={blog.back}>
          <span aria-hidden="true">←</span> All posts
        </Link>
        <h2 className={`serif ${blog.editorHeading}`}>New post</h2>
      </div>
      <PostEditor initial={EMPTY_POST} />
    </main>
  );
}
