import type { GlobalConfig } from "payload";

export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Footer",
   admin: {
    group: "Content & Site",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "backgroundColor",
      type: "text",
      defaultValue: "#1A3B4C",
    },
    {
      name: "textColor",
      type: "text",
      defaultValue: "#FFFFFF",
    },
    {
      name: "logoText",
      type: "text",
      defaultValue: "EFTMRA India",
    },
    {
      name: "logoImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "logoHref",
      type: "text",
      defaultValue: "/",
    },
    {
      name: "tagline",
      type: "textarea",
      defaultValue: "India's leading EFT academy, training and certifying practitioners to global standards.",
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
          name: "content",
          type: "textarea",
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
      defaultValue: "© {Y} EFTMRA India. All rights reserved.",
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
            { label: "WhatsApp", value: "whatsapp" },
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
};
