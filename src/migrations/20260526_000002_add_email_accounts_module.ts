import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

async function ensureEmailAccountsSchema(db: MigrateUpArgs['db']) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "email_accounts" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "provider" varchar DEFAULT 'resend' NOT NULL,
      "auth_mode" varchar DEFAULT 'api-key' NOT NULL,
      "use_as_default" boolean DEFAULT false,
      "enabled" boolean DEFAULT true,
      "from_name" varchar,
      "from_email" varchar,
      "api_key" varchar,
      "username" varchar,
      "password" varchar,
      "smtp_host" varchar,
      "port" numeric,
      "secure" boolean,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "email_accounts_updated_at_idx" ON "email_accounts" USING btree ("updated_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "email_accounts_created_at_idx" ON "email_accounts" USING btree ("created_at")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "email_accounts_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_email_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("email_accounts_id")`)
}

async function ensureEmailTemplateFields(db: MigrateUpArgs['db']) {
  await db.execute(`
    ALTER TABLE IF EXISTS "email_templates"
      ADD COLUMN IF NOT EXISTS "to_email" varchar,
      ADD COLUMN IF NOT EXISTS "cc_email" varchar,
      ADD COLUMN IF NOT EXISTS "bcc_email" varchar,
      ADD COLUMN IF NOT EXISTS "reply_to_email" varchar,
      ADD COLUMN IF NOT EXISTS "sender_name" varchar,
      ADD COLUMN IF NOT EXISTS "sender_email" varchar
  `)
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
          ADD VALUE IF NOT EXISTS 'email-accounts';
      END IF;
    END $$;
  `)
}

async function migrateEmbeddedAccounts(db: MigrateUpArgs['db']) {
  await db.execute(`
    DO $$
    DECLARE
      has_email_account_enums boolean;
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'enum_email_accounts_provider'
      ) AND EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'enum_email_accounts_auth_mode'
      )
      INTO has_email_account_enums;

      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'email_settings_email_accounts'
      ) THEN
        IF has_email_account_enums THEN
          EXECUTE $insert$
            INSERT INTO "email_accounts"
              ("label", "provider", "auth_mode", "use_as_default", "enabled", "from_name", "from_email", "api_key", "username", "password", "smtp_host", "port", "secure")
            SELECT
              COALESCE("label", 'Email account'),
              (CASE WHEN "provider" = 'custom-smtp' THEN 'nodemailer' ELSE COALESCE("provider", 'resend') END)::"enum_email_accounts_provider",
              (CASE WHEN "provider" IN ('gmail', 'yahoo', 'outlook', 'yandex', 'custom-smtp') OR "smtp_host" IS NOT NULL THEN 'smtp' ELSE 'api-key' END)::"enum_email_accounts_auth_mode",
              COALESCE("use_as_default", false),
              COALESCE("enabled", true),
              "from_name",
              "from_email",
              "api_key",
              "username",
              "password",
              "smtp_host",
              "port",
              "secure"
            FROM "email_settings_email_accounts"
            WHERE NOT EXISTS (
              SELECT 1 FROM "email_accounts"
              WHERE "email_accounts"."label" = COALESCE("email_settings_email_accounts"."label", 'Email account')
            )
          $insert$;
        ELSE
          INSERT INTO "email_accounts"
            ("label", "provider", "auth_mode", "use_as_default", "enabled", "from_name", "from_email", "api_key", "username", "password", "smtp_host", "port", "secure")
          SELECT
            COALESCE("label", 'Email account'),
            CASE WHEN "provider" = 'custom-smtp' THEN 'nodemailer' ELSE COALESCE("provider", 'resend') END,
            CASE WHEN "provider" IN ('gmail', 'yahoo', 'outlook', 'yandex', 'custom-smtp') OR "smtp_host" IS NOT NULL THEN 'smtp' ELSE 'api-key' END,
            COALESCE("use_as_default", false),
            COALESCE("enabled", true),
            "from_name",
            "from_email",
            "api_key",
            "username",
            "password",
            "smtp_host",
            "port",
            "secure"
          FROM "email_settings_email_accounts"
          WHERE NOT EXISTS (
            SELECT 1 FROM "email_accounts"
            WHERE "email_accounts"."label" = COALESCE("email_settings_email_accounts"."label", 'Email account')
          );
        END IF;
      END IF;
    END $$;
  `)
}

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await ensureEmailAccountsSchema(db)
  await ensureEmailTemplateFields(db)
  await ensureRoleEnum(db)
  await migrateEmbeddedAccounts(db)

  payload.logger.info('Added email accounts module and expanded email template fields.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "role_module_visibility_role_permissions"
    WHERE "module"::text = 'email-accounts'
  `)
  await db.execute(`DROP TABLE IF EXISTS "email_accounts"`)

  payload.logger.info('Rolled back email accounts module.')
}
