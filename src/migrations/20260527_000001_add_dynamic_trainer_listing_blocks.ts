import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

async function ensureTrainerListingBlockTables(db: MigrateUpArgs['db']) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "pages_blocks_eftmra_trainer_listing" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "eyebrow" varchar DEFAULT 'Meet the Trainers',
      "title" varchar NOT NULL,
      "description" varchar,
      "show_only_enabled" boolean DEFAULT true,
      "limit" numeric DEFAULT 12,
      "sort" varchar DEFAULT 'displayOrder',
      "block_name" varchar
    );

    ALTER TABLE IF EXISTS "pages_blocks_eftmra_trainer_listing"
      ADD COLUMN IF NOT EXISTS "_order" integer,
      ADD COLUMN IF NOT EXISTS "_parent_id" integer,
      ADD COLUMN IF NOT EXISTS "_path" text,
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar DEFAULT 'Meet the Trainers',
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar,
      ADD COLUMN IF NOT EXISTS "show_only_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "limit" numeric DEFAULT 12,
      ADD COLUMN IF NOT EXISTS "sort" varchar DEFAULT 'displayOrder',
      ADD COLUMN IF NOT EXISTS "block_name" varchar;

    CREATE INDEX IF NOT EXISTS "pages_blocks_eftmra_trainer_listing_order_idx"
      ON "pages_blocks_eftmra_trainer_listing" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_eftmra_trainer_listing_parent_id_idx"
      ON "pages_blocks_eftmra_trainer_listing" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_eftmra_trainer_listing_path_idx"
      ON "pages_blocks_eftmra_trainer_listing" USING btree ("_path");

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_eftmra_trainer_listing" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_uuid" varchar,
      "eyebrow" varchar DEFAULT 'Meet the Trainers',
      "title" varchar NOT NULL,
      "description" varchar,
      "show_only_enabled" boolean DEFAULT true,
      "limit" numeric DEFAULT 12,
      "sort" varchar DEFAULT 'displayOrder',
      "block_name" varchar
    );

    ALTER TABLE IF EXISTS "_pages_v_blocks_eftmra_trainer_listing"
      ADD COLUMN IF NOT EXISTS "_order" integer,
      ADD COLUMN IF NOT EXISTS "_parent_id" integer,
      ADD COLUMN IF NOT EXISTS "_path" text,
      ADD COLUMN IF NOT EXISTS "_uuid" varchar,
      ADD COLUMN IF NOT EXISTS "eyebrow" varchar DEFAULT 'Meet the Trainers',
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar,
      ADD COLUMN IF NOT EXISTS "show_only_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "limit" numeric DEFAULT 12,
      ADD COLUMN IF NOT EXISTS "sort" varchar DEFAULT 'displayOrder',
      ADD COLUMN IF NOT EXISTS "block_name" varchar;

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_eftmra_trainer_listing_order_idx"
      ON "_pages_v_blocks_eftmra_trainer_listing" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_eftmra_trainer_listing_parent_id_idx"
      ON "_pages_v_blocks_eftmra_trainer_listing" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_eftmra_trainer_listing_path_idx"
      ON "_pages_v_blocks_eftmra_trainer_listing" USING btree ("_path");
  `)
}

async function ensureCertificationDynamicTrainerColumns(db: MigrateUpArgs['db']) {
  await db.execute(`
    ALTER TABLE IF EXISTS "pages_blocks_eftmra_certification"
      ADD COLUMN IF NOT EXISTS "use_dynamic_trainer_listing" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "show_only_enabled_trainers" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "trainer_limit" numeric DEFAULT 12,
      ADD COLUMN IF NOT EXISTS "trainer_sort" varchar DEFAULT 'displayOrder';

    ALTER TABLE IF EXISTS "_pages_v_blocks_eftmra_certification"
      ADD COLUMN IF NOT EXISTS "use_dynamic_trainer_listing" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "show_only_enabled_trainers" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "trainer_limit" numeric DEFAULT 12,
      ADD COLUMN IF NOT EXISTS "trainer_sort" varchar DEFAULT 'displayOrder';
  `)
}

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await ensureTrainerListingBlockTables(db)
  await ensureCertificationDynamicTrainerColumns(db)

  payload.logger.info(
    'Ensured dynamic trainer listing page block tables and certification trainer listing fields.'
  )
}

export async function down({
  db,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE IF EXISTS "pages_blocks_eftmra_certification"
      DROP COLUMN IF EXISTS "use_dynamic_trainer_listing",
      DROP COLUMN IF EXISTS "show_only_enabled_trainers",
      DROP COLUMN IF EXISTS "trainer_limit",
      DROP COLUMN IF EXISTS "trainer_sort";

    ALTER TABLE IF EXISTS "_pages_v_blocks_eftmra_certification"
      DROP COLUMN IF EXISTS "use_dynamic_trainer_listing",
      DROP COLUMN IF EXISTS "show_only_enabled_trainers",
      DROP COLUMN IF EXISTS "trainer_limit",
      DROP COLUMN IF EXISTS "trainer_sort";

    DROP TABLE IF EXISTS "_pages_v_blocks_eftmra_trainer_listing";
    DROP TABLE IF EXISTS "pages_blocks_eftmra_trainer_listing";
  `)
}
