import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from '@payloadcms/db-postgres'

import footerSeed from '../seeds/footer.json'
import headerSeed from '../seeds/header.json'
import mediaSeed from '../seeds/media.json'
import {
  ensureMedia,
  getMediaFilename,
  isRecord,
} from '../lib/seedMedia'

type SeedRecord = Record<string, unknown>

async function normalizeGlobalValue(
  value: unknown,
  mediaManifest: Map<string, SeedRecord>,
  args: Pick<MigrateUpArgs, 'payload' | 'req'>,
  context: string
): Promise<unknown> {
  if (Array.isArray(value)) {
    return Promise.all(
      value.map((item, index) =>
        normalizeGlobalValue(
          item,
          mediaManifest,
          args,
          `${context}[${index}]`
        )
      )
    )
  }

  if (!isRecord(value)) {
    return value
  }

  const filename = getMediaFilename(value)

  if (filename) {
    return ensureMedia(
      value,
      mediaManifest,
      args,
      context
    )
  }

  const normalizedEntries = await Promise.all(
    Object.entries(value).map(
      async ([key, nestedValue]) => [
        key,
        await normalizeGlobalValue(
          nestedValue,
          mediaManifest,
          args,
          `${context}.${key}`
        ),
      ]
    )
  )

  return Object.fromEntries(normalizedEntries)
}

async function buildGlobalData(
  seed: SeedRecord,
  mediaManifest: Map<string, SeedRecord>,
  args: Pick<MigrateUpArgs, 'payload' | 'req'>,
  context: string
) {
  const normalized = await normalizeGlobalValue(
    seed,
    mediaManifest,
    args,
    context
  )

  return isRecord(normalized) ? normalized : {}
}

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  const mediaManifest = new Map(
    mediaSeed.map((entry) => [entry.filename, entry])
  )

  const headerData = await buildGlobalData(
    headerSeed as SeedRecord,
    mediaManifest,
    { payload, req },
    'header'
  )

  const footerData = await buildGlobalData(
    footerSeed as SeedRecord,
    mediaManifest,
    { payload, req },
    'footer'
  )

  await payload.updateGlobal({
    slug: 'header',
    data: headerData as never,
    req,
  })

  payload.logger.info('Seeded global: header')

  await payload.updateGlobal({
    slug: 'footer',
    data: footerData as never,
    req,
  })

  payload.logger.info('Seeded global: footer')
}

export async function down({
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await payload.updateGlobal({
    slug: 'header',
    data: {
      logoText: 'EVOQ',
      logoImage: null,
      logoHref: '/',
      cta: {
        label: null,
        href: null,
      },
      menuItems: [],
    } as never,
    req,
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      backgroundColor: '#F7F8FB',
      textColor: '#0F172A',
      logoText: 'EVOQ',
      logoImage: null,
      logoHref: '/',
      tagline: 'One Suite. Endless Potential.',
      columns: [],
      copyrightText:
        '© {Y} Social DNA Labs. All rights reserved.',
      socialLinks: [],
    } as never,
    req,
  })

  payload.logger.info(
    'Rolled back globals: header, footer'
  )
  payload.logger.warn(
    'Imported media files were not deleted automatically.'
  )
}
