import type { Block } from "payload";

export const EftmraProfileHeroBlock: Block = {
  slug: "eftmra-profile-hero",
  fields: [
    {
      name: "breadcrumbs",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text" },
      ],
    },
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "tagline", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "imageAlt", type: "text" },
    { name: "badge", type: "text" },
    {
      name: "chips",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
  ],
};
