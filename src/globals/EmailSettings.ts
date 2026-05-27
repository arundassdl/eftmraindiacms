import type { GlobalConfig } from "payload";

export const EmailSettings: GlobalConfig = {
  slug: "email-settings",
  label: "Email Settings",
  admin: {
    group: "Settings",
    description: "Configure email delivery and sender settings.",
  },
  fields: [
    {
      type: "tabs",
      admin: {
        className: "eftmra-settings-tabs",
      },
      tabs: [
        {
          label: "General",
          fields: [
            {
              type: "collapsible",
              label: "Primary information",
              admin: {
                className: "eftmra-materio-card",
                initCollapsed: true,
              },
              fields: [
                {
                  name: "enabled",
                  type: "checkbox",
                  defaultValue: true,
                  admin: {
                    className: "eftmra-email-settings-field",
                    description: "Turn off to save submissions without sending notification emails.",
                  },
                },
              ],
            },
            {
              type: "collapsible",
              label: "Delivery accounts",
              admin: {
                className: "eftmra-materio-card",
                initCollapsed: false,
              },
              fields: [
                {
                  name: "resendApiKey",
                  type: "text",
                  admin: {
                    className: "eftmra-email-settings-field",
                    description: "Legacy fallback. Prefer adding a Resend account below. If blank, RESEND_API_KEY from the environment is used.",
                  },
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "fromName",
                      type: "text",
                      defaultValue: "EFTMRA India",
                      required: true,
                      admin: {
                        className: "eftmra-email-settings-field",
                        width: "50%",
                      },
                    },
                    {
                      name: "fromEmail",
                      type: "email",
                      defaultValue: "hello@eftmraindia.com",
                      required: true,
                      admin: {
                        className: "eftmra-email-settings-field",
                        width: "50%",
                      },
                    },
                  ],
                },
                {
                  name: "eftmraIndiaEmail",
                  type: "email",
                  defaultValue: "hello@eftmraindia.com",
                  required: true,
                  admin: {
                    className: "eftmra-email-settings-field",
                    description: "Used as the CC address for practitioner contact requests.",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Practitioner Contact",
          fields: [
            {
              type: "collapsible",
              label: "Notification subjects",
              admin: {
                className: "eftmra-materio-card",
                initCollapsed: false,
              },
              fields: [
                {
                  name: "practitionerNotificationSubject",
                  type: "text",
                  defaultValue: "New practitioner contact request: {{practitionerName}}",
                  required: true,
                  admin: {
                    className: "eftmra-email-settings-field",
                    description: "Available variables: {{practitionerName}}, {{requesterName}}",
                  },
                },
                {
                  name: "requesterConfirmationSubject",
                  type: "text",
                  defaultValue: "Contact details for {{practitionerName}}",
                  required: true,
                  admin: {
                    className: "eftmra-email-settings-field",
                    description: "Available variables: {{practitionerName}}, {{requesterName}}",
                  },
                },
              ],
            },
            {
              type: "collapsible",
              label: "Email copy",
              admin: {
                className: "eftmra-materio-card",
                initCollapsed: false,
              },
              fields: [
                {
                  name: "requesterIntro",
                  type: "textarea",
                  defaultValue: "Thank you for contacting {{practitionerName}}.",
                  admin: {
                    className: "eftmra-email-settings-field",
                    description: "Shown at the top of the email sent to the submitted user.",
                  },
                },
                {
                  name: "practitionerIntro",
                  type: "textarea",
                  defaultValue: "New contact request for {{practitionerName}}.",
                  admin: {
                    className: "eftmra-email-settings-field",
                    description: "Shown at the top of the email sent to the practitioner.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
