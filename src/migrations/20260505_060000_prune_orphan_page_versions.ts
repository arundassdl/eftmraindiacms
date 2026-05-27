import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "_pages_v"
    WHERE "parent_id" IS NULL
  `)

  payload.logger.info('Pruned orphaned page versions.')
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Orphaned page versions are intentionally not restored.
}
