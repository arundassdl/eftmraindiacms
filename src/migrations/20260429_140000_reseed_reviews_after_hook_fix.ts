import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import practitionerReviewsSeed from '../seeds/practitioner-reviews.json'
import practitionersSeed from '../seeds/practitioners.json'
import trainingReviewsSeed from '../seeds/training-reviews.json'
import trainingsSeed from '../seeds/trainings.json'
import { seedCollectionData } from '../lib/seedCollectionData'

type SeedRecord = Record<string, unknown>

const trainingSlugs = new Set(
  (trainingsSeed as SeedRecord[])
    .map((training) => training.slug)
    .filter((slug): slug is string => typeof slug === 'string')
)

const matchingTrainingReviewsSeed = (
  trainingReviewsSeed as SeedRecord[]
).filter((review) => {
  const training = review.training
  return (
    training &&
    typeof training === 'object' &&
    'slug' in training &&
    typeof training.slug === 'string' &&
    trainingSlugs.has(training.slug)
  )
})

const collectionSeeds: {
  slug: string
  seeds: SeedRecord[]
}[] = [
  {
    slug: 'trainings',
    seeds: trainingsSeed as SeedRecord[],
  },
  {
    slug: 'training-reviews',
    seeds: matchingTrainingReviewsSeed,
  },
  {
    slug: 'practitioners',
    seeds: practitionersSeed as SeedRecord[],
  },
  {
    slug: 'practitioner-reviews',
    seeds: practitionerReviewsSeed as SeedRecord[],
  },
]

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  const mediaCache = new Map<string, number | string | null>()

  for (const collection of collectionSeeds) {
    await seedCollectionData(
      collection.slug,
      collection.seeds,
      { payload, req },
      mediaCache
    )
  }
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Seeded content is intentionally not deleted automatically.
}
