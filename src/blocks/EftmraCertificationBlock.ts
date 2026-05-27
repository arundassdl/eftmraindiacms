import type { Block } from "payload";

const linkFields = [
  { name: "label", type: "text" as const },
  { name: "href", type: "text" as const },
];

export const EftmraCertificationBlock: Block = {
  slug: "eftmra-certification",
  fields: [
    { name: "introEyebrow", type: "text" },
    { name: "introTitle", type: "text", required: true },
    { name: "introDescription", type: "textarea" },
    { name: "introImage", type: "upload", relationTo: "media" },
    { name: "introImageAlt", type: "text" },
    {
      name: "highlights",
      type: "array",
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: "number", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
      ],
    },
    { name: "missionEyebrow", type: "text" },
    { name: "missionTitle", type: "text", required: true },
    {
      name: "missionParagraphs",
      type: "array",
      minRows: 1,
      fields: [{ name: "content", type: "textarea", required: true }],
    },
    { name: "missionEmphasis", type: "text" },
    {
      name: "primaryCTA",
      type: "group",
      fields: linkFields,
    },
    {
      name: "secondaryCTA",
      type: "group",
      fields: linkFields,
    },
    {
      name: "useDynamicTrainerListing",
      label: "Use dynamic trainer listing",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "When enabled, the Leadership & Expertise grid is populated from the Trainers collection.",
      },
    },
    {
      name: "showOnlyEnabledTrainers",
      label: "Show only enabled trainers",
      type: "checkbox",
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.useDynamicTrainerListing !== false,
        description: "Only include trainers with Show in Homepage Team Members checked.",
      },
    },
    {
      name: "trainerLimit",
      label: "Trainer limit",
      type: "number",
      defaultValue: 12,
      min: 1,
      max: 100,
      admin: {
        condition: (_, siblingData) => siblingData?.useDynamicTrainerListing !== false,
      },
    },
    {
      name: "trainerSort",
      label: "Trainer sort",
      type: "select",
      defaultValue: "displayOrder",
      admin: {
        condition: (_, siblingData) => siblingData?.useDynamicTrainerListing !== false,
      },
      options: [
        { label: "Display order", value: "displayOrder" },
        { label: "Name", value: "name" },
      ],
    },
    {
      name: "teamMembers",
      type: "array",
      maxRows: 12,
      admin: {
        condition: (_, siblingData) => siblingData?.useDynamicTrainerListing === false,
        description: "Fallback manual team cards used only when dynamic trainer listing is disabled.",
      },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "role", type: "text", required: true },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "profileHref", type: "text", admin: { description: "Optional override. Defaults to /trainers/name-slug on the frontend." } },
      ],
    },
  ],
};
