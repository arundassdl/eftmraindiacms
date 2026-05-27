import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import trainersSeed from '../seeds/trainers.json'
import { seedCollectionData } from '../lib/seedCollectionData'

type SeedRecord = Record<string, unknown>

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  const mediaCache = new Map<string, number | string | null>()

  await seedCollectionData(
    'trainers',
    trainersSeed as SeedRecord[],
    { payload, req },
    mediaCache
  )
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Seeded trainer content is intentionally not deleted automatically.
}
