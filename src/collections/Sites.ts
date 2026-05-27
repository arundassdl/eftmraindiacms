import type { CollectionConfig } from "payload";

export const Sites: CollectionConfig = {
  slug: "sites",
  admin: {
    useAsTitle: "name",
    group: "Content & Site",
  },

  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "domain", type: "text" },
    {
      name: "layoutType",
      type: "select",
      required: true,
      defaultValue: "platform-home",
      options: [
        { label: "Platform Home", value: "platform-home" },
        { label: "Product CRM", value: "product-crm" },
        { label: "Product Generic", value: "product-generic" },
      ],
    },
    {
      name: "theme",
      type: "group",
      fields: [
        {
          name: "preset",
          type: "select",
          defaultValue: "main",
          options: [
            { label: "Platform", value: "main" },
            { label: "CRM", value: "crm" },
            { label: "EFTMRA Editorial", value: "eftmra" },
          ],
          admin: {
            description: "Choose a curated theme preset, then optionally override individual tokens below.",
          },
        },
        {
          name: "primaryColor",
          type: "text",
          admin: {
            description: "Core brand color token. Example: #5B67F1",
          },
        },
        {
          name: "secondaryColor",
          type: "text",
          admin: {
            description: "Secondary brand color token used for headings and navigation.",
          },
        },
        {
          name: "accentColor",
          type: "text",
        },
        {
          name: "surfaceColor",
          type: "text",
        },
        {
          name: "textColor",
          type: "text",
        },
        {
          name: "mutedColor",
          type: "text",
        },
        {
          name: "radiusBrand",
          type: "text",
          admin: {
            description: "Brand border radius token, for example 1.25rem.",
          },
        },
        {
          name: "shadowSoft",
          type: "text",
          admin: {
            description: "Brand shadow token, for example 0 16px 40px rgba(21, 30, 55, 0.08).",
          },
        },
        {
          name: "customTokens",
          type: "array",
          labels: {
            singular: "Custom Token",
            plural: "Custom Tokens",
          },
          admin: {
            description: "Creates CSS variables like --theme-color-token-name for site-specific accents.",
          },
          fields: [
            {
              name: "token",
              type: "text",
              required: true,
              validate: (value: string | null | undefined) => {
                if (!value) return "Token name is required.";
                return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
                  ? true
                  : "Use lowercase letters, numbers, and hyphens only.";
              },
            },
            {
              name: "label",
              type: "text",
            },
            {
              name: "value",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "micrositeSubmenu",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
          admin: {
            description: "Optional image alt text for logo.",
          },
        },
        {
          name: "icon",
          type: "select",
          defaultValue: "auto",
          options: [
            { label: "Auto", value: "auto" },
            { label: "CRM", value: "crm" },
            { label: "Generic Product", value: "product" },
            { label: "Platform", value: "platform" },
          ],
        },
        {
          name: "logoImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Optional uploaded logo shown on the left side of the microsite submenu.",
          },
        },
        {
          name: "links",
          type: "array",
          labels: {
            singular: "Submenu Link",
            plural: "Submenu Links",
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
            },
            {
              name: "href",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "footer",
      type: "group",
      admin: {
        description: "Optional site-specific footer override. Leave blank to use the default footer global.",
      },
      fields: [
        {
          name: "backgroundColor",
          type: "text",
          admin: {
            description: "Example: #F7F8FB",
          },
        },
        {
          name: "textColor",
          type: "text",
          admin: {
            description: "Example: #0F172A",
          },
        },
        {
          name: "logoText",
          type: "text",
        },
        {
          name: "logoImage",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "logoHref",
          type: "text",
        },
        {
          name: "tagline",
          type: "textarea",
        },
        {
          name: "columns",
          type: "array",
          labels: {
            singular: "Footer Column",
            plural: "Footer Columns",
          },
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
            },
            {
              name: "links",
              type: "array",
              labels: {
                singular: "Footer Link",
                plural: "Footer Links",
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                },
                {
                  name: "href",
                  type: "text",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: "copyrightText",
          type: "text",
        },
        {
          name: "socialLinks",
          type: "array",
          labels: {
            singular: "Social Link",
            plural: "Social Links",
          },
          fields: [
            {
              name: "platform",
              type: "select",
              required: true,
              options: [
                { label: "LinkedIn", value: "linkedin" },
                { label: "Facebook", value: "facebook" },
                { label: "Instagram", value: "instagram" },
                { label: "YouTube", value: "youtube" },
              ],
            },
            {
              name: "href",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
