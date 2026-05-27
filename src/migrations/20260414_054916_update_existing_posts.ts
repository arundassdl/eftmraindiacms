import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await db.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pages'
          AND column_name = 'title'
      )
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pages'
          AND column_name = 'slug'
      )
      THEN
        UPDATE "pages"
        SET "slug" = lower(
          regexp_replace(trim("title"), '\\s+', '-', 'g')
        )
        WHERE "title" IS NOT NULL
          AND ("slug" IS NULL OR "slug" = '');
      END IF;
    END $$;
  `)

  payload.logger.info('Updated existing page slugs where missing.')
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Slugs derived from existing page titles are intentionally not reverted.
}
