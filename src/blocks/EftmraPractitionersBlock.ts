import type { Block } from "payload";

export const EftmraPractitionersBlock: Block = {
  slug: "eftmra-practitioners",
  fields: [
    {
      name: "showSection",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Toggle this practitioner section on or off without removing it from the page.",
      },
    },
    {
      name: "useDynamicHomepagePractitioners",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Use published practitioners marked for the homepage from the Practitioners collection.",
      },
    },
    {
      name: "homepagePractitionerCount",
      type: "number",
      defaultValue: 9,
      min: 1,
      max: 12,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.useDynamicHomepagePractitioners && siblingData?.layoutVariant !== "directory",
        description: "Number of homepage practitioners to show when using dynamic practitioners.",
      },
    },
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "layoutVariant",
      type: "select",
      defaultValue: "teaser",
      options: [
        { label: "Teaser", value: "teaser" },
        { label: "Directory", value: "directory" },
      ],
    },
    {
      name: "cta",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
    {
      name: "registerCTA",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
    {
      name: "practitioners",
      dbName: "pracs",
      type: "array",
      minRows: 1,
      maxRows: 12,
      admin: {
        condition: (_, siblingData) => !siblingData?.useDynamicHomepagePractitioners,
        description: "Manual fallback practitioners used when dynamic homepage practitioners are turned off.",
      },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "role", type: "text", required: true },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "profileHref", type: "text" },
        { name: "category", type: "text" },
        { name: "categoryLabel", type: "text" },
        { name: "cityKey", type: "text" },
        { name: "cityLabel", type: "text" },
        {
          name: "specialties",
          dbName: "specs",
          type: "array",
          fields: [{ name: "label", type: "text", required: true }],
        },
        { name: "hours", type: "text" },
        { name: "rating", type: "number" },
        { name: "reviews", type: "number" },
        {
          name: "accent",
          type: "select",
          defaultValue: "deep-teal",
          options: [
            { label: "Deep Teal", value: "deep-teal" },
            { label: "Sapphire", value: "sapphire" },
            { label: "Amber", value: "amber" },
            { label: "Calm Sky", value: "calm-sky" },
            { label: "Teal Gold", value: "teal-gold" },
            { label: "Ice Teal", value: "ice-teal" },
          ],
        },
      ],
    },
  ],
};
