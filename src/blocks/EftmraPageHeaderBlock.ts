import type { Block } from "payload";

export const EftmraPageHeaderBlock: Block = {
  slug: "eftmra-page-header",
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
    { name: "description", type: "textarea" },
    {
      name: "body",
      type: "array",
      fields: [{ name: "content", type: "textarea", required: true }],
    },
    {
      name: "stats",
      type: "array",
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    {
      name: "badges",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "tone",
          type: "select",
          defaultValue: "sapphire",
          options: [
            { label: "Sapphire", value: "sapphire" },
            { label: "Amber", value: "amber" },
            { label: "Ice", value: "ice" },
          ],
        },
      ],
    },
    { name: "media", type: "upload", relationTo: "media" },
    { name: "mediaAlt", type: "text" },
    {
      name: "layout",
      type: "select",
      defaultValue: "text",
      options: [
        { label: "Text", value: "text" },
        { label: "Text with Media", value: "media" },
      ],
    },
  ],
};
