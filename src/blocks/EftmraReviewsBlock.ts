import type { Block } from "payload";

export const EftmraReviewsBlock: Block = {
  slug: "eftmra-reviews",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "summaryScore", type: "text" },
    { name: "summaryCount", type: "text" },
    {
      name: "reviews",
      type: "array",
      minRows: 1,
      fields: [
        { name: "authorName", type: "text", required: true },
        { name: "authorRole", type: "text" },
        { name: "dateLabel", type: "text" },
        { name: "quote", type: "textarea", required: true },
        { name: "rating", type: "number", defaultValue: 5, min: 1, max: 5 },
      ],
    },
  ],
};
