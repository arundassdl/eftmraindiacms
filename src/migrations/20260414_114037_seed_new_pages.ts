import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from '@payloadcms/db-postgres'

import pagesSeed from '../seeds/pages.json'
import {
  deletePagesBySlug,
  seedPages,
} from '../lib/seedPages'

const NEW_PAGE_SLUGS: string[] = [
  // Add the page slugs from pages.json that this
  // migration should insert or update.
]

const selectedPages = pagesSeed.filter((page) =>
  NEW_PAGE_SLUGS.includes(page.slug)
)

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  await seedPages(selectedPages as Record<string, unknown>[], {
    payload,
    req,
  })
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await deletePagesBySlug(NEW_PAGE_SLUGS, {
    db,
    payload,
    req,
  })
}
