import "server-only";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createPool, type Pool, type QueryResult, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { MEDIA_PATHS, mediaPath, type ImageType, type Post, type PostPage, type PostSummary } from "@/lib/blog";
import { excerptFrom, readingMinutes } from "@/lib/blog-markup";

/**
 * Persistence for website inquiries and blog posts (with their uploaded images), plus two small
 * helpers the forms rely on: single-use CAPTCHA tokens and the signing secret.
 *
 * Production: MySQL (or MariaDB) via DATABASE_URL, e.g. mysql://user:password@host:3306/database.
 * The tables are created on first use.
 * Development without a database: a JSON file in .data/ so the site works out of the box.
 */

export type InquiryKind = "charter" | "enquiry" | "career";

export type NewInquiry = {
  kind: InquiryKind;
  topic: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Form-specific fields, e.g. route and dates for a charter request. */
  details: Record<string, string>;
  /** The page the form was sent from. */
  page: string;
};

export type Inquiry = NewInquiry & { id: string; createdAt: Date };

export type InquiryPage = { items: Inquiry[]; total: number };

export type NewPost = Omit<Post, "id" | "createdAt" | "updatedAt">;

export type StoredImage = { type: ImageType; data: Buffer };

export class StoreUnavailableError extends Error {
  constructor() {
    super("No database is configured. Set DATABASE_URL to a MySQL connection string (mysql://user:password@host:3306/database).");
    this.name = "StoreUnavailableError";
  }
}

/** Another post already uses this web address. */
export class SlugTakenError extends Error {
  constructor() {
    super("Slug already in use");
    this.name = "SlugTakenError";
  }
}

interface Store {
  insertInquiry(input: NewInquiry): Promise<Inquiry>;
  listInquiries(options: { kind?: InquiryKind; limit: number; offset: number }): Promise<InquiryPage>;
  /** Records a single-use token; resolves false if it was already used. */
  consumeToken(id: string): Promise<boolean>;
  /** A random secret generated once and kept in the store (signs CAPTCHA tokens and admin sessions). */
  getSecret(): Promise<Buffer>;

  /** Blog posts, newest first. `live`: only published posts whose publish date has come (the public blog). */
  listPosts(options: { live: boolean; limit: number; offset: number }): Promise<PostPage<PostSummary>>;
  getPost(by: { id: string } | { slug: string }): Promise<Post | null>;
  /** Rejects with SlugTakenError when another post has the slug. */
  insertPost(input: NewPost): Promise<Post>;
  /** Resolves null if the post no longer exists; rejects with SlugTakenError when another post has the slug. */
  updatePost(id: string, input: NewPost): Promise<Post | null>;
  deletePost(id: string): Promise<boolean>;
  /** Stores an uploaded image; resolves to its address (/media/…). */
  insertImage(type: ImageType, data: Buffer): Promise<string>;
  getImage(id: string): Promise<StoredImage | null>;
  /** Deletes uploaded images that no post uses. Each is kept for a day first, so an unsaved draft's uploads survive. */
  pruneImages(): Promise<void>;
}

/** Ids of the uploaded images a post uses, in its cover and its body. */
const imagesUsedBy = (posts: { coverImage: string; content: string }[]) =>
  new Set(posts.flatMap((p) => [...`${p.coverImage}\n${p.content}`.matchAll(MEDIA_PATHS)].map((m) => m[1])));

const IMAGE_GRACE_MS = 86_400_000;

const newImageId = () => randomBytes(9).toString("base64url");

const toSummary = ({ content, excerpt, ...post }: Post): PostSummary => ({
  ...post,
  summary: excerpt || excerptFrom(content),
  readingMinutes: readingMinutes(content),
});

/** Newest first: by publish date, or by creation for drafts without one. */
const newestFirst = (a: Post, b: Post) =>
  (b.publishedAt ?? b.createdAt).getTime() - (a.publishedAt ?? a.createdAt).getTime() || Number(b.id) - Number(a.id);

const isLive = (post: Post, now: Date) => post.status === "published" && post.publishedAt !== null && post.publishedAt <= now;

const connectionString = () => process.env.DATABASE_URL ?? "";

export function getStore(): Store {
  const url = connectionString();
  if (url) {
    if (/^(mysql|mariadb):\/\//i.test(url)) return mysqlStore(url);
    // e.g. a PostgreSQL URL left over from an earlier setup: refuse clearly rather than fail on every request
    console.error("[store] DATABASE_URL must be a MySQL connection string starting with mysql://");
    throw new StoreUnavailableError();
  }
  if (process.env.NODE_ENV !== "production") return fileStore();
  throw new StoreUnavailableError();
}

/* ----------------------------------------------------------------------- MySQL */

// Prefixed so the tables can share a database with other applications (a WordPress install, say).
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS fc_inquiries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(3) NOT NULL,
    kind VARCHAR(16) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(64) NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    details TEXT NOT NULL,
    page VARCHAR(255) NOT NULL DEFAULT '',
    KEY fc_inquiries_created (created_at),
    KEY fc_inquiries_kind_created (kind, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS fc_used_tokens (
    id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
    used_at DATETIME(3) NOT NULL,
    KEY fc_used_tokens_used (used_at)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS fc_settings (
    name VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
    value TEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS fc_posts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
    title VARCHAR(150) NOT NULL,
    excerpt VARCHAR(300) NOT NULL DEFAULT '',
    content MEDIUMTEXT NOT NULL,
    cover_image VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT '',
    cover_alt VARCHAR(160) NOT NULL DEFAULT '',
    status VARCHAR(16) NOT NULL,
    published_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    UNIQUE KEY fc_posts_slug (slug),
    KEY fc_posts_status_published (status, published_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  // Uploaded blog images live in the database, so they survive redeploys and need no writable folder on the host.
  `CREATE TABLE IF NOT EXISTS fc_images (
    id CHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
    created_at DATETIME(3) NOT NULL,
    type VARCHAR(16) CHARACTER SET ascii NOT NULL,
    data MEDIUMBLOB NOT NULL,
    KEY fc_images_created (created_at)
  ) ENGINE=InnoDB`,
];

type DbState = { url: string; pool: Pool; ready?: Promise<void>; secret?: Promise<Buffer> };
const globalForDb = globalThis as typeof globalThis & { __flyCelestaDb?: DbState };

function dbState(url: string): DbState {
  if (globalForDb.__flyCelestaDb?.url !== url) {
    globalForDb.__flyCelestaDb?.pool.end().catch(() => {});
    const pool = createPool({
      uri: url,
      connectionLimit: 3,
      // Keep one connection warm; close the rest once idle, so a shared host's connection limit isn't tied up
      maxIdle: 1,
      idleTimeout: 30_000,
      connectTimeout: 10_000,
      enableKeepAlive: true,
      // Dates are written and read as UTC, whatever the database server's own time zone
      timezone: "Z",
    });
    globalForDb.__flyCelestaDb = { url, pool };
  }
  return globalForDb.__flyCelestaDb;
}

// The server or network dropped the connection; one retry on a fresh connection is worthwhile.
const DROPPED = new Set(["PROTOCOL_CONNECTION_LOST", "ECONNRESET", "EPIPE"]);
const isDropped = (error: unknown) =>
  DROPPED.has((error as { code?: string })?.code ?? "") || /closed state/i.test((error as Error)?.message ?? "");

/** `execute` sends a prepared statement: binary values (images) travel as-is rather than escaped into the SQL text. */
async function run<T extends QueryResult>(state: DbState, sql: string, values: unknown[] = [], method: "query" | "execute" = "query"): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const [result] =
        method === "execute"
          ? await state.pool.execute<T>(sql, values as Parameters<Pool["execute"]>[1])
          : await state.pool.query<T>(sql, values);
      return result;
    } catch (error) {
      // A serverless instance may resume with a stale socket
      if (attempt === 0 && isDropped(error)) continue;
      throw error;
    }
  }
}

function ensureSchema(state: DbState): Promise<void> {
  state.ready ??= (async () => {
    for (const statement of SCHEMA) await run(state, statement);
  })().catch((error) => {
    state.ready = undefined; // try again on the next request
    throw error;
  });
  return state.ready;
}

interface InquiryRow extends RowDataPacket {
  id: number | string;
  created_at: Date;
  kind: InquiryKind;
  topic: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  details: string;
  page: string;
}

function parseDetails(value: string): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

const toInquiry = (row: InquiryRow): Inquiry => ({
  id: String(row.id),
  createdAt: new Date(row.created_at),
  kind: row.kind,
  topic: row.topic,
  name: row.name,
  email: row.email,
  phone: row.phone,
  message: row.message,
  details: parseDetails(row.details),
  page: row.page,
});

interface PostRow extends RowDataPacket {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  cover_alt: string;
  status: string;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const POST_COLUMNS = "id, slug, title, excerpt, content, cover_image, cover_alt, status, published_at, created_at, updated_at";

const toPost = (row: PostRow): Post => ({
  id: String(row.id),
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  coverImage: row.cover_image,
  coverAlt: row.cover_alt,
  status: row.status === "published" ? "published" : "draft",
  publishedAt: row.published_at ? new Date(row.published_at) : null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const postValues = (p: NewPost) => [p.slug, p.title, p.excerpt, p.content, p.coverImage, p.coverAlt, p.status, p.publishedAt];

const isDuplicate = (error: unknown) => (error as { code?: string })?.code === "ER_DUP_ENTRY";

function mysqlStore(url: string): Store {
  const state = dbState(url);
  const query = async <T extends QueryResult>(sql: string, values: unknown[] = []) => {
    await ensureSchema(state);
    return run<T>(state, sql, values);
  };

  const getPost: Store["getPost"] = async (by) => {
    const [column, value] = "id" in by ? ["id", by.id] : ["slug", by.slug];
    const rows = await query<PostRow[]>(`SELECT ${POST_COLUMNS} FROM fc_posts WHERE ${column} = ? LIMIT 1`, [value]);
    return rows[0] ? toPost(rows[0]) : null;
  };

  return {
    async insertInquiry(input) {
      const createdAt = new Date();
      const result = await query<ResultSetHeader>(
        `INSERT INTO fc_inquiries (created_at, kind, topic, name, email, phone, message, details, page)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [createdAt, input.kind, input.topic, input.name, input.email, input.phone, input.message, JSON.stringify(input.details), input.page],
      );
      return { ...input, id: String(result.insertId), createdAt };
    },

    async listInquiries({ kind, limit, offset }) {
      const where = kind ? "WHERE kind = ?" : "";
      const filter = kind ? [kind] : [];
      const [rows, count] = await Promise.all([
        query<InquiryRow[]>(
          `SELECT id, created_at, kind, topic, name, email, phone, message, details, page
           FROM fc_inquiries ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
          [...filter, limit, offset],
        ),
        query<(RowDataPacket & { total: number | string })[]>(`SELECT COUNT(*) AS total FROM fc_inquiries ${where}`, filter),
      ]);
      return { items: rows.map(toInquiry), total: Number(count[0]?.total ?? 0) };
    },

    async consumeToken(id) {
      const result = await query<ResultSetHeader>(`INSERT IGNORE INTO fc_used_tokens (id, used_at) VALUES (?, ?)`, [id, new Date()]);
      // Tokens expire within the hour; prune old ones now and then.
      if (Math.random() < 0.05) {
        query(`DELETE FROM fc_used_tokens WHERE used_at < ?`, [new Date(Date.now() - 2 * 86_400_000)]).catch(() => {});
      }
      return result.affectedRows === 1;
    },

    getSecret() {
      state.secret ??= (async () => {
        await query(`INSERT IGNORE INTO fc_settings (name, value) VALUES ('signing_secret', ?)`, [randomBytes(32).toString("hex")]);
        const rows = await query<(RowDataPacket & { value: string })[]>(`SELECT value FROM fc_settings WHERE name = 'signing_secret'`);
        return Buffer.from(rows[0].value, "hex");
      })().catch((error) => {
        state.secret = undefined;
        throw error;
      });
      return state.secret;
    },

    async listPosts({ live, limit, offset }) {
      const where = live ? "WHERE status = 'published' AND published_at <= ?" : "";
      const filter = live ? [new Date()] : [];
      const order = live ? "published_at DESC, id DESC" : "COALESCE(published_at, created_at) DESC, id DESC";
      const [rows, count] = await Promise.all([
        query<PostRow[]>(`SELECT ${POST_COLUMNS} FROM fc_posts ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [...filter, limit, offset]),
        query<(RowDataPacket & { total: number | string })[]>(`SELECT COUNT(*) AS total FROM fc_posts ${where}`, filter),
      ]);
      return { items: rows.map((row) => toSummary(toPost(row))), total: Number(count[0]?.total ?? 0) };
    },

    getPost,

    async insertPost(input) {
      const now = new Date();
      try {
        const result = await query<ResultSetHeader>(
          `INSERT INTO fc_posts (slug, title, excerpt, content, cover_image, cover_alt, status, published_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [...postValues(input), now, now],
        );
        return { ...input, id: String(result.insertId), createdAt: now, updatedAt: now };
      } catch (error) {
        throw isDuplicate(error) ? new SlugTakenError() : error;
      }
    },

    async updatePost(id, input) {
      try {
        const result = await query<ResultSetHeader>(
          `UPDATE fc_posts SET slug = ?, title = ?, excerpt = ?, content = ?, cover_image = ?, cover_alt = ?, status = ?, published_at = ?, updated_at = ?
           WHERE id = ?`,
          [...postValues(input), new Date(), id],
        );
        return result.affectedRows ? getPost({ id }) : null;
      } catch (error) {
        throw isDuplicate(error) ? new SlugTakenError() : error;
      }
    },

    async deletePost(id) {
      const result = await query<ResultSetHeader>(`DELETE FROM fc_posts WHERE id = ?`, [id]);
      return result.affectedRows === 1;
    },

    async insertImage(type, data) {
      await ensureSchema(state);
      const id = newImageId();
      await run(state, `INSERT INTO fc_images (id, created_at, type, data) VALUES (?, ?, ?, ?)`, [id, new Date(), type, data], "execute");
      return mediaPath(id, type);
    },

    async getImage(id) {
      const rows = await query<(RowDataPacket & { type: ImageType; data: Buffer })[]>(`SELECT type, data FROM fc_images WHERE id = ?`, [id]);
      return rows[0] ? { type: rows[0].type, data: rows[0].data } : null;
    },

    async pruneImages() {
      const [images, posts] = await Promise.all([
        query<(RowDataPacket & { id: string })[]>(`SELECT id FROM fc_images WHERE created_at < ?`, [new Date(Date.now() - IMAGE_GRACE_MS)]),
        query<(RowDataPacket & { cover_image: string; content: string })[]>(`SELECT cover_image, content FROM fc_posts`),
      ]);
      const used = imagesUsedBy(posts.map((p) => ({ coverImage: p.cover_image, content: p.content })));
      const unused = images.map((image) => image.id).filter((id) => !used.has(id));
      if (unused.length) await query(`DELETE FROM fc_images WHERE id IN (?)`, [unused]);
    },
  };
}

/* ------------------------------------------------------------- Development file */

type FilePost = Omit<Post, "publishedAt" | "createdAt" | "updatedAt"> & { publishedAt: string | null; createdAt: string; updatedAt: string };

type FileData = {
  nextId: number;
  secret?: string;
  usedTokens: Record<string, number>;
  inquiries: (Omit<Inquiry, "createdAt"> & { createdAt: string })[];
  // Added with the blog; absent from stores created before it
  nextPostId?: number;
  posts?: FilePost[];
  /** Image details; the bytes are files in .data/images/. */
  images?: Record<string, { type: ImageType; createdAt: string }>;
};

const DATA_FILE = path.join(process.cwd(), ".data", "dev-store.json");
const IMAGE_DIR = path.join(process.cwd(), ".data", "images");

const fromFilePost = (p: FilePost): Post => ({
  ...p,
  publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
  createdAt: new Date(p.createdAt),
  updatedAt: new Date(p.updatedAt),
});

const toFilePost = (p: Post): FilePost => ({
  ...p,
  publishedAt: p.publishedAt?.toISOString() ?? null,
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
});
const globalForFile = globalThis as typeof globalThis & { __flyCelestaFileQueue?: Promise<unknown> };

/** Serialises read-modify-write cycles on the JSON file within this process. */
function withFile<T>(run: (data: FileData) => T | Promise<T>, write = false): Promise<T> {
  const task = (globalForFile.__flyCelestaFileQueue ?? Promise.resolve()).then(async () => {
    let data: FileData = { nextId: 1, usedTokens: {}, inquiries: [] };
    try {
      data = JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as FileData;
    } catch {
      // first run: start with an empty store
    }
    const result = await run(data);
    if (write) {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      const temp = `${DATA_FILE}.${process.pid}.tmp`;
      await fs.writeFile(temp, JSON.stringify(data, null, 2));
      await fs.rename(temp, DATA_FILE);
    }
    return result;
  });
  globalForFile.__flyCelestaFileQueue = task.catch(() => {});
  return task;
}

function fileStore(): Store {
  return {
    insertInquiry: (input) =>
      withFile((data) => {
        const record = { ...input, id: String(data.nextId++), createdAt: new Date().toISOString() };
        data.inquiries.push(record);
        return { ...record, createdAt: new Date(record.createdAt) };
      }, true),

    listInquiries: ({ kind, limit, offset }) =>
      withFile((data) => {
        const all = data.inquiries.filter((i) => !kind || i.kind === kind).reverse();
        return {
          items: all.slice(offset, offset + limit).map((i) => ({ ...i, createdAt: new Date(i.createdAt) })),
          total: all.length,
        };
      }),

    consumeToken: (id) =>
      withFile((data) => {
        if (data.usedTokens[id]) return false;
        const cutoff = Date.now() - 2 * 86_400_000;
        for (const [key, usedAt] of Object.entries(data.usedTokens)) if (usedAt < cutoff) delete data.usedTokens[key];
        data.usedTokens[id] = Date.now();
        return true;
      }, true),

    getSecret: () =>
      withFile((data) => {
        data.secret ??= randomBytes(32).toString("hex");
        return Buffer.from(data.secret, "hex");
      }, true),

    listPosts: ({ live, limit, offset }) =>
      withFile((data) => {
        const now = new Date();
        const all = (data.posts ?? []).map(fromFilePost).filter((p) => !live || isLive(p, now));
        all.sort(newestFirst);
        return { items: all.slice(offset, offset + limit).map(toSummary), total: all.length };
      }),

    getPost: (by) =>
      withFile((data) => {
        const found = (data.posts ?? []).find((p) => ("id" in by ? p.id === by.id : p.slug === by.slug));
        return found ? fromFilePost(found) : null;
      }),

    insertPost: (input) =>
      withFile((data) => {
        data.posts ??= [];
        if (data.posts.some((p) => p.slug === input.slug)) throw new SlugTakenError();
        const id = data.nextPostId ?? 1;
        data.nextPostId = id + 1;
        const now = new Date();
        const post: Post = { ...input, id: String(id), createdAt: now, updatedAt: now };
        data.posts.push(toFilePost(post));
        return post;
      }, true),

    updatePost: (id, input) =>
      withFile((data) => {
        const posts = data.posts ?? [];
        const index = posts.findIndex((p) => p.id === id);
        if (index < 0) return null;
        if (posts.some((p) => p.slug === input.slug && p.id !== id)) throw new SlugTakenError();
        const post: Post = { ...fromFilePost(posts[index]), ...input, updatedAt: new Date() };
        posts[index] = toFilePost(post);
        return post;
      }, true),

    deletePost: (id) =>
      withFile((data) => {
        const before = data.posts?.length ?? 0;
        data.posts = (data.posts ?? []).filter((p) => p.id !== id);
        return data.posts.length < before;
      }, true),

    insertImage: (type, bytes) =>
      withFile(async (data) => {
        const id = newImageId();
        await fs.mkdir(IMAGE_DIR, { recursive: true });
        await fs.writeFile(path.join(IMAGE_DIR, id), bytes);
        (data.images ??= {})[id] = { type, createdAt: new Date().toISOString() };
        return mediaPath(id, type);
      }, true),

    getImage: (id) =>
      withFile(async (data) => {
        const meta = data.images?.[id];
        if (!meta) return null;
        try {
          return { type: meta.type, data: await fs.readFile(path.join(IMAGE_DIR, id)) };
        } catch {
          return null;
        }
      }),

    pruneImages: () =>
      withFile(async (data) => {
        const used = imagesUsedBy(data.posts ?? []);
        const cutoff = Date.now() - IMAGE_GRACE_MS;
        for (const [id, meta] of Object.entries(data.images ?? {})) {
          if (used.has(id) || Date.parse(meta.createdAt) >= cutoff) continue;
          delete data.images![id];
          await fs.rm(path.join(IMAGE_DIR, id), { force: true });
        }
      }, true),
  };
}
