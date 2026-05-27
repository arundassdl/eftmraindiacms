import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

async function ensureSchema(db: MigrateUpArgs['db']) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "trainer_contacts" (
      "id" serial PRIMARY KEY NOT NULL,
      "status" varchar DEFAULT 'new' NOT NULL,
      "full_name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "phone" varchar NOT NULL,
      "message" varchar NOT NULL,
      "agree" boolean NOT NULL,
      "trainer_name" varchar NOT NULL,
      "trainer_email" varchar,
      "trainer_id" integer NOT NULL,
      "site_slug" varchar,
      "submitted_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS "trainer_contacts_trainer_idx" ON "trainer_contacts" USING btree ("trainer_id")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainer_contacts_submitted_at_idx" ON "trainer_contacts" USING btree ("submitted_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainer_contacts_updated_at_idx" ON "trainer_contacts" USING btree ("updated_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "trainer_contacts_created_at_idx" ON "trainer_contacts" USING btree ("created_at")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "trainer_contacts_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_trainer_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("trainer_contacts_id")`)
}

async function ensureRoleEnum(db: MigrateUpArgs['db']) {
  await db.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'enum_role_module_visibility_role_permissions_module'
      ) THEN
        ALTER TYPE "enum_role_module_visibility_role_permissions_module"
          ADD VALUE IF NOT EXISTS 'trainer-contacts';
      END IF;
    END $$;
  `)
}

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await ensureSchema(db)
  await ensureRoleEnum(db)

  payload.logger.info('Added trainer contacts collection schema.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "role_module_visibility_role_permissions"
    WHERE "module"::text = 'trainer-contacts'
  `)
  await db.execute(`DROP TABLE IF EXISTS "trainer_contacts"`)

  payload.logger.info('Rolled back trainer contacts collection schema.')
}
