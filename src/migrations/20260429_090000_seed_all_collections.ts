import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import gallerySeed from '../seeds/gallery.json'
import leadsSeed from '../seeds/leads.json'
import mediaSeed from '../seeds/media.json'
import postsSeed from '../seeds/posts.json'
import practitionerReviewsSeed from '../seeds/practitioner-reviews.json'
import practitionersSeed from '../seeds/practitioners.json'
import sitesSeed from '../seeds/sites.json'
import testimonialsSeed from '../seeds/testimonials.json'
import trainingRegistrationsSeed from '../seeds/training-registrations.json'
import trainingReviewsSeed from '../seeds/training-reviews.json'
import trainingsSeed from '../seeds/trainings.json'
import {
  seedCollectionData,
  seedMediaCollection,
} from '../lib/seedCollectionData'

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
  { slug: 'sites', seeds: sitesSeed as SeedRecord[] },
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
  { slug: 'posts', seeds: postsSeed as SeedRecord[] },
  {
    slug: 'testimonials',
    seeds: testimonialsSeed as SeedRecord[],
  },
  { slug: 'gallery', seeds: gallerySeed as SeedRecord[] },
  {
    slug: 'leads',
    seeds: leadsSeed as SeedRecord[],
  },
  {
    slug: 'training-registrations',
    seeds: trainingRegistrationsSeed as SeedRecord[],
  },
]

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  const mediaCache = new Map<string, number | string | null>()

  await seedMediaCollection(mediaSeed as SeedRecord[], {
    payload,
    req,
  }, mediaCache)

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
