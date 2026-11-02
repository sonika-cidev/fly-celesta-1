import { IMAGE_TYPES, MEDIA_PATH } from "@/lib/blog";
import { getStore, StoreUnavailableError } from "@/lib/server/store";

const notFound = () => new Response("Not found", { status: 404 });

/** Serves images uploaded in the blog editor: /media/<id>.<jpg|png|webp>. */
export async function GET(_request: Request, ctx: RouteContext<"/media/[file]">) {
  const match = MEDIA_PATH.exec(`/media/${(await ctx.params).file}`);
  if (!match) return notFound();

  try {
    const image = await getStore().getImage(match[1]);
    // The extension has to match the stored type, so each image has exactly one address
    if (!image || IMAGE_TYPES[image.type] !== match[2]) return notFound();
    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": image.type,
        "Content-Length": String(image.data.length),
        // An address always holds the same image (a replaced image gets a new one), so it can be cached for good
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (!(error instanceof StoreUnavailableError)) console.error("[media] could not load image", error);
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
