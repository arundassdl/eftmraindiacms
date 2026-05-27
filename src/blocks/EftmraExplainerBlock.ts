import type { Block } from "payload";

export const EftmraExplainerBlock: Block = {
  slug: "eftmra-explainer",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "scienceLink",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
    {
      name: "scienceCards",
      type: "array",
      minRows: 1,
      maxRows: 4,
      fields: [
        { name: "number", type: "text", required: true },
        { name: "metric", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        {
          name: "accent",
          type: "select",
          defaultValue: "blue",
          options: [
            { label: "Blue", value: "blue" },
            { label: "Amber", value: "amber" },
          ],
        },
      ],
    },
    { name: "conditionsLabel", type: "text" },
    {
      name: "conditions",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
  ],
};
