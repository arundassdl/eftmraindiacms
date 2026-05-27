import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE "practitioner_registrations"
      ADD COLUMN IF NOT EXISTS "first_name" varchar,
      ADD COLUMN IF NOT EXISTS "last_name" varchar,
      ADD COLUMN IF NOT EXISTS "currency_symbol" varchar,
      ADD COLUMN IF NOT EXISTS "currency_code" varchar
  `)

  payload.logger.info('Added practitioner registration name and currency fields.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE "practitioner_registrations"
      DROP COLUMN IF EXISTS "currency_code",
      DROP COLUMN IF EXISTS "currency_symbol",
      DROP COLUMN IF EXISTS "last_name",
      DROP COLUMN IF EXISTS "first_name"
  `)

  payload.logger.info('Rolled back practitioner registration name and currency fields.')
}

