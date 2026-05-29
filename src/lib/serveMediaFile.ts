import fs from "fs/promises";
import path from "path";

const MEDIA_STATIC_DIR = process.env.CMS_MEDIA_DIR
  ? path.resolve(process.cwd(), process.env.CMS_MEDIA_DIR)
  : path.resolve(process.cwd(), "media");

const mimeTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export async function serveMediaFile(filename: string) {
  if (!filename || path.basename(filename) !== filename) {
    return Response.json({ errors: [{ message: "Invalid filename." }] }, { status: 400 });
  }

  const filePath = path.join(MEDIA_STATIC_DIR, filename);

  try {
    const buffer = await fs.readFile(filePath);
    const mimeType = mimeTypes[path.extname(filename).toLowerCase()] || "application/octet-stream";

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": mimeType,
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    return Response.json({ errors: [{ message: "File not found." }] }, { status: 404 });
  }
}
