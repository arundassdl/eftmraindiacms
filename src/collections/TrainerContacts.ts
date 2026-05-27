import type { CollectionConfig } from "payload";

import { sendCmsEmail } from "../email/send";
import { buildTemplateEmailMessage, renderEmailTemplate } from "../email/templates";

function getRelationshipId(value: unknown) {
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
  resendApiKey?: string | null;
};

export const TrainerContacts: CollectionConfig = {
  slug: "trainer-contacts",
  labels: {
    singular: "Trainer Contact",
    plural: "Trainer Contacts",
  },
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "phone", "trainerName", "submittedAt", "status"],
    group: "Trainings",
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return;
        if (isSeedImport(req)) return;

        const trainerId = getRelationshipId(doc.trainer);
        const trainer = trainerId
          ? await req.payload.findByID({
              collection: "trainers",
              id: trainerId,
              depth: 0,
              overrideAccess: true,
              req,
            }).catch(() => null)
          : null;

        const trainerName = trainer?.name || doc.trainerName || "EFTMRA trainer";
        const trainerEmail = trainer?.email || doc.trainerEmail || "";
        const requesterName = doc.fullName || "";
        const requesterEmail = doc.email || "";
        const requesterPhone = doc.phone || "";
        const message = doc.message || "";
        const settings = (await req.payload
          .findGlobal({
            slug: "email-settings",
            depth: 0,
            overrideAccess: true,
            req,
          })
          .catch(() => null)) as EmailSettings | null;
        const emailEnabled = settings?.enabled !== false;

        if (!emailEnabled) {
          req.payload.logger.info("Trainer contact emails are disabled in Email Settings.");
          return;
        }

        const eftmraEmail =
          settings?.eftmraIndiaEmail || process.env.EFTMRA_INDIA_EMAIL || process.env.CMS_ADMIN_EMAIL || "hello@eftmraindia.com";
        const fromEmail = settings?.fromEmail || process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";
        const fromName = settings?.fromName || process.env.EMAIL_FROM_NAME || "EFTMRA India";
        const from = `${fromName} <${fromEmail}>`;
        const template = await renderEmailTemplate({
          req,
          slug: "trainer-contact-notification",
          variables: {
            adminEmail: eftmraEmail,
            formName: "Trainer contact",
            submitterName: requesterName,
            submitterEmail: requesterEmail,
            submitterPhone: requesterPhone,
            source: trainerName,
            message,
            trainerName,
            trainerEmail,
            requesterName,
            requesterEmail,
            requesterPhone,
          },
          fallback: {
            subject: "New {{formName}} submission",
            text: [
              "A new {{formName}} form was submitted.",
              "",
              "Name: {{submitterName}}",
              "Email: {{submitterEmail}}",
              "Phone: {{submitterPhone}}",
              "Source: {{source}}",
              "",
              "{{message}}",
            ].join("\n"),
            html: `
          <p>A new {{formName}} form was submitted.</p>
          <p><strong>Name:</strong> {{submitterName}}<br /><strong>Email:</strong> {{submitterEmail}}<br /><strong>Phone:</strong> {{submitterPhone}}<br /><strong>Source:</strong> {{source}}</p>
          <p style="white-space: pre-line;">{{message}}</p>
        `,
          },
        });
        const requesterTemplate = await renderEmailTemplate({
          req,
          slug: "trainer-contact-confirmation",
          variables: {
            adminEmail: eftmraEmail,
            formName: "Trainer contact",
            submitterName: requesterName,
            submitterEmail: requesterEmail,
            submitterPhone: requesterPhone,
            source: trainerName,
            message,
            trainerName,
            trainerEmail: trainerEmail || "Not provided",
          },
          fallback: {
            subject: "Contact details for {{trainerName}}",
            text: [
              "Thank you for contacting {{trainerName}}.",
              "",
              "Trainer contact details:",
              "Email: {{trainerEmail}}",
            ].join("\n"),
            html: `
          <p>Thank you for contacting {{trainerName}}.</p>
          <p>Trainer contact details:</p>
          <ul>
            <li><strong>Email:</strong> {{trainerEmail}}</li>
          </ul>
        `,
          },
        });

        try {
          await sendCmsEmail({
            req,
            settings,
            message: buildTemplateEmailMessage(template, {
              to: trainerEmail || eftmraEmail,
              cc: trainerEmail ? eftmraEmail : undefined,
              from,
              replyTo: requesterEmail,
              subject: template.subject,
              text: template.text,
              html: template.html,
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
          req.payload.logger.error("Failed to send trainer contact email.");
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
    { name: "message", type: "textarea", required: true },
    { name: "agree", type: "checkbox", required: true },
    { name: "trainerName", type: "text", required: true },
    { name: "trainerEmail", type: "email" },
    {
      name: "trainer",
      type: "relationship",
      relationTo: "trainers",
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
