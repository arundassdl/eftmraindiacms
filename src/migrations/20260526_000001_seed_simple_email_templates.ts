import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE IF EXISTS "email_settings"
      ADD COLUMN IF NOT EXISTS "resend_api_key" varchar
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "email_settings_email_accounts" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "provider" varchar DEFAULT 'resend' NOT NULL,
      "use_as_default" boolean DEFAULT false,
      "enabled" boolean DEFAULT true,
      "from_name" varchar,
      "from_email" varchar,
      "api_key" varchar,
      "username" varchar,
      "password" varchar,
      "smtp_host" varchar,
      "port" numeric,
      "secure" boolean
    )
  `)
  await db.execute(`CREATE INDEX IF NOT EXISTS "email_settings_email_accounts_order_idx" ON "email_settings_email_accounts" USING btree ("_order")`)
  await db.execute(`CREATE INDEX IF NOT EXISTS "email_settings_email_accounts_parent_id_idx" ON "email_settings_email_accounts" USING btree ("_parent_id")`)

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
        'Practitioner registration confirmation',
        'practitioner-registration-confirmation',
        'confirmation',
        true,
        'Sent to a practitioner after their directory registration is received.',
        'formName, submitterName, submitterEmail',
        'We received your practitioner registration',
        '<p>Hi {{submitterName}},</p><p>Thank you for your practitioner registration. Our team will review your details and contact you with the next steps.</p>',
        'Hi {{submitterName}},\\n\\nThank you for your practitioner registration. Our team will review your details and contact you with the next steps.'
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
      )
    ON CONFLICT ("slug") DO NOTHING
  `)

  payload.logger.info('Seeded simple email templates.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "email_templates"
    WHERE "slug" IN (
      'simple-form-notification',
      'simple-form-confirmation',
      'practitioner-registration-confirmation',
      'trainer-contact-confirmation'
    )
  `)
  await db.execute(`DROP TABLE IF EXISTS "email_settings_email_accounts"`)

  payload.logger.info('Rolled back simple email templates.')
}
