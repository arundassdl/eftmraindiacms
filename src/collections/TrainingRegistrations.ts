import type { CollectionConfig } from "payload";

import { sendCmsEmail } from "../email/send";
import { buildTemplateEmailMessage, renderEmailTemplate } from "../email/templates";

type EmailSettings = {
  enabled?: boolean | null;
  fromName?: string | null;
  fromEmail?: string | null;
  eftmraIndiaEmail?: string | null;
  resendApiKey?: string | null;
};

function isSeedImport(req: any) {
  return req.context?.seedImport === true;
}

export const TrainingRegistrations: CollectionConfig = {
  slug: "training-registrations",
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "phone", "trainingTitle", "submittedAt", "status"],
    group: "Trainings",
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return;
        if (isSeedImport(req)) return;

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
          req.payload.logger.info("Training registration emails are disabled in Email Settings.");
          return;
        }

        const eftmraEmail =
          settings?.eftmraIndiaEmail || process.env.EFTMRA_INDIA_EMAIL || process.env.CMS_ADMIN_EMAIL || "hello@eftmraindia.com";
        const fromEmail = settings?.fromEmail || process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";
        const fromName = settings?.fromName || process.env.EMAIL_FROM_NAME || "EFTMRA India";
        const from = `${fromName} <${fromEmail}>`;
        const variables = {
          adminEmail: eftmraEmail,
          formName: "Training registration",
          submitterName: doc.fullName || "",
          submitterEmail: doc.email || "",
          submitterPhone: doc.phone || "",
          source: doc.trainingTitle || "EFTMRA training",
          message: [
            doc.city ? `City: ${doc.city}` : "",
            doc.background ? `Background: ${doc.background}` : "",
            doc.source ? `Source: ${doc.source}` : "",
            doc.notes || "",
          ].filter(Boolean).join("\n"),
          trainingTitle: doc.trainingTitle || "EFTMRA training",
          trainingSlug: doc.trainingSlug || "",
          requesterName: doc.fullName || "",
          requesterEmail: doc.email || "",
          requesterPhone: doc.phone || "",
          city: doc.city || "",
          background: doc.background || "",
          registrationSource: doc.source || "",
          notes: doc.notes || "",
        };
        const notificationTemplate = await renderEmailTemplate({
          req,
          slug: "training-registration-notification",
          variables,
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
        const confirmationTemplate = await renderEmailTemplate({
          req,
          slug: "training-registration-confirmation",
          variables,
          fallback: {
            subject: "We received your {{formName}} submission",
            text: [
              "Hi {{submitterName}},",
              "",
              "Thank you for your {{formName}} submission. Our team will review it and contact you with the next steps.",
            ].join("\n"),
            html: `
          <p>Hi {{submitterName}},</p>
          <p>Thank you for your {{formName}} submission. Our team will review it and contact you with the next steps.</p>
        `,
          },
        });

        try {
          await sendCmsEmail({
            req,
            settings,
            message: buildTemplateEmailMessage(notificationTemplate, {
              to: eftmraEmail,
              from,
              replyTo: doc.email,
              subject: notificationTemplate.subject,
              text: notificationTemplate.text,
              html: notificationTemplate.html,
            }),
          });

          await sendCmsEmail({
            req,
            settings,
            message: buildTemplateEmailMessage(confirmationTemplate, {
              to: doc.email,
              cc: eftmraEmail,
              from,
              replyTo: eftmraEmail,
              subject: confirmationTemplate.subject,
              text: confirmationTemplate.text,
              html: confirmationTemplate.html,
            }),
          });
        } catch (error) {
          req.payload.logger.error("Failed to send training registration emails.");
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
        { label: "Confirmed", value: "confirmed" },
        { label: "Waitlist", value: "waitlist" },
        { label: "Closed", value: "closed" },
      ],
    },
    { name: "fullName", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text", required: true },
    { name: "city", type: "text" },
    { name: "background", type: "text", required: true },
    { name: "source", type: "text" },
    { name: "notes", type: "textarea" },
    { name: "acceptedTerms", type: "checkbox", required: true },
    { name: "trainingTitle", type: "text", required: true },
    { name: "trainingSlug", type: "text", required: true },
    {
      name: "training",
      type: "relationship",
      relationTo: "trainings",
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
