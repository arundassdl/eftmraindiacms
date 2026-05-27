import type { CollectionConfig } from "payload";

import { sendCmsEmail } from "../email/send";
import { buildTemplateEmailMessage, renderEmailTemplate } from "../email/templates";

type EmailSettings = {
  eftmraIndiaEmail?: string | null;
  enabled?: boolean | null;
  fromEmail?: string | null;
  fromName?: string | null;
  resendApiKey?: string | null;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSeedImport(req: any) {
  return req.context?.seedImport === true;
}

export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    useAsTitle: "email",
    group: "Content & Site",
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
          req.payload.logger.info("Lead notification emails are disabled in Email Settings.");
          return;
        }

        const adminEmail =
          settings?.eftmraIndiaEmail || process.env.EFTMRA_INDIA_EMAIL || process.env.CMS_ADMIN_EMAIL || "hello@eftmraindia.com";
        const fromEmail = settings?.fromEmail || process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";
        const fromName = settings?.fromName || process.env.EMAIL_FROM_NAME || "EFTMRA India";
        const from = `${fromName} <${fromEmail}>`;
        const leadName = doc.name || "";
        const leadEmail = doc.email || "";
        const leadMessage = doc.message || "";
        const siteSlug = doc.siteSlug || "";
        const isTrainerContact = siteSlug?.startsWith("trainer-contact/");
        const trainerEmailLine = String(leadMessage)
          .split("\n")
          .find((line) => line.toLowerCase().startsWith("trainer email:"));
        const trainerEmail = trainerEmailLine?.split(":").slice(1).join(":").trim() || "";
        const shouldEmailTrainer = isTrainerContact && isValidEmail(trainerEmail);
        const primaryRecipientEmail = shouldEmailTrainer ? trainerEmail : adminEmail;
        const template = await renderEmailTemplate({
          req,
          slug: "simple-form-notification",
          variables: {
            adminEmail: primaryRecipientEmail,
            formName: isTrainerContact ? "Trainer contact" : "Website enquiry",
            submitterName: leadName,
            submitterEmail: leadEmail,
            submitterPhone: "",
            source: siteSlug,
            message: leadMessage,
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

        try {
          await sendCmsEmail({
            req,
            settings,
            message: buildTemplateEmailMessage(template, {
              to: primaryRecipientEmail,
              cc: shouldEmailTrainer ? adminEmail : undefined,
              from,
              replyTo: leadEmail,
              subject: template.subject,
              text: template.text,
              html: template.html,
            }),
          });
        } catch (error) {
          req.payload.logger.error("Failed to send lead notification email.");
          req.payload.logger.error(error);
        }
      },
    ],
  },

  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "message", type: "textarea" },
    { name: "siteSlug", type: "text" },
  ],
};
