import type { Block } from "payload";

const linkFields = [
  { name: "label", type: "text" as const },
  { name: "href", type: "text" as const },
];

export const EftmraHeroBlock: Block = {
  slug: "eftmra-hero",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "titleHighlight", type: "text" },
    { name: "description", type: "textarea" },
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
      name: "videoLink",
      type: "group",
      fields: linkFields,
    },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "heroImageAlt", type: "text" },
  ],
};
