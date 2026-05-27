import type { Block } from "payload";

export const EftmraPathwayBlock: Block = {
  slug: "eftmra-pathway",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "steps",
      type: "array",
      minRows: 1,
      maxRows: 8,
      fields: [
        { name: "marker", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "subtitle", type: "text" },
        { name: "description", type: "textarea", required: true },
        { name: "meta", type: "text" },
        { name: "badge", type: "text" },
        {
          name: "tone",
          type: "select",
          defaultValue: "default",
          options: [
            { label: "Default", value: "default" },
            { label: "Amber", value: "amber" },
          ],
        },
      ],
    },
    { name: "advancedTrackLabel", type: "text" },
    { name: "audienceTitle", type: "text" },
    {
      name: "audienceItems",
      type: "array",
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
      ],
    },
    {
      name: "audienceCTA",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
  ],
};
