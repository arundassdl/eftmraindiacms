import type { CollectionConfig } from "payload";

import { sendCmsEmail } from "../email/send";
import { buildTemplateEmailMessage, renderEmailTemplate } from "../email/templates";

function getPractitionerId(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "number" || typeof id === "string" ? id : null;
  }

  return null;
}

function isSeedImport(req: any) {
  return req.context?.seedImport === true;
}

type EmailSettings = {
  enabled?: boolean | null;
  fromName?: string | null;
  fromEmail?: string | null;
  eftmraIndiaEmail?: string | null;
  practitionerNotificationSubject?: string | null;
  requesterConfirmationSubject?: string | null;
  practitionerIntro?: string | null;
  resendApiKey?: string | null;
  requesterIntro?: string | null;
};

export const PractitionerContacts: CollectionConfig = {
  slug: "practitioner-contacts",
  labels: {
    singular: "Practitioner Contact",
    plural: "Practitioner Contacts",
  },
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "phone", "practitionerName", "submittedAt", "status"],
    group: "Practitioners",
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return;
        if (isSeedImport(req)) return;

        const practitionerId = getPractitionerId(doc.practitioner);
        if (!practitionerId) return;

        const practitioner = await req.payload.findByID({
          collection: "practitioners",
          id: practitionerId,
          depth: 0,
          overrideAccess: true,
          req,
        });

        const practitionerName = practitioner?.name || doc.practitionerName || "EFTMRA practitioner";
        const practitionerEmail = practitioner?.email || "";
        const practitionerPhone = practitioner?.phone || practitioner?.whatsapp || "";
        const requesterName = doc.fullName || "";
        const requesterEmail = doc.email || "";
        const requesterPhone = doc.phone || "";
        const settings = (await req.payload
          .findGlobal({
            slug: "email-settings",
            depth: 0,
            overrideAccess: true,
            req,
          })
          .catch(() => null)) as EmailSettings | null;
        const emailEnabled = settings?.enabled !== false;
        const eftmraEmail =
          settings?.eftmraIndiaEmail || process.env.EFTMRA_INDIA_EMAIL || process.env.CMS_ADMIN_EMAIL || "hello@eftmraindia.com";
        const fromEmail = settings?.fromEmail || process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";
        const fromName = settings?.fromName || process.env.EMAIL_FROM_NAME || "EFTMRA India";
        const from = `${fromName} <${fromEmail}>`;
        const templateVariables = {
          adminEmail: eftmraEmail,
          formName: "Practitioner contact",
          submitterName: requesterName,
          submitterEmail: requesterEmail,
          submitterPhone: requesterPhone,
          source: practitionerName,
          message: "Please contact the requester directly.",
          practitionerName,
          requesterName,
          requesterEmail,
          requesterPhone,
          practitionerEmail,
          practitionerPhone: practitionerPhone || "Not provided",
        };

        if (!emailEnabled) {
          req.payload.logger.info("Practitioner contact emails are disabled in Email Settings.");
          return;
        }

        const practitionerTemplate = await renderEmailTemplate({
          req,
          slug: "practitioner-contact-notification",
          variables: templateVariables,
          fallback: {
            subject: settings?.practitionerNotificationSubject || "New {{formName}} submission",
            text: [
              settings?.practitionerIntro || "A new {{formName}} form was submitted.",
              "",
              "Name: {{submitterName}}",
              "Email: {{submitterEmail}}",
              "Phone: {{submitterPhone}}",
              "Source: {{source}}",
              "",
              "{{message}}",
            ].join("\n"),
            html: `
          <p>${settings?.practitionerIntro || "A new {{formName}} form was submitted."}</p>
          <p><strong>Name:</strong> {{submitterName}}<br /><strong>Email:</strong> {{submitterEmail}}<br /><strong>Phone:</strong> {{submitterPhone}}<br /><strong>Source:</strong> {{source}}</p>
          <p style="white-space: pre-line;">{{message}}</p>
        `,
          },
        });
        const requesterTemplate = await renderEmailTemplate({
          req,
          slug: "practitioner-contact-confirmation",
          variables: templateVariables,
          fallback: {
            subject: settings?.requesterConfirmationSubject || "Contact details for {{practitionerName}}",
            text: [
              settings?.requesterIntro || "Thank you for contacting {{practitionerName}}.",
              "",
              "Practitioner contact details:",
              "Email: {{practitionerEmail}}",
              "Phone: {{practitionerPhone}}",
            ].join("\n"),
            html: `
          <p>${settings?.requesterIntro || "Thank you for contacting {{practitionerName}}."}</p>
          <p>Practitioner contact details:</p>
          <ul>
            <li><strong>Email:</strong> {{practitionerEmail}}</li>
            <li><strong>Phone:</strong> {{practitionerPhone}}</li>
          </ul>
        `,
          },
        });

        try {
          await sendCmsEmail({
            req,
            settings,
            message: buildTemplateEmailMessage(practitionerTemplate, {
              to: practitionerEmail || eftmraEmail,
              cc: practitionerEmail ? eftmraEmail : undefined,
              from,
              replyTo: requesterEmail,
              subject: practitionerTemplate.subject,
              text: practitionerTemplate.text,
              html: practitionerTemplate.html,
            }),
          });

          await sendCmsEmail({
            req,
            settings,
            message: buildTemplateEmailMessage(requesterTemplate, {
              to: requesterEmail,
              from,
              replyTo: eftmraEmail,
              subject: requesterTemplate.subject,
              text: requesterTemplate.text,
              html: requesterTemplate.html,
            }),
          });
        } catch (error) {
          req.payload.logger.error("Failed to send practitioner contact emails.");
          req.payload.logger.error(error);
        }
      },
    ],
  },
  fields: [
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      required: true,
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Closed", value: "closed" },
      ],
    },
    { name: "fullName", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text", required: true },
    { name: "agree", type: "checkbox", required: true },
    { name: "practitionerName", type: "text", required: true },
    {
      name: "practitioner",
      type: "relationship",
      relationTo: "practitioners",
      required: true,
    },
    { name: "siteSlug", type: "text" },
    {
      name: "submittedAt",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
  ],
};
