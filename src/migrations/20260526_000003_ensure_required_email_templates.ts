import type {
  MigrateDownArgs,
  MigrateUpArgs,
} from '@payloadcms/db-postgres'

export async function up({
  db,
  payload,
}: MigrateUpArgs): Promise<void> {
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

  payload.logger.info('Ensured required email templates exist.')
}

export async function down({
  payload,
}: MigrateDownArgs): Promise<void> {
  payload.logger.info('No rollback required for required email template assurance.')
}
