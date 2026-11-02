"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { PostBody } from "@/components/blog/PostBody";
import {
  IMAGE_ALT_PLACEHOLDER,
  POST_FIELD_NAMES,
  POST_LIMITS,
  slugify,
  tidyPost,
  validatePost,
  type PostErrors,
  type PostFields,
  type PostSaveState,
} from "@/lib/blog";
import { savePost, uploadImage } from "./actions";
import { applyEdit, MarkupToolbar, promptLink } from "./MarkupToolbar";
import { imageMarkup, insertBlock, wrap } from "./markup-edits";
import { prepareImage } from "./prepare-image";
import admin from "../admin.module.css";
import styles from "./blog-admin.module.css";

type PostState = "draft" | "scheduled" | "published";
type UploadTarget = "cover" | "body";

type PostEditorProps = {
  /** Present when editing a saved post. */
  id?: string;
  initial: PostFields;
  /** The saved post's state, for the link to it on the website. */
  initialState?: PostState;
  /** The post has just been created. */
  created?: boolean;
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const snapshotOf = (values: PostFields) => JSON.stringify(POST_FIELD_NAMES.map((name) => values[name]));

const without = (errors: PostErrors, ...names: (keyof PostFields)[]) => {
  if (!names.some((name) => errors[name])) return errors;
  const next = { ...errors };
  for (const name of names) delete next[name];
  return next;
};

const savedTime = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

export function PostEditor({ id, initial, initialState = "draft", created = false }: PostEditorProps) {
  const uid = useId();
  const fieldId = (name: keyof PostFields) => `${uid}-${name}`;

  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<PostErrors>({});
  // A new post's address follows its title until it is edited by hand; a saved post's address never changes by itself
  const [slugLocked, setSlugLocked] = useState(Boolean(id));
  const [saved, setSaved] = useState(() => ({ snapshot: snapshotOf(initial), slug: initial.slug, state: initialState }));
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [uploadError, setUploadError] = useState<{ target: UploadTarget; message: string } | null>(null);
  const [dragging, setDragging] = useState(false);

  const submitted = useRef({ snapshot: "", slug: "" });
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLInputElement>(null);
  const bodySelection = useRef<[number, number]>([0, 0]);

  const [state, formAction, pending] = useActionState<PostSaveState, FormData>(async (previous, formData) => {
    const sent = submitted.current;
    const result = await savePost(previous, formData);
    if (result.status === "saved") setSaved({ ...sent, state: result.state });
    else if (result.status === "error") setErrors(result.errors ?? {});
    return result;
  }, { status: "idle" });

  const dirty = snapshotOf(values) !== saved.snapshot;

  // Warn before leaving the page (closing the tab, reloading) with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (name: keyof PostFields, value: string) => {
    const followsTitle = name === "title" && !slugLocked;
    setValues((current) => ({ ...current, [name]: value, ...(followsTitle ? { slug: slugify(value) } : {}) }));
    setErrors((current) => (followsTitle ? without(current, "title", "slug") : without(current, name)));
  };
  const setContent = (value: string) => update("content", value);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (uploading) return event.preventDefault();
    const tidied = tidyPost(values);
    const found = validatePost(tidied);
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      setErrors(found);
      if (found.content) setTab("write");
      const first = POST_FIELD_NAMES.find((name) => found[name]);
      if (first) requestAnimationFrame(() => document.getElementById(fieldId(first))?.focus());
      return;
    }
    submitted.current = { snapshot: snapshotOf(values), slug: tidied.slug };
  };

  // Ctrl/⌘+S saves from any field
  const onFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const onContentKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
    const key = event.key.toLowerCase();
    const textarea = event.currentTarget;
    if (key === "b" || key === "i") {
      event.preventDefault();
      const bold = key === "b";
      applyEdit(textarea, wrap(textarea.value, textarea.selectionStart, textarea.selectionEnd, bold ? "**" : "*", bold ? "bold text" : "italic text"), setContent);
    } else if (key === "k") {
      event.preventDefault();
      promptLink(textarea, setContent);
    }
  };

  /** Resizes and uploads an image; resolves to its address, or null (the error is shown by the target). */
  async function upload(file: File, target: UploadTarget): Promise<string | null> {
    const fail = (message: string) => {
      setUploadError({ target, message });
      return null;
    };
    setUploadError(null);
    setUploading(target);
    try {
      let prepared: File;
      try {
        prepared = await prepareImage(file);
      } catch (error) {
        return fail((error as Error).message);
      }
      const body = new FormData();
      body.set("image", prepared);
      const result = await uploadImage(body);
      return "error" in result ? fail(result.error) : result.url;
    } catch {
      return fail("Couldn't upload the image — check your connection and try again.");
    } finally {
      setUploading(null);
    }
  }

  const chooseCover = async (file: File | undefined) => {
    if (!file) return;
    const url = await upload(file, "cover");
    if (url) update("coverImage", url);
  };

  const pickBodyImage = () => {
    const textarea = contentRef.current;
    if (textarea) bodySelection.current = [textarea.selectionStart, textarea.selectionEnd];
    bodyInputRef.current?.click();
  };

  const insertBodyImage = async (file: File | undefined) => {
    if (!file) return;
    const url = await upload(file, "body");
    const textarea = contentRef.current;
    if (!url || !textarea) return;
    const [start, end] = bodySelection.current.map((n) => Math.min(n, textarea.value.length));
    // The description placeholder is left selected, ready to be typed over
    applyEdit(textarea, insertBlock(textarea.value, start, end, imageMarkup(url), [2, 2 + IMAGE_ALT_PLACEHOLDER.length]), setContent);
  };

  const errorCount = Object.keys(errors).length;
  const message = errorCount > 0 ? "Please check the highlighted fields." : state.status === "error" && !state.errors ? state.message : null;
  const progress = pending
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : state.status === "saved"
        ? `Saved at ${savedTime.format(state.savedAt)}`
        : created
          ? "Post created."
          : "";

  const describe = (name: keyof PostFields, hint = true) => (errors[name] ? `${fieldId(name)}-error` : hint ? `${fieldId(name)}-hint` : undefined);

  return (
    <form action={formAction} onSubmit={onSubmit} onKeyDown={onFormKeyDown} noValidate className={styles.editor}>
      {id && <input type="hidden" name="id" value={id} />}
      <input type="hidden" name="coverImage" value={values.coverImage} />

      <div className={styles.main}>
        <Field id={fieldId("title")} label="Title" error={errors.title}>
          <input
            id={fieldId("title")}
            name="title"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={POST_LIMITS.title}
            placeholder="A title that says what the article is about"
            autoComplete="off"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={describe("title", false)}
            className={`${admin.input} ${styles.titleInput}`}
          />
        </Field>

        <Field
          id={fieldId("slug")}
          label="Web address"
          error={errors.slug}
          hint={id ? "Changing the address of a published post breaks links people have already shared." : "Filled in from the title — edit it if you like."}
        >
          <div className={styles.slugField} data-invalid={errors.slug ? "" : undefined}>
            <span aria-hidden="true">flycelesta.in/blog/</span>
            <input
              id={fieldId("slug")}
              name="slug"
              value={values.slug}
              onChange={(e) => {
                setSlugLocked(true);
                update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              maxLength={POST_LIMITS.slug}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={errors.slug ? true : undefined}
              aria-describedby={describe("slug")}
            />
          </div>
        </Field>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor={fieldId("content")} className={admin.fieldLabel}>
              Article
            </label>
            <div className={styles.tabs}>
              <button type="button" aria-pressed={tab === "write"} onClick={() => setTab("write")}>
                Write
              </button>
              <button type="button" aria-pressed={tab === "preview"} onClick={() => setTab("preview")}>
                Preview
              </button>
            </div>
          </div>
          <div className={styles.writer} data-invalid={errors.content ? "" : undefined}>
            {tab === "write" && <MarkupToolbar textareaRef={contentRef} setValue={setContent} onImage={pickBodyImage} imageBusy={uploading === "body"} />}
            {/* Hidden rather than removed while previewing, so it is still sent with the form */}
            <textarea
              id={fieldId("content")}
              ref={contentRef}
              name="content"
              hidden={tab !== "write"}
              value={values.content}
              onChange={(e) => update("content", e.target.value)}
              onKeyDown={onContentKeyDown}
              rows={22}
              maxLength={POST_LIMITS.content}
              placeholder={"Start writing…\n\nEach line becomes a paragraph. Use the toolbar for headings, lists, links and images."}
              aria-invalid={errors.content ? true : undefined}
              aria-describedby={describe("content", false)}
              className={styles.textarea}
            />
            {tab === "preview" && (
              <div className={styles.preview}>
                {values.content.trim() ? <PostBody content={values.content} /> : <p className={styles.previewEmpty}>Nothing to preview yet.</p>}
              </div>
            )}
          </div>
          <input
            ref={bodyInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            hidden
            onChange={(e) => {
              insertBodyImage(e.target.files?.[0]);
              e.target.value = ""; // so choosing the same file again still counts as a change
            }}
          />
          {uploadError?.target === "body" && (
            <p className={admin.error} role="alert">
              {uploadError.message}
            </p>
          )}
          {errors.content && (
            <p id={`${fieldId("content")}-error`} className={admin.error} role="alert">
              {errors.content}
            </p>
          )}
          <FormattingHelp />
        </div>

        <Field
          id={fieldId("excerpt")}
          label="Excerpt (optional)"
          error={errors.excerpt}
          hint="Shown on the blog page and in search results. Leave empty to use the opening of the article."
          aside={
            <span className={styles.counter}>
              {values.excerpt.length}/{POST_LIMITS.excerpt}
            </span>
          }
        >
          <textarea
            id={fieldId("excerpt")}
            name="excerpt"
            value={values.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            rows={3}
            maxLength={POST_LIMITS.excerpt}
            aria-invalid={errors.excerpt ? true : undefined}
            aria-describedby={describe("excerpt")}
            className={`${admin.input} ${styles.excerpt}`}
          />
        </Field>
      </div>

      <aside className={styles.side}>
        <section className={styles.panel} aria-labelledby={`${uid}-publish`}>
          <h2 id={`${uid}-publish`} className={styles.panelTitle}>
            Publish
          </h2>
          <fieldset className={styles.options}>
            <legend className={admin.fieldLabel}>Status</legend>
            {(
              [
                ["draft", "Draft", "Only visible here in the admin panel"],
                ["published", "Published", "Live on the website"],
              ] as const
            ).map(([value, label, note], i) => (
              <label key={value} className={styles.option}>
                <input
                  type="radio"
                  name="status"
                  value={value}
                  id={i === 0 ? fieldId("status") : undefined}
                  checked={values.status === value}
                  onChange={() => update("status", value)}
                />
                <span>
                  <strong>{label}</strong>
                  <small>{note}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <Field
            id={fieldId("publishDate")}
            label="Publish date (optional)"
            error={errors.publishDate}
            hint="Leave empty to use the day you publish. A future date schedules the post: it appears on the website that day."
          >
            <input
              id={fieldId("publishDate")}
              name="publishDate"
              type="date"
              value={values.publishDate}
              onChange={(e) => update("publishDate", e.target.value)}
              aria-invalid={errors.publishDate ? true : undefined}
              aria-describedby={describe("publishDate")}
              className={admin.input}
            />
          </Field>

          <button type="submit" className={`${admin.primary} ${styles.save}`} disabled={pending || uploading !== null}>
            {pending ? "Saving…" : id ? "Save changes" : values.status === "published" ? "Publish" : "Save draft"}
          </button>
          {message && (
            <p className={admin.error} role="alert">
              {message}
            </p>
          )}
          <p className={styles.progress} aria-live="polite">
            {progress}
          </p>
          {saved.state === "published" && id && (
            <a href={`/blog/${saved.slug}`} target="_blank" rel="noopener" className={styles.viewLink}>
              View on website <span aria-hidden="true">↗</span>
            </a>
          )}
          {saved.state === "scheduled" && <p className={styles.hint}>Scheduled — it goes live on its publish date.</p>}
        </section>

        <section className={styles.panel} aria-labelledby={`${uid}-cover`}>
          <h2 id={`${uid}-cover`} className={styles.panelTitle}>
            Cover image
          </h2>
          {values.coverImage ? (
            <>
              <div className={styles.coverFrame}>
                <Image src={values.coverImage} alt="" fill sizes="(max-width: 960px) 92vw, 340px" className={styles.coverImage} />
              </div>
              <div className={styles.coverActions}>
                <button type="button" className={admin.ghost} onClick={() => coverInputRef.current?.click()} disabled={uploading !== null}>
                  {uploading === "cover" ? "Uploading…" : "Replace"}
                </button>
                <button type="button" className={admin.ghost} onClick={() => update("coverImage", "")} disabled={uploading !== null}>
                  Remove
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              id={fieldId("coverImage")}
              className={styles.drop}
              data-dragging={dragging ? "" : undefined}
              disabled={uploading !== null}
              onClick={() => coverInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                chooseCover(e.dataTransfer.files[0]);
              }}
            >
              {uploading === "cover" ? (
                <strong>Uploading…</strong>
              ) : (
                <>
                  <strong>Upload a cover image</strong>
                  <small>Drop a photo here or click to choose. JPG, PNG or WebP; landscape photos work best.</small>
                </>
              )}
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            hidden
            onChange={(e) => {
              chooseCover(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {uploadError?.target === "cover" && (
            <p className={admin.error} role="alert">
              {uploadError.message}
            </p>
          )}
          {errors.coverImage && (
            <p className={admin.error} role="alert">
              {errors.coverImage}
            </p>
          )}

          <Field
            id={fieldId("coverAlt")}
            label="Image description"
            error={errors.coverAlt}
            hint="What the photo shows, for visitors using screen readers — e.g. “Helicopter over the Western Ghats”."
          >
            <input
              id={fieldId("coverAlt")}
              name="coverAlt"
              value={values.coverAlt}
              onChange={(e) => update("coverAlt", e.target.value)}
              maxLength={POST_LIMITS.coverAlt}
              aria-invalid={errors.coverAlt ? true : undefined}
              aria-describedby={describe("coverAlt")}
              className={admin.input}
            />
          </Field>
        </section>
      </aside>
    </form>
  );
}

type FieldProps = { id: string; label: string; hint?: ReactNode; error?: string; aside?: ReactNode; children: ReactNode };

function Field({ id, label, hint, error, aside, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={admin.fieldLabel}>
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className={admin.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const SYNTAX: [string, string][] = [
  ["## Heading", "Section heading"],
  ["### Subheading", "Smaller heading"],
  ["**bold**  *italic*", "Emphasis"],
  ["[text](https://…)", "Link (or /contact for a page on this site)"],
  ["- item", "Bulleted list"],
  ["1. item", "Numbered list"],
  ["> text", "Quotation"],
  ["---", "Divider"],
];

function FormattingHelp() {
  return (
    <details className={styles.help}>
      <summary>Formatting help</summary>
      <p>Each line is a paragraph. The toolbar adds these for you; you can also type them:</p>
      <dl>
        {SYNTAX.map(([code, meaning]) => (
          <div key={code}>
            <dt>
              <code>{code}</code>
            </dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
