import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import practitionerReviewsSeed from '../seeds/practitioner-reviews.json'
import practitionersSeed from '../seeds/practitioners.json'
import { seedCollectionData } from '../lib/seedCollectionData'

type SeedRecord = Record<string, unknown>

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  const mediaCache = new Map<string, number | string | null>()

  await seedCollectionData(
    'practitioners',
    practitionersSeed as SeedRecord[],
    { payload, req },
    mediaCache
  )

  await seedCollectionData(
    'practitioner-reviews',
    practitionerReviewsSeed as SeedRecord[],
    { payload, req },
    mediaCache
  )
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Seeded content is intentionally not deleted automatically.
}
