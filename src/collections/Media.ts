import fs from "fs/promises";
import sharp from "sharp";
import type { CollectionConfig, PayloadRequest } from "payload";

const MAX_IMAGE_DIMENSION = 2400;

type CompressibleMimeType = "image/avif" | "image/jpeg" | "image/png" | "image/webp";
type UploadFile = NonNullable<PayloadRequest["file"]>;
type BeforeOperationHook = NonNullable<NonNullable<CollectionConfig["hooks"]>["beforeOperation"]>[number];

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

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
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
