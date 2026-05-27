import type { Block } from "payload";

export const CTAFormBlock: Block = {
  slug: "ctaForm",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "buttonLabel", type: "text" },
  ],
};
