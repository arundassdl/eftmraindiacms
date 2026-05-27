import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

async function ensureSchema(db: MigrateUpArgs['db']) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "email_templates" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "template_type" varchar DEFAULT 'notification' NOT NULL,
      "enabled" boolean DEFAULT true,
      "description" varchar,
      "available_variables" varchar,
      "subject" varchar NOT NULL,
      "preheader" varchar,
      "html" varchar NOT NULL,
      "text" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `)

  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "email_templates_slug_idx" ON "email_templates" USING btree ("slug")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "email_templates_created_at_idx" ON "email_templates" USING btree ("created_at")`)

  await db.execute(`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "email_templates_id" integer
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_email_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("email_templates_id")`)
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
          ADD VALUE IF NOT EXISTS 'email-templates';
      END IF;
    END $$;
  `)
}

async function seedDefaultTemplates(db: MigrateUpArgs['db']) {
  await db.execute(`
    INSERT INTO "email_templates"
      ("name", "slug", "template_type", "enabled", "description", "available_variables", "subject", "html", "text")
    VALUES
      (
        'Simple form notification',
        'simple-form-notification',
        'notification',
        true,
        'Shared admin notification template used by all public website forms.',
        'formName, submitterName, submitterEmail, submitterPhone, source, message',
        'New {{formName}} submission',
        '<p>A new {{formName}} form was submitted.</p><p><strong>Name:</strong> {{submitterName}}<br /><strong>Email:</strong> {{submitterEmail}}<br /><strong>Phone:</strong> {{submitterPhone}}<br /><strong>Source:</strong> {{source}}</p><p style="white-space: pre-line;">{{message}}</p>',
        'A new {{formName}} form was submitted.\\n\\nName: {{submitterName}}\\nEmail: {{submitterEmail}}\\nPhone: {{submitterPhone}}\\nSource: {{source}}\\n\\n{{message}}'
      ),
      (
        'Simple form confirmation',
        'simple-form-confirmation',
        'confirmation',
        true,
        'Shared submitter confirmation template used by public website forms that collect an email address.',
        'formName, submitterName',
        'We received your {{formName}} submission',
        '<p>Hi {{submitterName}},</p><p>Thank you for your {{formName}} submission. Our team will review it and contact you with the next steps.</p>',
        'Hi {{submitterName}},\\n\\nThank you for your {{formName}} submission. Our team will review it and contact you with the next steps.'
      ),
      (
        'Practitioner contact notification',
        'practitioner-contact-notification',
        'notification',
        true,
        'Sent to the practitioner or EFTMRA team when a visitor requests practitioner contact details.',
        'practitionerName, requesterName, requesterEmail, requesterPhone',
        'New practitioner contact request: {{practitionerName}}',
        '<p>New contact request for {{practitionerName}}.</p><ul><li><strong>Name:</strong> {{requesterName}}</li><li><strong>Email:</strong> {{requesterEmail}}</li><li><strong>Phone:</strong> {{requesterPhone}}</li></ul><p>Please contact the requester directly.</p>',
        'New contact request for {{practitionerName}}.\\n\\nName: {{requesterName}}\\nEmail: {{requesterEmail}}\\nPhone: {{requesterPhone}}\\n\\nPlease contact the requester directly.'
      ),
      (
        'Practitioner contact confirmation',
        'practitioner-contact-confirmation',
        'confirmation',
        true,
        'Sent to the visitor with practitioner contact details.',
        'practitionerName, requesterName, practitionerEmail, practitionerPhone',
        'Contact details for {{practitionerName}}',
        '<p>Thank you for contacting {{practitionerName}}.</p><p>Practitioner contact details:</p><ul><li><strong>Email:</strong> {{practitionerEmail}}</li><li><strong>Phone:</strong> {{practitionerPhone}}</li></ul>',
        'Thank you for contacting {{practitionerName}}.\\n\\nPractitioner contact details:\\nEmail: {{practitionerEmail}}\\nPhone: {{practitionerPhone}}'
      ),
      (
        'Trainer contact notification',
        'trainer-contact-notification',
        'notification',
        true,
        'Sent to the trainer or EFTMRA team when a visitor contacts a trainer.',
        'trainerName, requesterName, requesterEmail, requesterPhone, message',
        'New trainer contact request: {{trainerName}}',
        '<p>New contact request for {{trainerName}}.</p><ul><li><strong>Name:</strong> {{requesterName}}</li><li><strong>Email:</strong> {{requesterEmail}}</li><li><strong>Phone:</strong> {{requesterPhone}}</li></ul><p style="white-space: pre-line;">{{message}}</p>',
        'New contact request for {{trainerName}}.\\n\\nName: {{requesterName}}\\nEmail: {{requesterEmail}}\\nPhone: {{requesterPhone}}\\n\\n{{message}}'
      ),
      (
        'Trainer contact confirmation',
        'trainer-contact-confirmation',
        'confirmation',
        true,
        'Sent to the visitor with trainer contact details.',
        'trainerName, trainerEmail, submitterName',
        'Contact details for {{trainerName}}',
        '<p>Thank you for contacting {{trainerName}}.</p><p>Trainer contact details:</p><ul><li><strong>Email:</strong> {{trainerEmail}}</li></ul>',
        'Thank you for contacting {{trainerName}}.\\n\\nTrainer contact details:\\nEmail: {{trainerEmail}}'
      ),
      (
        'Training registration notification',
        'training-registration-notification',
        'notification',
        true,
        'Sent to the EFTMRA team when a visitor registers for a training.',
        'trainingTitle, trainingSlug, requesterName, requesterEmail, requesterPhone, city, background, source, notes',
        'New training registration: {{trainingTitle}}',
        '<p>New registration for {{trainingTitle}}.</p><ul><li><strong>Name:</strong> {{requesterName}}</li><li><strong>Email:</strong> {{requesterEmail}}</li><li><strong>Phone:</strong> {{requesterPhone}}</li><li><strong>City:</strong> {{city}}</li><li><strong>Background:</strong> {{background}}</li><li><strong>Source:</strong> {{source}}</li></ul><p style="white-space: pre-line;">{{notes}}</p>',
        'New registration for {{trainingTitle}}.\\n\\nName: {{requesterName}}\\nEmail: {{requesterEmail}}\\nPhone: {{requesterPhone}}\\nCity: {{city}}\\nBackground: {{background}}\\nSource: {{source}}\\n\\n{{notes}}'
      ),
      (
        'Training registration confirmation',
        'training-registration-confirmation',
        'confirmation',
        true,
        'Sent to the visitor after a training registration is received.',
        'trainingTitle, requesterName',
        'We received your registration for {{trainingTitle}}',
        '<p>Hi {{requesterName}},</p><p>Thank you for registering for {{trainingTitle}}. Our team will review your details and contact you with the next steps.</p>',
        'Hi {{requesterName}},\\n\\nThank you for registering for {{trainingTitle}}. Our team will review your details and contact you with the next steps.'
      )
    ON CONFLICT ("slug") DO NOTHING
  `)
}

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await ensureSchema(db)
  await ensureRoleEnum(db)
  await seedDefaultTemplates(db)

  payload.logger.info('Added email templates collection and defaults.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "role_module_visibility_role_permissions"
    WHERE "module"::text = 'email-templates'
  `)
  await db.execute(`DROP TABLE IF EXISTS "email_templates"`)

  payload.logger.info('Rolled back email templates collection.')
}
