import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import trainingsSeed from '../seeds/trainings.json'
import { seedCollectionData } from '../lib/seedCollectionData'

type SeedRecord = Record<string, unknown>

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  const mediaCache = new Map<string, number | string | null>()

  await seedCollectionData(
    'trainings',
    trainingsSeed as SeedRecord[],
    { payload, req },
    mediaCache,
  )
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Seeded training content is intentionally preserved.
}
