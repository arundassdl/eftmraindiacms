import fs from 'fs'
import path from 'path'
import os from 'os'

import type { MigrateUpArgs } from '@payloadcms/db-postgres'

type RelationshipID = number | string
type SeedRecord = Record<string, unknown>

const SHOULD_IMPORT_MEDIA =
  process.env.CMS_SEED_MEDIA_IMPORT !== 'false'

const MEDIA_DIR = process.env.CMS_MEDIA_DIR
  ? path.resolve(process.cwd(), process.env.CMS_MEDIA_DIR)
  : path.resolve(process.cwd(), 'media')

const UPLOAD_DIR = path.resolve(process.cwd(), 'media')

const inFlightImports = new Map<
  string,
  Promise<RelationshipID | null>
>()

function isCrossDeviceRenameError(error: unknown) {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'EXDEV'
  )
}

async function moveFile(source: string, destination: string) {
  try {
    await fs.promises.rename(source, destination)
  } catch (error) {
    if (!isCrossDeviceRenameError(error)) {
      throw error
    }

    await fs.promises.copyFile(source, destination)
    await fs.promises.unlink(source)
  }
}

export function isRecord(
  value: unknown
): value is SeedRecord {
  return typeof value === 'object' && value !== null
}

export function getMediaFilename(
  value: unknown
): string | null {
  if (!isRecord(value)) {
    return null
  }

  const filename = value.filename

  return typeof filename === 'string' && filename.length > 0
    ? filename
    : null
}

async function findMediaByFilename(
  filename: string,
  {
    payload,
    req,
  }: Pick<MigrateUpArgs, 'payload' | 'req'>
) {
  const mediaResult = await payload.find({
    collection: 'media',
    where: {
      filename: {
        equals: filename,
      },
    },
    limit: 1,
    req,
  })

  return mediaResult.docs[0] ?? null
}

export async function ensureMedia(
  mediaValue: unknown,
  mediaManifest: Map<string, SeedRecord>,
  {
    payload,
    req,
  }: Pick<MigrateUpArgs, 'payload' | 'req'>,
  context: string,
  mediaCache?: Map<string, RelationshipID | null>
): Promise<RelationshipID | null> {
  if (
    typeof mediaValue === 'number' ||
    typeof mediaValue === 'string'
  ) {
    return mediaValue
  }

  const filename = getMediaFilename(mediaValue)

  if (!filename) {
    return null
  }

  if (mediaCache?.has(filename)) {
    return mediaCache.get(filename) ?? null
  }

  if (inFlightImports.has(filename)) {
    return inFlightImports.get(filename) ?? null
  }

  const importTask = (async () => {
    const existingMedia = await findMediaByFilename(filename, {
      payload,
      req,
    })

    if (existingMedia) {
      mediaCache?.set(filename, existingMedia.id)
      return existingMedia.id
    }

    if (!SHOULD_IMPORT_MEDIA) {
      payload.logger.warn(
        `Media not found for ${context}: ${filename}. Import is disabled because CMS_SEED_MEDIA_IMPORT=false.`
      )
      mediaCache?.set(filename, null)
      return null
    }

    const absolutePath = path.join(MEDIA_DIR, filename)

    if (!fs.existsSync(absolutePath)) {
      payload.logger.warn(
        `Media file missing for ${context}: ${absolutePath}`
      )
      mediaCache?.set(filename, null)
      return null
    }

    const seedEntry = mediaManifest.get(filename)
    const usesUploadDirAsSource =
      path.dirname(absolutePath) === UPLOAD_DIR
    const tempDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'cms-seed-media-')
    )
    const stagedPath = path.join(tempDir, filename)
    let sourcePath = absolutePath
    let sourceMoved = false

    try {
      if (usesUploadDirAsSource) {
        await moveFile(absolutePath, stagedPath)
        sourcePath = stagedPath
        sourceMoved = true
      }

      const createdMedia = await payload.create({
        collection: 'media',
        data: {
          alt:
            typeof seedEntry?.alt === 'string'
              ? seedEntry.alt
              : null,
        } as never,
        filePath: sourcePath,
        req,
      })

      payload.logger.info(`Imported media: ${filename}`)

      mediaCache?.set(filename, createdMedia.id)

      return createdMedia.id
    } catch (error) {
      if (
        sourceMoved &&
        fs.existsSync(stagedPath) &&
        !fs.existsSync(absolutePath)
      ) {
        await moveFile(stagedPath, absolutePath)
      }

      throw error
    } finally {
      if (fs.existsSync(stagedPath)) {
        await fs.promises.unlink(stagedPath)
      }

      await fs.promises.rm(tempDir, {
        recursive: true,
        force: true,
      })
    }
  })()

  inFlightImports.set(filename, importTask)

  try {
    return await importTask
  } finally {
    inFlightImports.delete(filename)
  }
}
