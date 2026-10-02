import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { hasSession } from "@/lib/server/admin-session";
import { listInquiries } from "@/lib/server/inquiries";
import { StoreUnavailableError, type Inquiry, type InquiryKind, type InquiryPage } from "@/lib/server/store";
import { logout } from "./actions";
import styles from "./admin.module.css";

// Always rendered per request: it depends on the sign-in cookie and live data.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const TABS: { kind?: InquiryKind; label: string }[] = [
  { label: "All" },
  { kind: "charter", label: "Charter requests" },
  { kind: "enquiry", label: "Enquiries" },
  { kind: "career", label: "Careers" },
];

const KIND_LABEL: Record<InquiryKind, string> = { charter: "Charter request", enquiry: "Enquiry", career: "Career" };

const when = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const day = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
const formatDate = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? day.format(new Date(`${iso}T00:00:00Z`)) : iso);

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function AdminPage(props: PageProps<"/admin">) {
  if (!(await hasSession())) redirect("/admin/login");

  const params = await props.searchParams;
  const kindParam = first(params.kind);
  const kind = TABS.find((t) => t.kind && t.kind === kindParam)?.kind;
  const page = Math.min(Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1), 100_000);

  let result: InquiryPage | null = null;
  let failure: string | null = null;
  try {
    result = await listInquiries({ kind, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  } catch (error) {
    failure =
      error instanceof StoreUnavailableError
        ? "The database isn't connected. Set DATABASE_URL in the environment."
        : "Couldn't load inquiries just now. Please refresh the page.";
    if (!(error instanceof StoreUnavailableError)) console.error("[admin] could not list inquiries", error);
  }

  const href = (next: { kind?: InquiryKind; page?: number }) => {
    const query = new URLSearchParams();
    if (next.kind) query.set("kind", next.kind);
    if (next.page && next.page > 1) query.set("page", String(next.page));
    const qs = query.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  const pages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>
          <Logo width={118} />
          <span className={styles.divider} aria-hidden="true" />
          <h1 className={`serif ${styles.heading}`}>Inquiries</h1>
        </div>
        <form action={logout}>
          <button type="submit" className={styles.ghost}>
            Sign out
          </button>
        </form>
      </header>

      <nav className={styles.tabs} aria-label="Filter inquiries">
        {TABS.map((tab) => (
          <Link key={tab.label} href={href({ kind: tab.kind })} className={styles.tab} aria-current={tab.kind === kind ? "page" : undefined}>
            {tab.label}
          </Link>
        ))}
      </nav>

      {failure ? (
        <p className={styles.notice} role="alert">
          {failure}
        </p>
      ) : result && result.total === 0 ? (
        <div className={styles.empty}>
          <p className="serif">No inquiries yet.</p>
          <span>New messages from the website forms will appear here.</span>
        </div>
      ) : (
        result && (
          <>
            <p className={styles.summary}>
              {result.total} {result.total === 1 ? "inquiry" : "inquiries"} · newest first
              {pages > 1 && ` · page ${page} of ${pages}`}
            </p>
            <ol className={styles.list}>
              {result.items.map((inquiry) => (
                <InquiryCard key={inquiry.id} inquiry={inquiry} />
              ))}
            </ol>
            {pages > 1 && (
              <nav className={styles.pager} aria-label="Pages">
                {page > 1 ? (
                  <Link href={href({ kind, page: page - 1 })} className={styles.ghost}>
                    ← Newer
                  </Link>
                ) : (
                  <span />
                )}
                {page < pages && (
                  <Link href={href({ kind, page: page + 1 })} className={styles.ghost}>
                    Older →
                  </Link>
                )}
              </nav>
            )}
          </>
        )
      )}
    </main>
  );
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const d = inquiry.details;
  const charterRows =
    inquiry.kind === "charter"
      ? [
          ["Route", d.from && d.to ? `${d.from} → ${d.to}` : undefined],
          ["Trip", d.tripType],
          ["Departure", formatDate(d.departureDate)],
          ["Return", formatDate(d.returnDate)],
          ["Passengers", d.passengers],
          ["Aircraft", d.aircraftType],
        ].filter((row): row is [string, string] => Boolean(row[1]))
      : [];

  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <time dateTime={inquiry.createdAt.toISOString()} className={styles.time}>
          {when.format(inquiry.createdAt)} IST
        </time>
        <span className={styles.badge} data-kind={inquiry.kind}>
          {KIND_LABEL[inquiry.kind]}
        </span>
        <span className={styles.topic}>{inquiry.topic}</span>
      </div>

      <h2 className={`serif ${styles.name}`}>{inquiry.name}</h2>
      <p className={styles.contact}>
        <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
        {inquiry.phone && <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`}>{inquiry.phone}</a>}
      </p>

      {charterRows.length > 0 && (
        <dl className={styles.details}>
          {charterRows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {inquiry.message && <p className={styles.message}>{inquiry.message}</p>}

      <p className={styles.meta}>
        {inquiry.page && <>Sent from {inquiry.page} · </>}#{inquiry.id}
      </p>
    </li>
  );
}
