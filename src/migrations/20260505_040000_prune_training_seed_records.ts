import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

import trainingsSeed from '../seeds/trainings.json'

type SeedRecord = Record<string, unknown>
type TrainingDoc = {
  id?: number | string
  slug?: string | null
}

const trainingSlugs = new Set(
  (trainingsSeed as SeedRecord[])
    .map((training) => training.slug)
    .filter((slug): slug is string => typeof slug === 'string')
)

export async function up({
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  const trainings = await payload.find({
    collection: 'trainings',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
    select: {
      slug: true,
    },
  })

  const staleTrainings = (trainings.docs as TrainingDoc[]).filter(
    (training) =>
      training.id &&
      (!training.slug || !trainingSlugs.has(training.slug))
  )

  for (const training of staleTrainings) {
    await payload.delete({
      collection: 'trainings',
      id: training.id!,
      overrideAccess: true,
      req,
    })

    payload.logger.info(
      `Deleted training outside trainings.json seed: ${training.slug ?? training.id}`
    )
  }

  payload.logger.info(
    `Pruned ${staleTrainings.length} training record(s) outside trainings.json.`
  )
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Deleted training records are intentionally not restored automatically.
  // Restore them from backup or seed files if they are needed again.
}
