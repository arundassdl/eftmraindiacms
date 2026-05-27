import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

type TemplateAddressSeed = {
  ccEmail?: string
  replyToEmail?: string
  senderEmail: string
  senderName: string
  slug: string
  toEmail: string
}

const templateSeeds: TemplateAddressSeed[] = [
  {
    slug: 'simple-form-notification',
    toEmail: '{{adminEmail}}',
    replyToEmail: '{{submitterEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
  {
    slug: 'simple-form-confirmation',
    toEmail: '{{submitterEmail}}',
    replyToEmail: '{{adminEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
  {
    slug: 'practitioner-registration-confirmation',
    toEmail: '{{submitterEmail}}',
    ccEmail: '{{adminEmail}}',
    replyToEmail: '{{adminEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
  {
    slug: 'practitioner-contact-notification',
    toEmail: '{{practitionerEmail}}',
    ccEmail: '{{adminEmail}}',
    replyToEmail: '{{requesterEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
  {
    slug: 'practitioner-contact-confirmation',
    toEmail: '{{requesterEmail}}',
    replyToEmail: '{{adminEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
  {
    slug: 'trainer-contact-notification',
    toEmail: '{{trainerEmail}}',
    ccEmail: '{{adminEmail}}',
    replyToEmail: '{{requesterEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
  {
    slug: 'trainer-contact-confirmation',
    toEmail: '{{requesterEmail}}',
    replyToEmail: '{{adminEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
  {
    slug: 'training-registration-notification',
    toEmail: '{{adminEmail}}',
    replyToEmail: '{{requesterEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
  {
    slug: 'training-registration-confirmation',
    toEmail: '{{requesterEmail}}',
    ccEmail: '{{adminEmail}}',
    replyToEmail: '{{adminEmail}}',
    senderName: 'EFTMRA India',
    senderEmail: 'hello@eftmraindia.com',
  },
]

function sqlValue(value?: string) {
  return value ? `'${value.replace(/'/g, "''")}'` : 'NULL'
}

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
  for (const seed of templateSeeds) {
    await db.execute(`
      UPDATE "email_templates"
      SET
        "to_email" = COALESCE(NULLIF("to_email", ''), ${sqlValue(seed.toEmail)}),
        "cc_email" = COALESCE(NULLIF("cc_email", ''), ${sqlValue(seed.ccEmail)}),
        "reply_to_email" = COALESCE(NULLIF("reply_to_email", ''), ${sqlValue(seed.replyToEmail)}),
        "sender_name" = COALESCE(NULLIF("sender_name", ''), ${sqlValue(seed.senderName)}),
        "sender_email" = COALESCE(NULLIF("sender_email", ''), ${sqlValue(seed.senderEmail)})
      WHERE "slug" = ${sqlValue(seed.slug)}
    `)
  }

  payload.logger.info('Seeded email template address fields.')
}

export async function down({
  payload,
}: MigrateDownArgs): Promise<void> {
  payload.logger.info('No rollback required for email template address field seed.')
}
