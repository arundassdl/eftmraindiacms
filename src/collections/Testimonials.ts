import type { CollectionConfig } from "payload";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  versions: {
    drafts: true,
  },
  labels: {
    singular: "Testimonial",
    plural: "Testimonials",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "featured", "_status", "displayOrder"],
    group: "Social Proof",
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && typeof (data as any).status === "string") {
          return {
            ...(data as any),
            _status: (data as any).status,
          };
        }

        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === "string" && value.trim()) return slugify(value);

            if (typeof data?.name === "string" && data.name.trim()) {
              const suffix = typeof data?.type === "string" ? `-${data.type}` : "";
              return slugify(`${data.name}${suffix}`);
            }

            return value;
          },
        ],
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "published",
      required: true,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
    { name: "site", type: "relationship", relationTo: "sites", required: true },
    {
      name: "type",
      type: "select",
      defaultValue: "written",
      required: true,
      options: [
        { label: "Video", value: "video" },
        { label: "Written", value: "written" },
      ],
    },
    { name: "featured", type: "checkbox", defaultValue: false },
    {
      name: "showOnHomepage",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Enable this testimonial to appear in the dynamic testimonials section on the homepage.",
      },
    },
    { name: "displayOrder", type: "number", defaultValue: 0 },
    { name: "roleLabel", type: "text", required: true },
    { name: "authorImage", type: "upload", relationTo: "media" },
    {
      name: "quote",
      type: "textarea",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "written",
      },
    },
    {
      name: "rating",
      type: "number",
      min: 1,
      max: 5,
      defaultValue: 5,
      admin: {
        condition: (_, siblingData) => siblingData?.type === "written",
      },
    },
    {
      name: "videoUrl",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "video",
      },
    },
    {
      name: "videoLabel",
      type: "text",
      defaultValue: "Video testimonials coming soon",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "video",
      },
    },
    {
      name: "thumbnailImage",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "video",
      },
    },
    {
      name: "thumbnailAlt",
      type: "text",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "video",
      },
    },
  ],
};
