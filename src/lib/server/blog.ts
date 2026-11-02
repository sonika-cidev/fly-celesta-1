import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { isSlug, postState } from "@/lib/blog";
import { getStore } from "./store";

/**
 * The public blog's reads. Each waits for a request first (connection()), so pages that show posts are
 * rendered per visit — never prerendered at build time, when the database may be a local one or none at all.
 */

/** Published posts whose date has come, newest first. */
export async function listLivePosts(limit: number, offset = 0) {
  await connection();
  return getStore().listPosts({ live: true, limit, offset });
}

/** A published post by its address, or null. Cached per request: the page and its metadata share one query. */
export const getLivePost = cache(async (slug: string) => {
  await connection();
  if (!isSlug(slug)) return null;
  const post = await getStore().getPost({ slug });
  return post && postState(post) === "published" ? post : null;
});
