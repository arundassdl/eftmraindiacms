import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY || ''
  const fromName = process.env.EMAIL_FROM_NAME || 'EFTMRA India'
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'hello@eftmraindia.com'

  await db.execute(`
    INSERT INTO "email_accounts"
      ("label", "provider", "auth_mode", "use_as_default", "enabled", "from_name", "from_email", "api_key")
    SELECT
      'Default Resend Account',
      'resend',
      'api-key',
      true,
      true,
      '${fromName.replace(/'/g, "''")}',
      '${fromEmail.replace(/'/g, "''")}',
      ${resendApiKey ? `'${resendApiKey.replace(/'/g, "''")}'` : 'NULL'}
    WHERE NOT EXISTS (
      SELECT 1 FROM "email_accounts"
      WHERE "provider" = 'resend'
        AND ("use_as_default" = true OR "label" = 'Default Resend Account')
    )
  `)

  payload.logger.info('Seeded default Resend email account if missing.')
}

export async function down({
  db,
  payload,
}: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DELETE FROM "email_accounts"
    WHERE "label" = 'Default Resend Account'
      AND "provider" = 'resend'
  `)

  payload.logger.info('Rolled back default Resend email account seed.')
}
