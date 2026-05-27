import type { Block } from "payload";

export const EftmraTestimonialsBlock: Block = {
  slug: "eftmra-testimonials",
  fields: [
    {
      name: "showSection",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Toggle this testimonials section on or off without removing the block from the page.",
      },
    },
    {
      name: "useDynamicHomepageTestimonials",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Use published testimonials marked for the homepage from the Testimonials collection.",
      },
    },
    {
      name: "backgroundColor",
      type: "text",
      admin: {
        description: "Optional CSS background value for this section, such as #ffffff or var(--eftmra-haze).",
      },
    },
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    {
      name: "testimonials",
      type: "array",
      minRows: 1,
      maxRows: 6,
      admin: {
        condition: (_, siblingData) => !siblingData?.useDynamicHomepageTestimonials,
        description: "Manual fallback testimonials used when dynamic homepage testimonials are turned off.",
      },
      fields: [
        { name: "quote", type: "textarea", required: true },
        { name: "authorName", type: "text", required: true },
        { name: "authorRole", type: "text" },
        { name: "authorImage", type: "upload", relationTo: "media" },
        { name: "rating", type: "number", min: 1, max: 5, defaultValue: 5 },
      ],
    },
  ],
};
