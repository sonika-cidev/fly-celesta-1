"use server";

import { redirect } from "next/navigation";
import { MIN_PASSWORD_LENGTH, adminConfigured, endSession, passwordMatches, startSession } from "@/lib/server/admin-session";
import { StoreUnavailableError } from "@/lib/server/store";

type LoginState = { error?: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfigured()) {
    return { error: `Admin sign-in isn't set up yet. Set ADMIN_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters) in the environment.` };
  }
  if (!passwordMatches(String(formData.get("password") ?? ""))) {
    // Slow down password guessing
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "That password isn't right." };
  }
  try {
    await startSession();
  } catch (error) {
    if (error instanceof StoreUnavailableError) {
      return { error: "The database isn't connected yet. Set DATABASE_URL, then sign in again." };
    }
    console.error("[admin] could not start a session", error);
    return { error: "Couldn't sign in just now. Please try again." };
  }
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
