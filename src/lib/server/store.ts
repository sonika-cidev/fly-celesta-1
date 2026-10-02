import "server-only";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createPool, type Pool, type QueryResult, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

/**
 * Persistence for website inquiries, plus two small helpers the forms rely on:
 * single-use CAPTCHA tokens and the signing secret.
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

export class StoreUnavailableError extends Error {
  constructor() {
    super("No database is configured. Set DATABASE_URL to a MySQL connection string (mysql://user:password@host:3306/database).");
    this.name = "StoreUnavailableError";
  }
}

interface Store {
  insertInquiry(input: NewInquiry): Promise<Inquiry>;
  listInquiries(options: { kind?: InquiryKind; limit: number; offset: number }): Promise<InquiryPage>;
  /** Records a single-use token; resolves false if it was already used. */
  consumeToken(id: string): Promise<boolean>;
  /** A random secret generated once and kept in the store (signs CAPTCHA tokens and admin sessions). */
  getSecret(): Promise<Buffer>;
}

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

async function run<T extends QueryResult>(state: DbState, sql: string, values: unknown[] = []): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const [result] = await state.pool.query<T>(sql, values);
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

function mysqlStore(url: string): Store {
  const state = dbState(url);
  const query = async <T extends QueryResult>(sql: string, values: unknown[] = []) => {
    await ensureSchema(state);
    return run<T>(state, sql, values);
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
  };
}

/* ------------------------------------------------------------- Development file */

type FileData = {
  nextId: number;
  secret?: string;
  usedTokens: Record<string, number>;
  inquiries: (Omit<Inquiry, "createdAt"> & { createdAt: string })[];
};

const DATA_FILE = path.join(process.cwd(), ".data", "dev-store.json");
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
  };
}
