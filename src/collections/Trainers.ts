import type { CollectionConfig } from "payload";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Trainers: CollectionConfig = {
  slug: "trainers",
  labels: {
    singular: "Trainer",
    plural: "Trainers",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "status", "showOnHomepage", "displayOrder"],
    group: "Trainings",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Profile",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "status",
                  type: "select",
                  defaultValue: "published",
                  required: true,
                  admin: { width: "33%" },
                  options: [
                    { label: "Draft", value: "draft" },
                    { label: "Published", value: "published" },
                  ],
                },
                {
                  name: "site",
                  type: "relationship",
                  relationTo: "sites",
                  required: true,
                  admin: { width: "33%" },
                },
                {
                  name: "displayOrder",
                  type: "number",
                  defaultValue: 0,
                  admin: { width: "34%" },
                },
              ],
            },
            {
              name: "showOnHomepage",
              label: "Show in Homepage Team Members",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "When enabled, this trainer appears in the homepage Leadership & Expertise team grid.",
              },
            },
            {
              type: "row",
              fields: [
                { name: "name", type: "text", required: true, admin: { width: "50%" } },
                {
                  name: "slug",
                  type: "text",
                  required: true,
                  unique: true,
                  admin: { width: "50%", description: "Auto-generated from name when blank." },
                },
              ],
            },
            { name: "role", type: "text", required: true },
            { name: "tagline", type: "textarea", required: true },
            {
              type: "row",
              fields: [
                { name: "image", type: "upload", relationTo: "media", admin: { width: "50%" } },
                { name: "imageAlt", type: "text", admin: { width: "50%" } },
              ],
            },
          ],
        },
        {
          label: "About",
          fields: [
            { name: "aboutLabel", type: "text", defaultValue: "About" },
            { name: "aboutTitle", type: "text", required: true },
            {
              name: "aboutParagraphs",
              type: "array",
              minRows: 1,
              fields: [{ name: "content", type: "textarea", required: true }],
            },
            {
              name: "credentials",
              type: "array",
              fields: [{ name: "label", type: "text", required: true }],
            },
            {
              name: "specializations",
              type: "array",
              fields: [{ name: "label", type: "text", required: true }],
            },
            { name: "philosophy", type: "textarea" },
          ],
        },
        {
          label: "Contact & Social",
          fields: [
            { name: "email", type: "email", defaultValue: "hello@eftmraindia.com" },
            {
              name: "socialLinks",
              type: "array",
              fields: [
                {
                  name: "platform",
                  type: "select",
                  required: true,
                  options: [
                    { label: "LinkedIn", value: "linkedin" },
                    { label: "Facebook", value: "facebook" },
                    { label: "Instagram", value: "instagram" },
                    { label: "YouTube", value: "youtube" },
                  ],
                },
                { name: "href", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;

        data.slug = typeof data.slug === "string" && data.slug.trim() ? slugify(data.slug) : slugify(data.name || "");
        data.aboutLabel = data.aboutLabel || (data.name ? `About ${String(data.name).split(" ")[0].replace(/^Dr\.?$/i, "")}` : "About");

        return data;
      },
    ],
  },
};
