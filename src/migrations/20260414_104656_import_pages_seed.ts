import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from '@payloadcms/db-postgres'

import pagesSeed from '../seeds/pages.json'
import {
  deletePagesBySlug,
  seedPages,
} from '../lib/seedPages'

async function ensurePageSeedEnums(
  db: MigrateUpArgs['db']
) {
  await db.execute(`
    DO $$
    DECLARE
      enum_name text;
    BEGIN
      FOREACH enum_name IN ARRAY ARRAY[
        'enum_pages_blocks_eftmra_training_detail_level_key',
        'enum__pages_v_blocks_eftmra_training_detail_level_key'
      ]
      LOOP
        IF EXISTS (
          SELECT 1 FROM pg_type WHERE typname = enum_name
        ) THEN
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'l12'
          );
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'l3'
          );
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'matrix'
          );
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'intro'
          );
        END IF;
      END LOOP;

      FOREACH enum_name IN ARRAY ARRAY[
        'enum_pages_blocks_eftmra_courses_courses_badge_tone',
        'enum__pages_v_blocks_eftmra_courses_courses_badge_tone',
        'enum_pages_blocks_eftmra_training_detail_badge_tone',
        'enum__pages_v_blocks_eftmra_training_detail_badge_tone',
        'enum_trainings_badge_tone'
      ]
      LOOP
        IF EXISTS (
          SELECT 1 FROM pg_type WHERE typname = enum_name
        ) THEN
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'amber'
          );
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'blue'
          );
        END IF;
      END LOOP;

      FOREACH enum_name IN ARRAY ARRAY[
        'enum_pages_blocks_eftmra_courses_courses_availability_tone',
        'enum__pages_v_blocks_eftmra_courses_courses_availability_tone',
        'enum_pages_blocks_eftmra_training_detail_availability_tone',
        'enum__pages_v_blocks_eftmra_training_detail_availability_tone',
        'enum_trainings_availability_tone'
      ]
      LOOP
        IF EXISTS (
          SELECT 1 FROM pg_type WHERE typname = enum_name
        ) THEN
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'low'
          );
          EXECUTE format(
            'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
            enum_name,
            'full'
          );
        END IF;
      END LOOP;
    END $$;
  `)
}

async function ensurePageSeedTables(
  db: MigrateUpArgs['db']
) {
  await db.execute(`
    ALTER TABLE IF EXISTS "pages_blocks_eftmra_courses_courses"
      ADD COLUMN IF NOT EXISTS "level_key" varchar,
      ADD COLUMN IF NOT EXISTS "level_label" varchar,
      ADD COLUMN IF NOT EXISTS "city_key" varchar,
      ADD COLUMN IF NOT EXISTS "city_label" varchar,
      ADD COLUMN IF NOT EXISTS "month_key" varchar,
      ADD COLUMN IF NOT EXISTS "month_label" varchar,
      ADD COLUMN IF NOT EXISTS "start_date" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "end_date" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "format" varchar,
      ADD COLUMN IF NOT EXISTS "date_text" varchar,
      ADD COLUMN IF NOT EXISTS "city_text" varchar,
      ADD COLUMN IF NOT EXISTS "schedule" varchar,
      ADD COLUMN IF NOT EXISTS "venue" varchar,
      ADD COLUMN IF NOT EXISTS "requirement" varchar,
      ADD COLUMN IF NOT EXISTS "trainer_name" varchar,
      ADD COLUMN IF NOT EXISTS "trainer_role" varchar,
      ADD COLUMN IF NOT EXISTS "trainer_image_id" integer,
      ADD COLUMN IF NOT EXISTS "trainer_image_alt" varchar,
      ADD COLUMN IF NOT EXISTS "trainer_bio" varchar,
      ADD COLUMN IF NOT EXISTS "availability" varchar,
      ADD COLUMN IF NOT EXISTS "price" varchar,
      ADD COLUMN IF NOT EXISTS "price_note" varchar,
      ADD COLUMN IF NOT EXISTS "cta_label" varchar,
      ADD COLUMN IF NOT EXISTS "cta_href" varchar;

    ALTER TABLE IF EXISTS "_pages_v_blocks_eftmra_courses_courses"
      ADD COLUMN IF NOT EXISTS "level_key" varchar,
      ADD COLUMN IF NOT EXISTS "level_label" varchar,
      ADD COLUMN IF NOT EXISTS "city_key" varchar,
      ADD COLUMN IF NOT EXISTS "city_label" varchar,
      ADD COLUMN IF NOT EXISTS "month_key" varchar,
      ADD COLUMN IF NOT EXISTS "month_label" varchar,
      ADD COLUMN IF NOT EXISTS "start_date" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "end_date" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "format" varchar,
      ADD COLUMN IF NOT EXISTS "date_text" varchar,
      ADD COLUMN IF NOT EXISTS "city_text" varchar,
      ADD COLUMN IF NOT EXISTS "schedule" varchar,
      ADD COLUMN IF NOT EXISTS "venue" varchar,
      ADD COLUMN IF NOT EXISTS "requirement" varchar,
      ADD COLUMN IF NOT EXISTS "trainer_name" varchar,
      ADD COLUMN IF NOT EXISTS "trainer_role" varchar,
      ADD COLUMN IF NOT EXISTS "trainer_image_id" integer,
      ADD COLUMN IF NOT EXISTS "trainer_image_alt" varchar,
      ADD COLUMN IF NOT EXISTS "trainer_bio" varchar,
      ADD COLUMN IF NOT EXISTS "availability" varchar,
      ADD COLUMN IF NOT EXISTS "price" varchar,
      ADD COLUMN IF NOT EXISTS "price_note" varchar,
      ADD COLUMN IF NOT EXISTS "cta_label" varchar,
      ADD COLUMN IF NOT EXISTS "cta_href" varchar;

    ALTER TABLE IF EXISTS "pages_blocks_eftmra_training_detail"
      ADD COLUMN IF NOT EXISTS "start_date" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "end_date" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "level_key" varchar,
      ADD COLUMN IF NOT EXISTS "badge_tone" varchar,
      ADD COLUMN IF NOT EXISTS "format" varchar,
      ADD COLUMN IF NOT EXISTS "availability_tone" varchar;

    ALTER TABLE IF EXISTS "_pages_v_blocks_eftmra_training_detail"
      ADD COLUMN IF NOT EXISTS "start_date" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "end_date" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "level_key" varchar,
      ADD COLUMN IF NOT EXISTS "badge_tone" varchar,
      ADD COLUMN IF NOT EXISTS "format" varchar,
      ADD COLUMN IF NOT EXISTS "availability_tone" varchar;
  `)
}

export async function up({
  db,
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  await ensurePageSeedEnums(db)
  await ensurePageSeedTables(db)

  await seedPages(pagesSeed as Record<string, unknown>[], {
    payload,
    req,
  })
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await deletePagesBySlug(
    pagesSeed.map((page) => page.slug),
    {
      db,
      payload,
      req,
    }
  )
}
