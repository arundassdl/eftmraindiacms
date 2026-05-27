import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

async function ensureTrainersSchema(db: MigrateUpArgs['db']) {
  await db.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'enum_trainers_social_links_platform'
      ) THEN
        CREATE TYPE "enum_trainers_social_links_platform" AS ENUM (
          'linkedin',
          'facebook',
          'instagram',
          'youtube'
        );
      END IF;
    END $$;
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "trainers" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "tagline" varchar NOT NULL,
      "image_id" integer,
      "image_alt" varchar,
      "about_label" varchar DEFAULT 'About',
      "about_title" varchar NOT NULL,
      "philosophy" varchar,
      "email" varchar DEFAULT 'hello@eftmraindia.com',
      "meta_title" varchar,
      "meta_description" varchar,
      "meta_image_id" integer,
      "status" varchar DEFAULT 'published' NOT NULL,
      "display_order" numeric DEFAULT 0,
      "show_on_homepage" boolean DEFAULT true,
      "slug" varchar NOT NULL,
      "role" varchar NOT NULL,
      "site_id" integer NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "trainers_about_paragraphs" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "content" varchar NOT NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "trainers_credentials" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "trainers_specializations" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "trainers_social_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "platform" "enum_trainers_social_links_platform" NOT NULL,
      "href" varchar NOT NULL
    )
  `)

  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "trainers_slug_idx" ON "trainers" USING btree ("slug")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_image_idx" ON "trainers" USING btree ("image_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_meta_meta_image_idx" ON "trainers" USING btree ("meta_image_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_site_idx" ON "trainers" USING btree ("site_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_updated_at_idx" ON "trainers" USING btree ("updated_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_created_at_idx" ON "trainers" USING btree ("created_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_about_paragraphs_order_idx" ON "trainers_about_paragraphs" USING btree ("_order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_about_paragraphs_parent_id_idx" ON "trainers_about_paragraphs" USING btree ("_parent_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_credentials_order_idx" ON "trainers_credentials" USING btree ("_order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_credentials_parent_id_idx" ON "trainers_credentials" USING btree ("_parent_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_specializations_order_idx" ON "trainers_specializations" USING btree ("_order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_specializations_parent_id_idx" ON "trainers_specializations" USING btree ("_parent_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_social_links_order_idx" ON "trainers_social_links" USING btree ("_order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainers_social_links_parent_id_idx" ON "trainers_social_links" USING btree ("_parent_id")`)

  await db.execute(`
    ALTER TABLE "training_reviews"
      ADD COLUMN IF NOT EXISTS "trainer_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "training_reviews_trainer_idx" ON "training_reviews" USING btree ("trainer_id")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "trainers_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_trainers_id_idx" ON "payload_locked_documents_rels" USING btree ("trainers_id")`)
}

async function ensureTrainerRoleEnum(db: MigrateUpArgs['db']) {
  await db.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'enum_role_module_visibility_role_permissions_module'
      ) THEN
        ALTER TYPE "enum_role_module_visibility_role_permissions_module"
          ADD VALUE IF NOT EXISTS 'trainers';
      END IF;
    END $$;
  `)
}

async function backfillTrainerRecords(db: MigrateUpArgs['db']) {
  await db.execute(`
    INSERT INTO "trainers"
      (
        "name",
        "tagline",
        "image_id",
        "image_alt",
        "about_label",
        "about_title",
        "philosophy",
        "email",
        "status",
        "display_order",
        "show_on_homepage",
        "slug",
        "role",
        "site_id",
        "updated_at",
        "created_at"
      )
    SELECT DISTINCT ON (
      lower(regexp_replace(regexp_replace("trainings"."trainer_name", '^Dr\\.?\\s+', '', 'i'), '[^a-z0-9]+', ' ', 'gi')),
      "trainings"."site_id"
    )
      "trainings"."trainer_name",
      COALESCE(
        NULLIF("trainings"."trainer_bio", ''),
        "trainings"."trainer_name" || ' is part of the EFTMRA India trainer faculty.'
      ),
      "trainings"."trainer_image_id",
      "trainings"."trainer_image_alt",
      'About ' || split_part(regexp_replace("trainings"."trainer_name", '^Dr\\.?\\s+', '', 'i'), ' ', 1),
      'Certified EFTMRA Training with Heart',
      NULLIF("trainings"."trainer_bio", ''),
      'hello@eftmraindia.com',
      'published',
      100,
      false,
      regexp_replace(
        regexp_replace(
          lower(trim("trainings"."trainer_name")),
          '&',
          'and',
          'g'
        ),
        '[^a-z0-9]+',
        '-',
        'g'
      ),
      COALESCE(NULLIF("trainings"."trainer_role", ''), 'Trainer · EFTMRA India'),
      "trainings"."site_id",
      now(),
      now()
    FROM "trainings"
    WHERE "trainings"."trainer_name" IS NOT NULL
      AND trim("trainings"."trainer_name") <> ''
      AND "trainings"."site_id" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "trainers"
        WHERE "trainers"."slug" = regexp_replace(
          regexp_replace(
            lower(trim("trainings"."trainer_name")),
            '&',
            'and',
            'g'
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        )
      )
    ORDER BY
      lower(regexp_replace(regexp_replace("trainings"."trainer_name", '^Dr\\.?\\s+', '', 'i'), '[^a-z0-9]+', ' ', 'gi')),
      "trainings"."site_id",
      "trainings"."start_date" DESC NULLS LAST
  `)

  await db.execute(`
    UPDATE "training_reviews"
    SET "trainer_id" = "trainers"."id"
    FROM "trainings"
    JOIN "trainers"
      ON "trainers"."site_id" = "trainings"."site_id"
      AND lower(regexp_replace(regexp_replace("trainers"."name", '^Dr\\.?\\s+', '', 'i'), '[^a-z0-9]+', ' ', 'gi')) =
        lower(regexp_replace(regexp_replace("trainings"."trainer_name", '^Dr\\.?\\s+', '', 'i'), '[^a-z0-9]+', ' ', 'gi'))
    WHERE "training_reviews"."training_id" = "trainings"."id"
      AND "training_reviews"."trainer_id" IS NULL
  `)
}

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await ensureTrainersSchema(db)
  await ensureTrainerRoleEnum(db)
  await backfillTrainerRecords(db)

  payload.logger.info(
    'Ensured trainers schema, role permissions, and training review trainer links.'
  )
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`ALTER TABLE "training_reviews" DROP COLUMN IF EXISTS "trainer_id"`)
  await db.execute(`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "trainers_id"`)

  await db.execute(`DROP TABLE IF EXISTS "trainers_social_links"`)
  await db.execute(`DROP TABLE IF EXISTS "trainers_specializations"`)
  await db.execute(`DROP TABLE IF EXISTS "trainers_credentials"`)
  await db.execute(`DROP TABLE IF EXISTS "trainers_about_paragraphs"`)
  await db.execute(`DROP TABLE IF EXISTS "trainers"`)
  await db.execute(`DROP TYPE IF EXISTS "enum_trainers_social_links_platform"`)

  await db.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'role_module_visibility_role_permissions'
      ) THEN
        DELETE FROM "role_module_visibility_role_permissions"
        WHERE "module"::text = 'trainers';
      END IF;
    END $$;
  `)

  payload.logger.info(
    'Rolled back trainer schema and training review trainer links.'
  )
}
