import type { Block } from "payload";

export const EftmraContentSectionBlock: Block = {
  slug: "eftmra-content-section",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "paragraphs",
      type: "array",
      minRows: 1,
      fields: [{ name: "content", type: "textarea", required: true }],
    },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "checklist",
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
            { label: "Midnight", value: "midnight" },
          ],
        },
      ],
    },
  ],
};
