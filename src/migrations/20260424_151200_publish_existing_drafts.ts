import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
    DO $$
    BEGIN
      IF to_regclass('public.posts') IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = '_status'
        )
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'status'
        )
      THEN
        UPDATE "posts" SET "_status" = 'published' WHERE "status" = 'published';
      END IF;

      IF to_regclass('public.testimonials') IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = '_status'
        )
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'status'
        )
      THEN
        UPDATE "testimonials" SET "_status" = 'published' WHERE "status" = 'published';
      END IF;

      IF to_regclass('public.pages') IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'pages' AND column_name = '_status'
        )
      THEN
        UPDATE "pages" SET "_status" = 'published';
      END IF;
    END $$;
  `)
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // This migration applies a one-time publication fix for existing content.
}
