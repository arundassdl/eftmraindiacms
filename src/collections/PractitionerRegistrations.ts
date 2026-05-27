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

export const PractitionerRegistrations: CollectionConfig = {
  slug: "practitioner-registrations",
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "phone", "category", "city", "submittedAt", "status"],
    group: "Practitioners",
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
          req.payload.logger.info("Practitioner registration emails are disabled in Email Settings.");
          return;
        }

        const adminEmail =
          settings?.eftmraIndiaEmail || process.env.EFTMRA_INDIA_EMAIL || process.env.CMS_ADMIN_EMAIL || "hello@eftmraindia.com";
        const fromEmail = settings?.fromEmail || process.env.EMAIL_FROM_ADDRESS || "hello@eftmraindia.com";
        const fromName = settings?.fromName || process.env.EMAIL_FROM_NAME || "EFTMRA India";
        const from = `${fromName} <${fromEmail}>`;
        const variables = {
          adminEmail,
          formName: "Practitioner registration",
          submitterName: doc.fullName || "",
          submitterEmail: doc.email || "",
          submitterPhone: doc.phone || "",
          source: doc.category || "",
          message: [
            doc.city ? `City: ${doc.city}` : "",
            doc.state ? `State: ${doc.state}` : "",
            doc.country ? `Country: ${doc.country}` : "",
            doc.membershipNumber ? `Membership: ${doc.membershipNumber}` : "",
            doc.certificationYear ? `Certification year: ${doc.certificationYear}` : "",
          ].filter(Boolean).join("\n"),
        };
        const notificationTemplate = await renderEmailTemplate({
          req,
          slug: "simple-form-notification",
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
          slug: "practitioner-registration-confirmation",
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
              to: adminEmail,
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
              cc: adminEmail,
              from,
              replyTo: adminEmail,
              subject: confirmationTemplate.subject,
              text: confirmationTemplate.text,
              html: confirmationTemplate.html,
            }),
          });
        } catch (error) {
          req.payload.logger.error("Failed to send practitioner registration emails.");
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
        { label: "In Review", value: "in-review" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    { name: "fullName", type: "text", required: true },
    { name: "firstName", type: "text" },
    { name: "lastName", type: "text" },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text", required: true },
    { name: "whatsapp", type: "text" },
    { name: "profileTagline", type: "text" },
    { name: "professionalBio", type: "textarea" },
    { name: "website", type: "text" },
    { name: "linkedin", type: "text" },
    { name: "instagram", type: "text" },
    { name: "facebook", type: "text" },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "EFT Practitioner (Level 1 & 2)", value: "eft-practitioner" },
        { label: "EFT Advanced Practitioner (Level 3)", value: "eft-advanced" },
        { label: "Matrix Reimprinting Practitioner", value: "matrix" },
      ],
    },
    { name: "membershipNumber", type: "text" },
    { name: "certificationYear", type: "text" },
    {
      name: "profilePhoto",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Profile image uploaded from the registration form.",
      },
    },
    {
      name: "profilePhotoFileName",
      type: "text",
      admin: {
        description: "Original uploaded file name retained for reference.",
      },
    },
    {
      name: "certificateFile",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Primary EFTMRA certificate uploaded from the registration form.",
      },
    },
    {
      name: "certificateFileName",
      type: "text",
      admin: {
        description: "Original uploaded file name retained for reference.",
      },
    },
    { name: "prerequisiteL12MembershipNumber", type: "text" },
    { name: "prerequisiteL12CertificationYear", type: "text" },
    {
      name: "prerequisiteL12CertificateFile",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "EFT Level 1 & 2 prerequisite certificate uploaded for verification.",
      },
    },
    {
      name: "prerequisiteL12CertificateFileName",
      type: "text",
      admin: {
        description: "Original uploaded file name retained for reference.",
      },
    },
    { name: "prerequisiteL3MembershipNumber", type: "text" },
    { name: "prerequisiteL3CertificationYear", type: "text" },
    {
      name: "prerequisiteL3CertificateFile",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optional EFT Level 3 prerequisite certificate uploaded for verification.",
      },
    },
    {
      name: "prerequisiteL3CertificateFileName",
      type: "text",
      admin: {
        description: "Original uploaded file name retained for reference.",
      },
    },
    {
      name: "uploadedMediaPreview",
      type: "ui",
      admin: {
        components: {
          Field: "./src/components/admin/RegistrationMediaPreview.tsx#default",
        },
      },
    },
    { name: "city", type: "text", required: true },
    { name: "state", type: "text" },
    { name: "country", type: "text" },
    { name: "timezone", type: "text" },
    { name: "availabilityStart", type: "text" },
    { name: "availabilityEnd", type: "text" },
    { name: "sessionFee", type: "text" },
    { name: "currencySymbol", type: "text" },
    { name: "currencyCode", type: "text" },
    { name: "modeOfPractice", type: "text" },
    {
      name: "languages",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "specialties",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    { name: "declarationAccepted", type: "checkbox", required: true },
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
    {
      name: "practitioner",
      type: "relationship",
      relationTo: "practitioners",
    },
    { name: "notes", type: "textarea" },
  ],
};
