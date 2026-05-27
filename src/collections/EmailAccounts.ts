import type { CollectionConfig } from "payload";

export const EmailAccounts: CollectionConfig = {
  slug: "email-accounts",
  labels: {
    singular: "Email Account",
    plural: "Email Accounts",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "provider", "authMode", "fromEmail", "useAsDefault", "enabled"],
    group: "Settings",
    description: "Configure SMTP and API-key email providers used by website forms and CMS email delivery.",
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "label", type: "text", required: true, admin: { width: "40%" } },
        {
          name: "provider",
          type: "select",
          defaultValue: "resend",
          required: true,
          options: [
            { label: "Gmail", value: "gmail" },
            { label: "Yahoo", value: "yahoo" },
            { label: "Outlook / Microsoft 365", value: "outlook" },
            { label: "Yandex", value: "yandex" },
            { label: "SendGrid", value: "sendgrid" },
            { label: "Resend", value: "resend" },
            { label: "SparkPost", value: "sparkpost" },
            { label: "Nodemailer / Custom SMTP", value: "nodemailer" },
            { label: "Postmark", value: "postmark" },
          ],
          admin: { width: "30%" },
        },
        {
          name: "authMode",
          type: "select",
          defaultValue: "api-key",
          required: true,
          options: [
            { label: "API Key", value: "api-key" },
            { label: "SMTP Account", value: "smtp" },
          ],
          admin: { width: "30%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "useAsDefault", type: "checkbox", defaultValue: false, admin: { width: "50%" } },
        { name: "enabled", type: "checkbox", defaultValue: true, admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "fromName",
          type: "text",
          admin: { description: "Sender name override for this account.", width: "50%" },
        },
        {
          name: "fromEmail",
          type: "email",
          admin: { description: "Sender email override for this account.", width: "50%" },
        },
      ],
    },
    {
      name: "apiKey",
      type: "text",
      admin: {
        description: "Used by Resend, SendGrid, SparkPost, and Postmark.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "username",
          type: "text",
          admin: { description: "SMTP username. Gmail, Yahoo, Outlook, and Yandex usually require app passwords.", width: "50%" },
        },
        {
          name: "password",
          type: "text",
          admin: { description: "SMTP password or app password.", width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "smtpHost",
          type: "text",
          admin: { description: "Required for Nodemailer / Custom SMTP or provider override.", width: "50%" },
        },
        { name: "port", type: "number", admin: { width: "25%" } },
        {
          name: "secure",
          type: "checkbox",
          admin: { description: "Use TLS. Leave unset to use provider defaults.", width: "25%" },
        },
      ],
    },
  ],
};
