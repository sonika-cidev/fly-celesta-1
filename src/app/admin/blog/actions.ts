"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import {
  IMAGE_MAX_BYTES,
  istDate,
  istMidnight,
  postState,
  tidyPost,
  validatePost,
  type ImageType,
  type Post,
  type PostFields,
  type PostSaveState,
  type PostStatus,
} from "@/lib/blog";
import { hasSession } from "@/lib/server/admin-session";
import { getStore, SlugTakenError, StoreUnavailableError, type NewPost } from "@/lib/server/store";

// Every action checks the session itself: actions can be called directly, not only from the admin pages.

const SIGNED_OUT = "Your admin session has ended. Sign in again in a new tab, then come back here and save — your changes are still on this page.";
const NO_DATABASE = "The database isn't connected. Set DATABASE_URL in the environment.";
const GONE = "This post no longer exists — it may have been deleted in another tab.";

const isPostId = (id: string) => /^\d{1,18}$/.test(id);

function readFields(formData: FormData): PostFields {
  const get = (name: keyof PostFields) => String(formData.get(name) ?? "");
  return {
    title: get("title"),
    slug: get("slug"),
    excerpt: get("excerpt"),
    content: get("content"),
    coverImage: get("coverImage"),
    coverAlt: get("coverAlt"),
    status: get("status") as PostStatus, // checked by validatePost
    publishDate: get("publishDate"),
  };
}

/** When the post goes live: the chosen day, or the moment it is first published. */
function publishMoment(publishDate: string, status: PostStatus, existing: Post | null): Date | null {
  if (publishDate) {
    // Same day as before: keep the original time, so posts from that day stay in order
    if (existing?.publishedAt && istDate(existing.publishedAt) === publishDate) return existing.publishedAt;
    return istMidnight(publishDate);
  }
  return existing?.publishedAt ?? (status === "published" ? new Date() : null);
}

/** Old uploads that no post uses any more are removed after each change. */
function pruneImagesLater() {
  after(() => getStore().pruneImages().catch((error) => console.error("[blog] could not remove unused images", error)));
}

export async function savePost(_previous: PostSaveState, formData: FormData): Promise<PostSaveState> {
  if (!(await hasSession())) return { status: "error", message: SIGNED_OUT };

  const id = String(formData.get("id") ?? "");
  if (id && !isPostId(id)) return { status: "error", message: GONE };

  const fields = tidyPost(readFields(formData));
  const errors = validatePost(fields);
  if (Object.keys(errors).length > 0) return { status: "error", message: "Please check the highlighted fields.", errors };

  let saved: Post | null;
  try {
    const store = getStore();
    const existing = id ? await store.getPost({ id }) : null;
    if (id && !existing) return { status: "error", message: GONE };

    const { publishDate, ...post } = fields;
    const input: NewPost = { ...post, publishedAt: publishMoment(publishDate, post.status, existing) };
    saved = existing ? await store.updatePost(existing.id, input) : await store.insertPost(input);
  } catch (error) {
    if (error instanceof SlugTakenError) {
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: { slug: "Another post already uses this address — choose a different one." },
      };
    }
    if (error instanceof StoreUnavailableError) return { status: "error", message: NO_DATABASE };
    console.error("[blog] could not save post", error);
    return { status: "error", message: "Couldn't save the post just now. Please try again." };
  }
  if (!saved) return { status: "error", message: GONE };

  pruneImagesLater();
  // A new post continues on its own edit page (outside the try: redirect works by throwing)
  if (!id) redirect(`/admin/blog/${saved.id}?created=1`);
  return { status: "saved", savedAt: Date.now(), state: postState(saved) };
}

export type DeleteState = { error?: string };

export async function deletePost(_previous: DeleteState, formData: FormData): Promise<DeleteState> {
  if (!(await hasSession())) return { error: SIGNED_OUT };
  const id = String(formData.get("id") ?? "");
  if (!isPostId(id)) return { error: GONE };

  try {
    await getStore().deletePost(id);
  } catch (error) {
    if (error instanceof StoreUnavailableError) return { error: NO_DATABASE };
    console.error("[blog] could not delete post", error);
    return { error: "Couldn't delete the post just now. Please try again." };
  }
  pruneImagesLater();
  redirect("/admin/blog?deleted=1");
}

/** The file's real type, from its first bytes (the browser's claim is not trusted). */
function imageType(data: Buffer): ImageType | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "image/jpeg";
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (data.length >= 12 && data.toString("latin1", 0, 4) === "RIFF" && data.toString("latin1", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export type UploadResult = { url: string } | { error: string };

/** Stores an image for a post (cover or body); the editor has already resized it. */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  if (!(await hasSession())) return { error: SIGNED_OUT };

  const file = formData.get("image");
  if (!(file instanceof Blob) || file.size === 0) return { error: "Choose an image to upload." };
  if (file.size > IMAGE_MAX_BYTES) return { error: `That image is too large — use one under ${IMAGE_MAX_BYTES / 1024 / 1024} MB.` };

  const data = Buffer.from(await file.arrayBuffer());
  const type = imageType(data);
  if (!type) return { error: "Use a JPG, PNG or WebP image." };

  try {
    return { url: await getStore().insertImage(type, data) };
  } catch (error) {
    if (error instanceof StoreUnavailableError) return { error: NO_DATABASE };
    console.error("[blog] could not store image", error);
    return { error: "Couldn't upload the image just now. Please try again." };
  }
}
