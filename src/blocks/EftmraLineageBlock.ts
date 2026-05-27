import type { Block } from "payload";

export const EftmraLineageBlock: Block = {
  slug: "eftmra-lineage",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    {
      name: "nodes",
      type: "array",
      minRows: 1,
      fields: [
        { name: "initials", type: "text", required: true },
        { name: "name", type: "text", required: true },
        { name: "role", type: "textarea", required: true },
        {
          name: "tone",
          type: "select",
          defaultValue: "sapphire",
          options: [
            { label: "Sapphire", value: "sapphire" },
            { label: "Amber", value: "amber" },
            { label: "Midnight", value: "midnight" },
            { label: "Ice", value: "ice" },
          ],
        },
        { name: "tag", type: "text" },
        { name: "connectorLabel", type: "text" },
      ],
    },
    {
      name: "badges",
      type: "array",
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media" },
        { name: "imageAlt", type: "text" },
        { name: "level", type: "text" },
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
      ],
    },
    {
      name: "certificates",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media" },
        { name: "imageAlt", type: "text" },
      ],
    },
  ],
};
