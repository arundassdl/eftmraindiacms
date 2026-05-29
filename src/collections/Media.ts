import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { CollectionConfig, PayloadRequest } from "payload";

const MAX_IMAGE_DIMENSION = 2400;
const MEDIA_STATIC_DIR = process.env.CMS_MEDIA_DIR
  ? path.resolve(process.cwd(), process.env.CMS_MEDIA_DIR)
  : path.resolve(process.cwd(), "media");

type CompressibleMimeType = "image/avif" | "image/jpeg" | "image/png" | "image/webp";
type UploadFile = NonNullable<PayloadRequest["file"]>;
type BeforeOperationHook = NonNullable<NonNullable<CollectionConfig["hooks"]>["beforeOperation"]>[number];
type UploadHandler = NonNullable<Extract<CollectionConfig["upload"], object>["handlers"]>[number];

const fallbackMimeTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function isCompressibleImage(mimeType?: string): mimeType is CompressibleMimeType {
  return mimeType === "image/avif" || mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp";
}

async function getFileBuffer(file: UploadFile) {
  if (file.tempFilePath) {
    return fs.readFile(file.tempFilePath);
  }

  return file.data;
}

async function setFileBuffer(file: UploadFile, buffer: Buffer) {
  if (file.tempFilePath) {
    await fs.writeFile(file.tempFilePath, buffer);
  }

  file.data = buffer;
  file.size = buffer.length;
}

async function compressImageBuffer(buffer: Buffer, mimeType: CompressibleMimeType) {
  const image = sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      fit: "inside",
      height: MAX_IMAGE_DIMENSION,
      width: MAX_IMAGE_DIMENSION,
      withoutEnlargement: true,
    });

  if (mimeType === "image/jpeg") {
    return image.jpeg({ mozjpeg: true, quality: 82 }).toBuffer();
  }

  if (mimeType === "image/png") {
    return image.png({ compressionLevel: 9, palette: true, quality: 82 }).toBuffer();
  }

  if (mimeType === "image/webp") {
    return image.webp({ effort: 4, quality: 82 }).toBuffer();
  }

  return image.avif({ effort: 4, quality: 60 }).toBuffer();
}

const compressUploadedImage: BeforeOperationHook = async ({ args, operation, req }) => {
  if (operation !== "create" && operation !== "update") {
    return args;
  }

  const file = req.file;

  if (!file || !isCompressibleImage(file.mimetype)) {
    return args;
  }

  try {
    const originalBuffer = await getFileBuffer(file);

    if (!originalBuffer.length) {
      return args;
    }

    const compressedBuffer = await compressImageBuffer(originalBuffer, file.mimetype);

    if (compressedBuffer.length >= originalBuffer.length) {
      return args;
    }

    await setFileBuffer(file, compressedBuffer);

    req.payload.logger.info(`Compressed uploaded image ${file.name}: ${originalBuffer.length} -> ${compressedBuffer.length} bytes`);
  } catch (error) {
    req.payload.logger.warn(`Skipped image compression for ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
  }

  return args;
};

const serveLocalMediaFile: UploadHandler = async (_req, { doc, params }) => {
  const filename = params.filename;

  if (!filename || path.basename(filename) !== filename) {
    return Response.json({ errors: [{ message: "Invalid filename." }] }, { status: 400 });
  }

  const filePath = path.join(MEDIA_STATIC_DIR, filename);

  try {
    const buffer = await fs.readFile(filePath);
    const docRecord = doc as Record<string, unknown>;
    const docMimeType = typeof docRecord.mimeType === "string" ? docRecord.mimeType : null;
    const mimeType = docMimeType || fallbackMimeTypes[path.extname(filename).toLowerCase()] || "application/octet-stream";

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
};

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: MEDIA_STATIC_DIR,
    handlers: [serveLocalMediaFile],
    mimeTypes: ["image/avif", "image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif", "application/pdf"],
  },
  admin: {
    group: "Content & Site",
  },
  hooks: {
    beforeOperation: [compressUploadedImage],
  },

  fields: [
    {
      name: "alt",
      type: "text",
    },
  ],
};
