import type { MigrateUpArgs } from '@payloadcms/db-postgres'

import mediaSeed from '../seeds/media.json'
import {
  ensureMedia,
  getMediaFilename,
  isRecord,
} from './seedMedia'

type RelationshipID = number | string
type SeedRecord = Record<string, unknown>
type PayloadArgs = Pick<MigrateUpArgs, 'payload' | 'req'>

const ignoredRootFields = new Set([
  'id',
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
  'collection',
  'globalType',
])

const mediaManifest = new Map(
  mediaSeed.map((entry) => [entry.filename, entry])
)

function getCollectionConfig(
  payload: MigrateUpArgs['payload'],
  collection: string
) {
  return payload.config.collections.find(
    (config) => config.slug === collection
  )
}

function getNamedFields(fields: any[] = []) {
  const namedFields = new Map<string, any>()

  for (const field of fields) {
    if (!field || typeof field !== 'object') {
      continue
    }

    if ('name' in field && typeof field.name === 'string') {
      namedFields.set(field.name, field)
      continue
    }

    if (Array.isArray(field.fields)) {
      for (const [name, nestedField] of getNamedFields(
        field.fields
      )) {
        namedFields.set(name, nestedField)
      }
    }

    if (Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        for (const [name, nestedField] of getNamedFields(
          tab.fields
        )) {
          namedFields.set(name, nestedField)
        }
      }
    }
  }

  return namedFields
}

function getLookupWhere(
  collection: string,
  value: SeedRecord
) {
  const filename = getMediaFilename(value)
  const slug = value.slug
  const email = value.email
  const title = value.title
  const name = value.name
  const domain = value.domain
  const authorName = value.authorName
  const quote = value.quote

  if (collection === 'media' && filename) {
    return { filename: { equals: filename } }
  }

  if (collection === 'sites') {
    if (typeof slug === 'string' && slug) {
      return { slug: { equals: slug } }
    }

    if (typeof domain === 'string' && domain) {
      return { domain: { equals: domain } }
    }
  }

  if (collection === 'users' && typeof email === 'string' && email) {
    return { email: { equals: email } }
  }

  if (
    [
      'training-reviews',
      'practitioner-reviews',
    ].includes(collection) &&
    typeof authorName === 'string' &&
    authorName &&
    typeof quote === 'string' &&
    quote
  ) {
    return {
      and: [
        { authorName: { equals: authorName } },
        { quote: { equals: quote } },
      ],
    }
  }

  if (typeof slug === 'string' && slug) {
    return { slug: { equals: slug } }
  }

  if (typeof title === 'string' && title) {
    return { title: { equals: title } }
  }

  if (typeof name === 'string' && name) {
    return { name: { equals: name } }
  }

  return null
}

async function findExistingId(
  collection: string,
  value: SeedRecord,
  { payload, req }: PayloadArgs
): Promise<RelationshipID | null> {
  const where = getLookupWhere(collection, value)

  if (!where) {
    return null
  }

  const result = await payload.find({
    collection: collection as never,
    where: where as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  return (result.docs[0] as { id?: RelationshipID } | undefined)?.id ?? null
}

async function resolveRelationship(
  value: unknown,
  relationTo: string,
  args: PayloadArgs,
  context: string,
  mediaCache: Map<string, RelationshipID | null>
): Promise<unknown> {
  if (value === null || value === undefined) {
    return null
  }

  if (!isRecord(value)) {
    return value
  }

  if (relationTo === 'media') {
    return ensureMedia(
      value,
      mediaManifest,
      args,
      context,
      mediaCache
    )
  }

  const existingId = await findExistingId(
    relationTo,
    value,
    args
  )

  if (existingId) {
    return existingId
  }

  const createdId = await createRelatedRecord(
    relationTo,
    value,
    args,
    context,
    mediaCache
  )

  if (createdId) {
    return createdId
  }

  args.payload.logger.warn(
    `Could not resolve ${relationTo} relationship for ${context}`
  )

  return null
}

async function createRelatedRecord(
  collection: string,
  value: SeedRecord,
  args: PayloadArgs,
  context: string,
  mediaCache: Map<string, RelationshipID | null>
): Promise<RelationshipID | null> {
  if (!getCollectionConfig(args.payload, collection)) {
    return null
  }

  if (!getLookupWhere(collection, value)) {
    return null
  }

  try {
    const data = await buildCollectionData(
      collection,
      value,
      args,
      mediaCache
    )
    const created = await args.payload.create({
      collection: collection as never,
      data: data as never,
      context: {
        seedImport: true,
      },
      overrideAccess: true,
      req: args.req,
    })
    const createdId = (created as { id?: RelationshipID }).id ?? null

    if (createdId) {
      args.payload.logger.info(
        `Created ${collection} for ${context}`
      )
    }

    return createdId
  } catch (error) {
    args.payload.logger.warn(
      `Could not create ${collection} relationship for ${context}`
    )
    args.payload.logger.warn(error)
    return null
  }
}

async function normalizeByFields(
  value: unknown,
  fields: any[] | undefined,
  args: PayloadArgs,
  context: string,
  mediaCache: Map<string, RelationshipID | null>
): Promise<unknown> {
  if (!isRecord(value)) {
    return value
  }

  const namedFields = getNamedFields(fields)
  const entries = await Promise.all(
    Object.entries(value).map(async ([key, nestedValue]) => {
      if (
        ignoredRootFields.has(key) ||
        !namedFields.has(key)
      ) {
        return null
      }

      return [
        key,
        await normalizeField(
          nestedValue,
          namedFields.get(key),
          args,
          `${context}.${key}`,
          mediaCache
        ),
      ] as const
    })
  )

  return Object.fromEntries(
    entries.filter(
      (entry): entry is readonly [string, unknown] =>
        entry !== null
    )
  )
}

async function normalizeField(
  value: unknown,
  field: any,
  args: PayloadArgs,
  context: string,
  mediaCache: Map<string, RelationshipID | null>
): Promise<unknown> {
  if (value === undefined) {
    return undefined
  }

  if (field.type === 'upload') {
    const resolved = await resolveRelationship(
      value,
      field.relationTo,
      args,
      context,
      mediaCache
    )

    if (field.required && !resolved) {
      throw new Error(
        `Required upload could not be resolved for ${context}`
      )
    }

    return resolved
  }

  if (field.type === 'relationship') {
    const relationTo = Array.isArray(field.relationTo)
      ? field.relationTo[0]
      : field.relationTo

    if (field.hasMany && Array.isArray(value)) {
      const resolved = await Promise.all(
        value.map((item, index) =>
          resolveRelationship(
            item,
            relationTo,
            args,
            `${context}[${index}]`,
            mediaCache
          )
        )
      )

      const resolvedItems = resolved.filter(Boolean)

      if (field.required && resolvedItems.length === 0) {
        throw new Error(
          `Required relationship could not be resolved for ${context}`
        )
      }

      return resolvedItems
    }

    const resolved = await resolveRelationship(
      value,
      relationTo,
      args,
      context,
      mediaCache
    )

    if (field.required && !resolved) {
      throw new Error(
        `Required relationship could not be resolved for ${context}`
      )
    }

    return resolved
  }

  if (field.type === 'group') {
    return normalizeByFields(
      value,
      field.fields,
      args,
      context,
      mediaCache
    )
  }

  if (field.type === 'array' && Array.isArray(value)) {
    return Promise.all(
      value.map((item, index) =>
        normalizeByFields(
          item,
          field.fields,
          args,
          `${context}[${index}]`,
          mediaCache
        )
      )
    )
  }

  return value
}

async function buildCollectionData(
  collection: string,
  seed: SeedRecord,
  args: PayloadArgs,
  mediaCache: Map<string, RelationshipID | null>
) {
  const config = getCollectionConfig(args.payload, collection)
  const normalized = await normalizeByFields(
    seed,
    config?.fields,
    args,
    `${collection}:${String(seed.slug ?? seed.title ?? seed.name ?? seed.id ?? 'unknown')}`,
    mediaCache
  )

  const data = isRecord(normalized) ? normalized : {}

  if (seed._status === 'published') {
    data._status = 'published'
  } else if (seed.status === 'published') {
    data._status = 'published'
  }

  return data
}

export async function seedMediaCollection(
  seeds: SeedRecord[],
  args: PayloadArgs,
  mediaCache = new Map<string, RelationshipID | null>()
) {
  for (const seed of seeds) {
    await ensureMedia(
      seed,
      mediaManifest,
      args,
      `media:${String(seed.filename ?? seed.id ?? 'unknown')}`,
      mediaCache
    )
  }
}

export async function seedCollectionData(
  collection: string,
  seeds: SeedRecord[],
  args: PayloadArgs,
  mediaCache = new Map<string, RelationshipID | null>()
) {
  for (const seed of seeds) {
    const label = String(
      seed.slug ?? seed.title ?? seed.name ?? seed.email ?? seed.id ?? 'unknown'
    )

    try {
      const data = await buildCollectionData(
        collection,
        seed,
        args,
        mediaCache
      )
      const existingId = await findExistingId(
        collection,
        seed,
        args
      )

      if (existingId) {
        await args.payload.update({
          collection: collection as never,
          id: existingId,
          data: data as never,
          context: {
            seedImport: true,
          },
          overrideAccess: true,
          req: args.req,
        })

        args.payload.logger.info(
          `Updated ${collection}: ${label}`
        )
        continue
      }

      await args.payload.create({
        collection: collection as never,
        data: data as never,
        context: {
          seedImport: true,
        },
        overrideAccess: true,
        req: args.req,
      })

      args.payload.logger.info(
        `Created ${collection}: ${label}`
      )
    } catch (error) {
      args.payload.logger.error(
        `Failed to seed ${collection}: ${label}`
      )
      args.payload.logger.error(error)
    }
  }
}
