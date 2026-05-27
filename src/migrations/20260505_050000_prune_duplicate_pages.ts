import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import pagesSeed from '../seeds/pages.json'
import { seedPages } from '../lib/seedPages'

type SeedRecord = Record<string, unknown>

const pageSlugs = (pagesSeed as SeedRecord[])
  .map((page) => page.slug)
  .filter((slug): slug is string => typeof slug === 'string')

function quote(value: string) {
  return `'${value.replace(/'/g, "''")}'`
}

export async function up({
  db,
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  await seedPages(pagesSeed as SeedRecord[], {
    payload,
    req,
  })

  const quotedPageSlugs = pageSlugs.map(quote).join(', ')

  await db.execute(`
    WITH victim_pages AS (
      SELECT id
      FROM (
        SELECT
          id,
          slug,
          row_number() OVER (
            PARTITION BY slug
            ORDER BY updated_at DESC NULLS LAST, id DESC
          ) AS row_number
        FROM "pages"
      ) ranked_pages
      WHERE
        slug NOT IN (${quotedPageSlugs})
        OR row_number > 1
    )
    DELETE FROM "_pages_v"
    WHERE "parent_id" IN (SELECT id FROM victim_pages)
  `)

  await db.execute(`
    WITH victim_pages AS (
      SELECT id
      FROM (
        SELECT
          id,
          slug,
          row_number() OVER (
            PARTITION BY slug
            ORDER BY updated_at DESC NULLS LAST, id DESC
          ) AS row_number
        FROM "pages"
      ) ranked_pages
      WHERE
        slug NOT IN (${quotedPageSlugs})
        OR row_number > 1
    )
    DELETE FROM "pages"
    WHERE "id" IN (SELECT id FROM victim_pages)
  `)

  await db.execute(`
    DELETE FROM "_pages_v"
    WHERE "parent_id" IS NULL
  `)

  payload.logger.info(
    'Pruned duplicate page records, stale pages, and orphaned page versions.'
  )
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Deleted duplicate/stale pages are intentionally not restored.
}
