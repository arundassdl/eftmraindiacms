import type { Block } from "payload";

export const EftmraTrustStripBlock: Block = {
  slug: "eftmra-trust-strip",
  fields: [
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
  ],
};
