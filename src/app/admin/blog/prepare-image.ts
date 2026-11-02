import { IMAGE_MAX_BYTES, IMAGE_MAX_EDGE } from "@/lib/blog";

const encode = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Shrinks a photo to IMAGE_MAX_EDGE pixels on its long edge and re-encodes it before upload — WebP where the
 * browser can write it (Safari can't), JPEG otherwise. Re-encoding also drops camera data such as GPS location.
 */
export async function prepareImage(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This file can't be read as an image — use a JPG, PNG or WebP photo.");
  }

  const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't prepare the image. Please try another browser.");
  // Transparent areas become white, like the page behind them (JPEG has no transparency)
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.85, 0.75, 0.6]) {
    const webp = await encode(canvas, "image/webp", quality);
    const blob = webp?.type === "image/webp" ? webp : await encode(canvas, "image/jpeg", quality);
    if (blob && blob.size <= IMAGE_MAX_BYTES) {
      return new File([blob], blob.type === "image/webp" ? "image.webp" : "image.jpg", { type: blob.type });
    }
  }
  throw new Error("This image is too large even after resizing. Please choose a smaller one.");
}
