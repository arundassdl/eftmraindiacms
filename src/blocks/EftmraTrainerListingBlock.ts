import type { Block } from "payload";

export const EftmraTrainerListingBlock: Block = {
  slug: "eftmra-trainer-listing",
  labels: {
    singular: "Trainer Listing",
    plural: "Trainer Listings",
  },
  fields: [
    { name: "eyebrow", type: "text", defaultValue: "Meet the Trainers" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "showOnlyEnabled",
      label: "Show only enabled trainers",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "When enabled, only trainers with Show in Homepage Team Members checked are displayed.",
      },
    },
    {
      name: "limit",
      type: "number",
      defaultValue: 12,
      min: 1,
      max: 100,
      admin: {
        description: "Maximum number of trainer cards to display.",
      },
    },
    {
      name: "sort",
      type: "select",
      defaultValue: "displayOrder",
      options: [
        { label: "Display order", value: "displayOrder" },
        { label: "Name", value: "name" },
      ],
    },
  ],
};
