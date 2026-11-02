"use client";

import { useActionState, type FormEvent } from "react";
import { deletePost, type DeleteState } from "./actions";
import admin from "../admin.module.css";
import styles from "./blog-admin.module.css";

export function DeletePost({ id, title }: { id: string; title: string }) {
  const [state, action, pending] = useActionState<DeleteState, FormData>(deletePost, {});

  const confirmDelete = (event: FormEvent<HTMLFormElement>) => {
    if (!window.confirm(`Delete “${title}”? It will be removed from the website. This can't be undone.`)) event.preventDefault();
  };

  return (
    <form action={action} onSubmit={confirmDelete} className={styles.danger}>
      <input type="hidden" name="id" value={id} />
      <div>
        <h2 className={styles.panelTitle}>Delete this post</h2>
        <p className={styles.hint}>It is removed from the website straight away. This can&rsquo;t be undone.</p>
        {state.error && (
          <p className={admin.error} role="alert">
            {state.error}
          </p>
        )}
      </div>
      <button type="submit" className={styles.deleteButton} disabled={pending}>
        {pending ? "Deleting…" : "Delete post"}
      </button>
    </form>
  );
}
