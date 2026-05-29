import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'
import mediaSeed from '../seeds/media.json'
import {
  ensureMedia,
  getMediaFilename,
  isRecord,
} from './seedMedia'

type RelationshipID = number | string
type SeedRecord = Record<string, unknown>

function getSiteSlug(page: SeedRecord): string | null {
  const site = isRecord(page.site) ? page.site : null
  const slug = site?.slug
  const domain = site?.domain

  if (typeof slug === 'string' && slug.length > 0) {
    return slug
  }

  if (typeof domain === 'string' && domain.length > 0) {
    return domain
  }

  return null
}

function hasRelationshipID(value: unknown): boolean {
  return (
    typeof value === 'number' ||
    typeof value === 'string'
  )
}

function sanitizeLayout(
  layout: unknown,
  siteId: RelationshipID,
  pageSlug: string,
  logger: Pick<MigrateUpArgs['payload']['logger'], 'warn'>
): unknown[] {
  if (!Array.isArray(layout)) {
    return []
  }

  const sanitizedLayout: unknown[] = []

  for (const block of layout) {
    if (!isRecord(block)) {
      continue
    }

    const blockType = block.blockType

    if (blockType === 'crm-stats-section') {
      if (!hasRelationshipID(block.backgroundImage)) {
        logger.warn(
          `Skipped crm-stats-section block for page ${pageSlug}: required backgroundImage could not be resolved`
        )
        continue
      }
    }

    if (blockType === 'crm-resource-management') {
      const cards = Array.isArray(block.cards)
        ? block.cards.filter(
            (card): card is SeedRecord =>
              isRecord(card) &&
              hasRelationshipID(card.image)
          )
        : []

      if (cards.length === 0) {
        logger.warn(
          `Skipped crm-resource-management block for page ${pageSlug}: no cards had valid required images`
        )
        continue
      }

      if (
        Array.isArray(block.cards) &&
        cards.length !== block.cards.length
      ) {
        logger.warn(
          `Removed ${
            block.cards.length - cards.length
          } crm-resource-management card(s) without required images for page ${pageSlug}`
        )
      }

      sanitizedLayout.push({
        ...block,
        cards,
      })
      continue
    }

    if (blockType === 'scale-with-all') {
      if (!hasRelationshipID(block.image)) {
        logger.warn(
          `Skipped scale-with-all block for page ${pageSlug}: required image could not be resolved`
        )
        continue
      }
    }

    if (blockType === 'eftmra-testimonial-listing') {
      sanitizedLayout.push({
        ...block,
        site: hasRelationshipID(block.site)
          ? block.site
          : siteId,
      })
      continue
    }

    sanitizedLayout.push(block)
  }

  return sanitizedLayout
}

async function resolveMediaRelationship(
  value: unknown,
  mediaManifest: Map<string, SeedRecord>,
  mediaCache: Map<string, RelationshipID | null>,
  {
    payload,
    req,
  }: Pick<MigrateUpArgs, 'payload' | 'req'>,
  context: string
): Promise<RelationshipID | null> {
  if (
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value
  }

  return ensureMedia(
    value,
    mediaManifest,
    { payload, req },
    context,
    mediaCache
  )
}

async function normalizeSeedValue(
  value: unknown,
  mediaManifest: Map<string, SeedRecord>,
  mediaCache: Map<string, RelationshipID | null>,
  args: Pick<MigrateUpArgs, 'payload' | 'req'>,
  context: string
): Promise<unknown> {
  if (Array.isArray(value)) {
    const normalizedItems = await Promise.all(
      value.map((item, index) =>
        normalizeSeedValue(
          item,
          mediaManifest,
          mediaCache,
          args,
          `${context}[${index}]`
        )
      )
    )

    return normalizedItems
  }

  if (!isRecord(value)) {
    return value
  }

  const mediaFilename = getMediaFilename(value)

  if (mediaFilename) {
    return resolveMediaRelationship(
      value,
      mediaManifest,
      mediaCache,
      args,
      context
    )
  }

  const normalizedEntries = await Promise.all(
    Object.entries(value).map(
      async ([key, nestedValue]) => {
        if (
          key === 'id' ||
          [
            'createdAt',
            'updatedAt',
            'url',
            'thumbnailURL',
            'mimeType',
            'filesize',
            'width',
            'height',
            'focalX',
            'focalY',
          ].includes(key)
        ) {
          return null
        }

        const normalizedValue =
          await normalizeSeedValue(
            nestedValue,
            mediaManifest,
            mediaCache,
            args,
            `${context}.${key}`
          )

        return [key, normalizedValue] as const
      }
    )
  )

  return Object.fromEntries(
    normalizedEntries.filter(
      (
        entry
      ): entry is readonly [string, unknown] =>
        entry !== null
    )
  )
}

async function buildSiteData(
  page: SeedRecord,
  mediaManifest: Map<string, SeedRecord>,
  mediaCache: Map<string, RelationshipID | null>,
  args: Pick<MigrateUpArgs, 'payload' | 'req'>
) {
  const site = isRecord(page.site) ? page.site : null

  if (!site) {
    return null
  }

  const normalizedSite = await normalizeSeedValue(
    site,
    mediaManifest,
    mediaCache,
    args,
    `site:${String(site.slug ?? site.domain ?? 'unknown')}`
  )

  if (!isRecord(normalizedSite)) {
    return null
  }

  return {
    name:
      typeof normalizedSite.name === 'string'
        ? normalizedSite.name
        : 'Untitled Site',
    slug:
      typeof normalizedSite.slug === 'string'
        ? normalizedSite.slug
        : typeof normalizedSite.domain === 'string'
          ? normalizedSite.domain
          : 'site',
    domain:
      typeof normalizedSite.domain === 'string'
        ? normalizedSite.domain
        : null,
    layoutType: normalizedSite.layoutType,
    theme: normalizedSite.theme,
    micrositeSubmenu:
      normalizedSite.micrositeSubmenu,
    footer: normalizedSite.footer,
  }
}

async function upsertSite(
  page: SeedRecord,
  mediaManifest: Map<string, SeedRecord>,
  mediaCache: Map<string, RelationshipID | null>,
  {
    payload,
    req,
  }: Pick<MigrateUpArgs, 'payload' | 'req'>
): Promise<RelationshipID | null> {
  const siteSlug = getSiteSlug(page)

  if (!siteSlug) {
    payload.logger.warn(
      `Site slug missing for page: ${String(page.slug ?? 'unknown')}`
    )
    return null
  }

  const siteData = await buildSiteData(
    page,
    mediaManifest,
    mediaCache,
    { payload, req }
  )

  if (!siteData) {
    payload.logger.warn(
      `Site data missing for page: ${String(page.slug ?? 'unknown')}`
    )
    return null
  }

  const existingSite = await payload.find({
    collection: 'sites',
    where: {
      slug: {
        equals: siteSlug,
      },
    },
    depth: 0,
    limit: 1,
    req,
    select: {
      slug: true,
    },
  })

  if (existingSite.docs[0]) {
    await payload.update({
      collection: 'sites',
      id: existingSite.docs[0].id,
      data: siteData as never,
      depth: 0,
      req,
      select: {
        slug: true,
      },
    })

    payload.logger.info(`Updated site: ${siteSlug}`)

    return existingSite.docs[0].id
  }

  const createdSite = await payload.create({
    collection: 'sites',
    data: siteData as never,
    depth: 0,
    req,
    select: {
      slug: true,
    },
  })

  payload.logger.info(`Created site: ${siteSlug}`)

  return createdSite.id
}

async function buildPageData(
  page: SeedRecord,
  siteId: RelationshipID,
  mediaManifest: Map<string, SeedRecord>,
  mediaCache: Map<string, RelationshipID | null>,
  args: Pick<MigrateUpArgs, 'payload' | 'req'>
) {
  const layout = await normalizeSeedValue(
    page.layout ?? [],
    mediaManifest,
    mediaCache,
    args,
    `page:${String(page.slug ?? 'unknown')}.layout`
  )

  const pageSlug =
    typeof page.slug === 'string'
      ? page.slug
      : 'unknown'

  const sanitizedLayout = sanitizeLayout(
    layout,
    siteId,
    pageSlug,
    args.payload.logger
  )

  return {
    title: page.title,
    slug: page.slug,
    site: siteId,
    layout: sanitizedLayout,
    _status: 'published',
  }
}

export async function seedPages(
  pages: SeedRecord[],
  { payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>
): Promise<void> {
  const mediaManifest = new Map(
    mediaSeed.map((entry) => [entry.filename, entry])
  )
  const mediaCache = new Map<
    string,
    RelationshipID | null
  >()

  for (const page of pages) {
    const siteId = await upsertSite(
      page,
      mediaManifest,
      mediaCache,
      { payload, req }
    )

    if (!siteId) {
      continue
    }

    const pageData = await buildPageData(
      page,
      siteId,
      mediaManifest,
      mediaCache,
      { payload, req }
    )

    const existing = await payload.find({
      collection: 'pages',
      where: {
        and: [
          {
            slug: {
              equals: page.slug,
            },
          },
          {
            site: {
              equals: siteId,
            },
          },
        ],
      },
      depth: 0,
      limit: 100,
      req,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      const [pageToUpdate, ...duplicatePages] = existing.docs

      for (const duplicatePage of duplicatePages) {
        await payload.delete({
          collection: 'pages',
          id: duplicatePage.id,
          req,
          overrideAccess: true,
        })
      }

      if (duplicatePages.length > 0) {
        payload.logger.warn(
          `Removed ${duplicatePages.length} duplicate page(s): ${page.slug}`
        )
      }

      await payload.update({
        collection: 'pages',
        id: pageToUpdate.id,
        data: pageData as never,
        req,
        overrideAccess: true,
      })

      payload.logger.info(`Updated page: ${page.slug}`)
      continue
    }

    await payload.create({
      collection: 'pages',
      data: pageData as never,
      req,
      overrideAccess: true,
    })

    payload.logger.info(`Created page: ${page.slug}`)
  }
}

export async function deletePagesBySlug(
  slugs: string[],
  { db, payload }: Pick<MigrateDownArgs, 'db' | 'payload' | 'req'>
): Promise<void> {
  if (slugs.length === 0) {
    return
  }

  const quotedSlugs = slugs
    .map((slug) => `'${slug.replace(/'/g, "''")}'`)
    .join(', ')

  await db.execute(`
    DELETE FROM "_pages_v"
    WHERE "parent_id" IN (
      SELECT "id"
      FROM "pages"
      WHERE "slug" IN (${quotedSlugs})
    )
  `)

  await db.execute(`
    DELETE FROM "pages"
    WHERE "slug" IN (${quotedSlugs})
  `)

  payload.logger.info(`Deleted seeded pages: ${slugs.join(', ')}`)
}
