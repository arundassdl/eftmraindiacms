import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "tagline", type: "text" },
    { name: "subtitle", type: "textarea" },
    {
      name: "primaryCTA",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
    {
      name: "secondaryCTA",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    }, { name: "backgroundImage", type: "upload", relationTo: "media" },
    {
      name: "collage",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "description", type: "text" },
        {
          name: "color",
          type: "select",
          options: [
            { label: "Blue", value: "blue" },
            { label: "Orange", value: "orange" },
            { label: "Rose", value: "rose" },
            { label: "Emerald", value: "emerald" },
          ],
        },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "icon", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
