import type { CollectionConfig } from "payload";

export const EmailTemplates: CollectionConfig = {
  slug: "email-templates",
  labels: {
    singular: "Email Template",
    plural: "Email Templates",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "templateType", "enabled", "updatedAt"],
    group: "Settings",
    description: "Manage reusable email subjects and bodies. Use variables such as {{requesterName}}.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Stable key used by the website, for example practitioner-contact-notification.",
      },
    },
    {
      name: "templateType",
      type: "select",
      defaultValue: "notification",
      required: true,
      options: [
        { label: "Notification", value: "notification" },
        { label: "Confirmation", value: "confirmation" },
        { label: "Operational", value: "operational" },
      ],
    },
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Internal note for admins.",
      },
    },
    {
      name: "availableVariables",
      type: "textarea",
      admin: {
        description: "Internal reference. Example: requesterName, requesterEmail, practitionerName.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "toEmail",
          type: "text",
          admin: {
            description: "Optional default recipient. Supports template variables.",
            width: "50%",
          },
        },
        {
          name: "ccEmail",
          type: "text",
          admin: {
            description: "Optional comma-separated CC recipients. Supports template variables.",
            width: "50%",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "bccEmail",
          type: "text",
          admin: {
            description: "Optional comma-separated BCC recipients. Supports template variables.",
            width: "50%",
          },
        },
        {
          name: "replyToEmail",
          type: "text",
          admin: {
            description: "Optional Reply-To recipient. Supports template variables.",
            width: "50%",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "senderName",
          type: "text",
          admin: {
            description: "Optional sender name override.",
            width: "50%",
          },
        },
        {
          name: "senderEmail",
          type: "email",
          admin: {
            description: "Optional sender email override.",
            width: "50%",
          },
        },
      ],
    },
    {
      name: "subject",
      type: "text",
      required: true,
      admin: {
        description: "Variables are written as {{variableName}}.",
      },
    },
    {
      name: "preheader",
      type: "text",
      admin: {
        description: "Optional preview text used in inboxes.",
      },
    },
    {
      name: "html",
      type: "code",
      label: "Template Body / HTML Content",
      required: true,
      admin: {
        description: "HTML body. Variables are escaped before rendering.",
        language: "html",
      },
    },
    {
      name: "text",
      type: "textarea",
      admin: {
        description: "Optional plain-text body. If empty, a readable text version is generated from HTML.",
      },
    },
  ],
};
