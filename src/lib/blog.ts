import { tidy } from "./forms";

// Blog posts: types, limits and checks shared by the admin editor (browser) and its server actions.

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

/** The editor's fields, as sent by the form. */
export type PostFields = {
  title: string;
  slug: string;
  /** Optional; cards and search results fall back to the opening of the article. */
  excerpt: string;
  content: string;
  /** An uploaded image's address (/media/…), or empty. */
  coverImage: string;
  coverAlt: string;
  status: PostStatus;
  /** yyyy-mm-dd in India time; empty means "when it is first published". A future date schedules the post. */
  publishDate: string;
};

export const POST_FIELD_NAMES = [
  "title",
  "slug",
  "excerpt",
  "content",
  "coverImage",
  "coverAlt",
  "status",
  "publishDate",
] as const satisfies readonly (keyof PostFields)[];

export type PostErrors = Partial<Record<keyof PostFields, string>>;

export type Post = Omit<PostFields, "publishDate"> & {
  id: string;
  /** When the post goes (or went) live; null for a draft that was never given a date. */
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/** A post without its body, for lists. `summary` is the excerpt, or the opening of the article when there is none. */
export type PostSummary = Omit<Post, "content" | "excerpt"> & { summary: string; readingMinutes: number };

export type PostPage<T> = { items: T[]; total: number };

export type PostSaveState =
  | { status: "idle" }
  | { status: "saved"; savedAt: number; state: ReturnType<typeof postState> }
  | { status: "error"; message: string; errors?: PostErrors };

/** Longest accepted values — used by the inputs' maxLength and by the checks below. */
export const POST_LIMITS = { title: 150, slug: 100, excerpt: 300, coverAlt: 160, content: 60_000 } as const;

/** Uploaded images: the editor shrinks photos to this many pixels on the long edge before upload. */
export const IMAGE_MAX_EDGE = 2000;
/** Largest upload the server accepts, after the editor has shrunk it. */
export const IMAGE_MAX_BYTES = 3 * 1024 * 1024;

export const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;
export type ImageType = keyof typeof IMAGE_TYPES;

/** Address of an uploaded image: /media/<12-character id>.<jpg|png|webp>. */
export const MEDIA_PATH = /^\/media\/([A-Za-z0-9_-]{12})\.(jpg|png|webp)$/;
/** The same, anywhere in a text (cover field or article body). */
export const MEDIA_PATHS = /\/media\/([A-Za-z0-9_-]{12})\.(?:jpg|png|webp)/g;

export const mediaPath = (id: string, type: ImageType) => `/media/${id}.${IMAGE_TYPES[type]}`;

/** Put in place of an image's description when the editor inserts it; the post can't be saved until it is replaced. */
export const IMAGE_ALT_PLACEHOLDER = "Describe the image";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isPostStatus = (value: string): value is PostStatus => (POST_STATUSES as readonly string[]).includes(value);

export const isSlug = (value: string) => value.length <= POST_LIMITS.slug && SLUG_PATTERN.test(value);

/** "Private Jets & Monsoon Travel!" → "private-jets-and-monsoon-travel" */
export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, POST_LIMITS.slug)
    .replace(/^-+|-+$/g, "");
}

export function tidyPost(f: PostFields): PostFields {
  return {
    title: tidy(f.title),
    slug: f.slug.trim().toLowerCase(),
    excerpt: tidy(f.excerpt),
    content: f.content.replace(/\r\n?/g, "\n").trim(),
    coverImage: f.coverImage.trim(),
    coverAlt: tidy(f.coverAlt),
    status: f.status,
    publishDate: f.publishDate.trim(),
  };
}

export function validatePost(f: PostFields): PostErrors {
  const errors: PostErrors = {};

  if (!f.title) errors.title = "Enter a title.";
  else if (f.title.length > POST_LIMITS.title) errors.title = `Use ${POST_LIMITS.title} characters or fewer.`;

  if (!f.slug) errors.slug = "Enter the web address for this post.";
  else if (f.slug.length > POST_LIMITS.slug) errors.slug = `Use ${POST_LIMITS.slug} characters or fewer.`;
  else if (!isSlug(f.slug)) errors.slug = "Use lower-case letters, numbers and single hyphens only, e.g. monsoon-flying-tips.";

  if (f.excerpt.length > POST_LIMITS.excerpt) errors.excerpt = `Use ${POST_LIMITS.excerpt} characters or fewer.`;

  if (!f.content) errors.content = "Write the article.";
  else if (f.content.length > POST_LIMITS.content) errors.content = `The article is too long — keep it under ${POST_LIMITS.content.toLocaleString("en-IN")} characters.`;
  else if (f.content.includes(`![${IMAGE_ALT_PLACEHOLDER}](`)) errors.content = `Replace “${IMAGE_ALT_PLACEHOLDER}” with a few words about each image in the article.`;

  if (f.coverImage && !MEDIA_PATH.test(f.coverImage)) errors.coverImage = "Upload the cover image again.";
  if (f.coverAlt.length > POST_LIMITS.coverAlt) errors.coverAlt = `Use ${POST_LIMITS.coverAlt} characters or fewer.`;

  if (!isPostStatus(f.status)) errors.status = "Choose draft or published.";

  if (f.publishDate && !isCalendarDate(f.publishDate)) errors.publishDate = "Enter a valid date.";
  return errors;
}

/** Start of a calendar day in India time. */
export const istMidnight = (date: string) => new Date(`${date}T00:00:00+05:30`);

const isoDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
/** The India-time calendar day of a moment, as yyyy-mm-dd (for the date input). */
export const istDate = (date: Date) => isoDay.format(date);

// Round trip, so impossible days such as 2026-02-31 are rejected rather than rolled over
const isCalendarDate = (date: string) => {
  if (!DATE_PATTERN.test(date)) return false;
  const moment = istMidnight(date);
  return !Number.isNaN(moment.getTime()) && istDate(moment) === date;
};

const longDay = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" });
/** "12 October 2026" */
export const formatPostDate = (date: Date) => longDay.format(date);

export const EMPTY_POST: PostFields = { title: "", slug: "", excerpt: "", content: "", coverImage: "", coverAlt: "", status: "draft", publishDate: "" };

/** A saved post as the editor's fields. */
export const postFields = (post: Post): PostFields => ({
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  content: post.content,
  coverImage: post.coverImage,
  coverAlt: post.coverAlt,
  status: post.status,
  publishDate: post.publishedAt ? istDate(post.publishedAt) : "",
});

/** Shown on cards and in the admin list. */
export function postState(post: Pick<Post, "status" | "publishedAt">, now = new Date()): "draft" | "scheduled" | "published" {
  if (post.status === "draft") return "draft";
  return post.publishedAt && post.publishedAt > now ? "scheduled" : "published";
}
