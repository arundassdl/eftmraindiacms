import type { Block } from "payload";

export const EftmraMediaRowBlock: Block = {
  slug: "eftmra-media-row",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text" },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "imageAlt", type: "text" },
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
      ],
    },
  ],
};
