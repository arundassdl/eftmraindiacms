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
          AND column_name = 'address_line_1'
      ) THEN
        UPDATE "practitioners"
        SET "address_line1" = "address_line_1"
        WHERE "address_line_1" IS NOT NULL
          AND "address_line_1" <> ''
          AND ("address_line1" IS NULL OR "address_line1" = '');
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'practitioners'
          AND column_name = 'address_line_2'
      ) THEN
        UPDATE "practitioners"
        SET "address_line2" = "address_line_2"
        WHERE "address_line_2" IS NOT NULL
          AND "address_line_2" <> ''
          AND ("address_line2" IS NULL OR "address_line2" = '');
      END IF;

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

  await db.execute(`
    ALTER TABLE "practitioners"
      DROP COLUMN IF EXISTS "address_line_2",
      DROP COLUMN IF EXISTS "address_line_1"
  `)

  payload.logger.info('Fixed practitioner address line column names.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE "practitioners"
      ADD COLUMN IF NOT EXISTS "address_line_1" varchar,
      ADD COLUMN IF NOT EXISTS "address_line_2" varchar
  `)

  await db.execute(`
    UPDATE "practitioners"
    SET
      "address_line_1" = "address_line1",
      "address_line_2" = "address_line2"
    WHERE ("address_line1" IS NOT NULL AND "address_line1" <> '')
      OR ("address_line2" IS NOT NULL AND "address_line2" <> '')
  `)

  payload.logger.info('Rolled back practitioner address line column name repair.')
}

