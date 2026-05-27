import type { Block } from "payload";

export const EftmraTestimonialListingBlock: Block = {
  slug: "eftmra-testimonial-listing",
  fields: [
    {
      name: "breadcrumbs",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text" },
      ],
    },
    { name: "title", type: "text", required: true },
    { name: "description", type: "text" },
    { name: "featuredBadgeLabel", type: "text", defaultValue: "Featured" },
    { name: "videoEyebrow", type: "text", defaultValue: "More Stories" },
    { name: "writtenEyebrow", type: "text", defaultValue: "People who trained with us" },
    { name: "writtenTitle", type: "text", defaultValue: "What our students say" },
    { name: "site", type: "relationship", relationTo: "sites" },
  ],
};
