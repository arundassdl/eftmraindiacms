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
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'practitioners'
          AND column_name = 'address'
      ) THEN
        UPDATE "practitioners"
        SET "address_line1" = "address"
        WHERE "address" IS NOT NULL
          AND "address" <> ''
          AND ("address_line1" IS NULL OR "address_line1" = '');

        ALTER TABLE "practitioners"
          DROP COLUMN IF EXISTS "address";
      END IF;
    END
    $$;
  `)

  await db.execute(`
    UPDATE "practitioners"
    SET
      "address_line1" = regexp_replace("bio", '^Practice address:\\s*', ''),
      "bio" = NULL
    WHERE "bio" LIKE 'Practice address:%'
      AND ("address_line1" IS NULL OR "address_line1" = '')
  `)

  payload.logger.info('Ensured practitioner address is split into address line fields.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE "practitioners"
      ADD COLUMN IF NOT EXISTS "address" varchar
  `)

  await db.execute(`
    UPDATE "practitioners"
    SET "address" = CONCAT_WS(' ', "address_line1", "address_line2")
    WHERE ("address" IS NULL OR "address" = '')
      AND (
        ("address_line1" IS NOT NULL AND "address_line1" <> '')
        OR ("address_line2" IS NOT NULL AND "address_line2" <> '')
      )
  `)

  await db.execute(`
    ALTER TABLE "practitioners"
      DROP COLUMN IF EXISTS "address_line2",
      DROP COLUMN IF EXISTS "address_line1"
  `)

  payload.logger.info('Rolled back split practitioner address line fields.')
}
