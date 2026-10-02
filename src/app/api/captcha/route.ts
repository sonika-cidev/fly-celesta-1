import { createChallenge } from "@/lib/server/captcha";
import { StoreUnavailableError } from "@/lib/server/store";

// A fresh question for every request — never cached.
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  try {
    return Response.json(await createChallenge(), { headers: noStore });
  } catch (error) {
    if (!(error instanceof StoreUnavailableError)) console.error("[captcha] could not create a challenge", error);
    return Response.json({ error: "unavailable" }, { status: 503, headers: noStore });
  }
}
