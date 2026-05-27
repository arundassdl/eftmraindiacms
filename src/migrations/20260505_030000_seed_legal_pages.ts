import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import pagesSeed from '../seeds/pages.json'
import {
  deletePagesBySlug,
  seedPages,
} from '../lib/seedPages'

const LEGAL_PAGE_SLUGS = [
  'disclaimer',
  'terms-of-service',
  'refund-policy',
  'privacy-policy',
]

const selectedPages = pagesSeed.filter((page) =>
  LEGAL_PAGE_SLUGS.includes(page.slug)
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
  await deletePagesBySlug(LEGAL_PAGE_SLUGS, {
    db,
    payload,
    req,
  })
}
