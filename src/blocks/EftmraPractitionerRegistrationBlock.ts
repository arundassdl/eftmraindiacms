import type { Block } from "payload";

export const EftmraPractitionerRegistrationBlock: Block = {
  slug: "eftmra-practitioner-registration",
  fields: [
    {
      name: "steps",
      type: "array",
      minRows: 3,
      maxRows: 3,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "sublabel", type: "text", required: true },
      ],
    },
    { name: "successTitle", type: "text" },
    { name: "successMessage", type: "textarea" },
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
    },
  ],
};
