import type { Block } from "payload";

export const EftmraCardGridBlock: Block = {
  slug: "eftmra-card-grid",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "variant",
      type: "select",
      defaultValue: "feature",
      options: [
        { label: "Feature", value: "feature" },
        { label: "People", value: "people" },
        { label: "Value", value: "value" },
        { label: "Badge", value: "badge" },
        { label: "Vision Mission", value: "vision-mission" },
        { label: "Video Placeholder", value: "video" },
        { label: "Programme Levels", value: "program-levels" },
      ],
    },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      fields: [
        { name: "number", type: "text" },
        { name: "title", type: "text", required: true },
        { name: "subtitle", type: "text" },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "videoUrl", type: "text" },
        { name: "imageAlt", type: "text" },
        { name: "badge", type: "text" },
        { name: "meta", type: "text" },
        {
          name: "accent",
          type: "select",
          defaultValue: "deep-teal",
          options: [
            { label: "Deep Teal", value: "deep-teal" },
            { label: "Sapphire", value: "sapphire" },
            { label: "Amber", value: "amber" },
            { label: "Ice", value: "ice" },
          ],
        },
      ],
    },
  ],
};
