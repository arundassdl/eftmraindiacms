import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE "practitioners"
      ADD COLUMN IF NOT EXISTS "address_line1" varchar,
      ADD COLUMN IF NOT EXISTS "address_line2" varchar
  `)

  await db.execute(`
    UPDATE "practitioners"
    SET
      "address_line1" = regexp_replace("bio", '^Practice address:\\s*', ''),
      "bio" = NULL
    WHERE "bio" LIKE 'Practice address:%'
      AND ("address_line1" IS NULL OR "address_line1" = '')
  `)

  payload.logger.info('Added practitioner address line fields and moved practice address bio content.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    UPDATE "practitioners"
    SET "bio" = CONCAT('Practice address: ', CONCAT_WS(' ', "address_line1", "address_line2"))
    WHERE "address_line1" IS NOT NULL
      AND "address_line1" <> ''
      AND ("bio" IS NULL OR "bio" = '')
  `)

  await db.execute(`
    ALTER TABLE "practitioners"
      DROP COLUMN IF EXISTS "address_line2",
      DROP COLUMN IF EXISTS "address_line1"
  `)

  payload.logger.info('Rolled back practitioner address line fields.')
}
